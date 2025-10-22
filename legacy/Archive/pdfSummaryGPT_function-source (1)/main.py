import base64
import json
import os
import tempfile
import csv
from datetime import datetime

from common import authenticate_google_drive, download_text_file, ensure_summary_folder_exists, generate_summary, \
    upload_file, send_slack_message
from google_cloud_helper import extract_text_from_pdf_with_vision


def extract_startup_info_from_content(content, file_name):
    """
    Extract startup name and founder names from PDF content using Gemini API.
    
    Args:
        content: The extracted text from the PDF
        file_name: The name of the file being processed
    
    Returns:
        Dictionary with startup_name, founders (list), and file_name
    """
    try:
        import google.generativeai as genai
        
        # Initialize Gemini API
        api_key = os.getenv("GEMINI_API_KEY", "")
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable not set")
        
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-pro')
        
        # Create extraction prompt
        extraction_prompt = f"""
        Extract the following information from the provided pitch deck text:
        
        1. Startup Name: The official name of the company/startup
        2. Founder Names: All names of founders mentioned (as a list)
        
        Respond in JSON format:
        {{
            "startup_name": "name of startup",
            "founders": ["founder1", "founder2", ...]
        }}
        
        Text content:
        {content[:4000]}  # Limit to first 4000 chars for API efficiency
        """
        
        response = model.generate_content(extraction_prompt)
        
        # Parse the response
        response_text = response.text.strip()
        
        # Find JSON in response
        start_idx = response_text.find('{')
        end_idx = response_text.rfind('}') + 1
        
        if start_idx != -1 and end_idx > start_idx:
            json_str = response_text[start_idx:end_idx]
            extracted_data = json.loads(json_str)
        else:
            raise ValueError("Could not find JSON in response")
        
        extracted_data["file_name"] = file_name
        return extracted_data
        
    except Exception as e:
        print(f"Error extracting startup info: {e}")
        return {
            "file_name": file_name,
            "startup_name": "Error extracting",
            "founders": []
        }


def append_to_csv(csv_file_path, startup_info):
    """
    Append startup information to CSV file.
    
    Args:
        csv_file_path: Path to the CSV file
        startup_info: Dictionary with file_name, startup_name, and founders
    """
    try:
        # Convert founders list to comma-separated string
        founders_str = ", ".join(startup_info.get("founders", []))
        
        # Check if file exists to determine if we need to write headers
        file_exists = os.path.isfile(csv_file_path)
        
        with open(csv_file_path, 'a' if file_exists else 'w', newline='', encoding='utf-8') as csvfile:
            fieldnames = ['file_name', 'startup_name', 'founders']
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            
            if not file_exists:
                writer.writeheader()
            
            writer.writerow({
                'file_name': startup_info.get("file_name", ""),
                'startup_name': startup_info.get("startup_name", ""),
                'founders': founders_str
            })
        
        print(f"Appended to CSV: {startup_info['file_name']}")
    except Exception as e:
        print(f"Error appending to CSV: {e}")


def process_pdf_for_startup_info(event, context):
    """
    NEW FUNCTION: Process PDF to extract startup name and founder information.
    This runs in parallel to the existing summarization function.
    """
    try:
        # Decode Pub/Sub message
        pubsub_message = json.loads(base64.b64decode(event["data"]).decode("utf-8"))
        file_id = pubsub_message.get("fileId")
        pdf_folder_id = pubsub_message.get("folderId")
        
        if not file_id or not pdf_folder_id:
            raise ValueError("Missing fileId or folderId in Pub/Sub message.")
        
        drive_service = authenticate_google_drive()
        
        # Fetch specific file details
        file = drive_service.files().get(fileId=file_id, fields="id, name, mimeType").execute()
        file_name = file["name"]
        mime_type = file["mimeType"]
        
        # Skip prompt files
        if file_name in ["short_prompt", "long_prompt"]:
            print(f"Skipping prompt file: {file_name}")
            return
        
        # Download the PDF file
        text_path = download_text_file(drive_service, file_id, file_name, mime_type)
        
        # Extract content
        if mime_type == "application/pdf":
            content = extract_text_from_pdf_with_vision(text_path, bucket_name="misfits-production.appspot.com")
        else:
            with open(text_path, "r", encoding="utf-8") as f:
                content = f.read()
        
        # Extract startup info
        startup_info = extract_startup_info_from_content(content, file_name)
        
        # Create or update CSV file locally
        csv_file_name = "startup_founders_data.csv"
        csv_file_path = os.path.join(tempfile.gettempdir(), csv_file_name)
        
        # Append to CSV
        append_to_csv(csv_file_path, startup_info)
        
        # Upload updated CSV to Drive
        results_folder_id = ensure_summary_folder_exists(drive_service, pdf_folder_id, "Startup Data Export")
        upload_file(drive_service, results_folder_id, csv_file_path, mime_type="text/csv")
        
        # Clean up
        os.remove(text_path)
        
        print(f"Successfully processed {file_name}: {startup_info['startup_name']} with founders: {startup_info['founders']}")
        return {"status": "success", "data": startup_info}
        
    except Exception as e:
        print(f"Error processing PDF for startup info: {e}")
        return {"status": "error", "message": str(e)}


def process_pdf_summary(event, context):
    slack_hook = os.environ.get("SLACK_WEBHOOK_URL", "")
    try:
        # Decode Pub/Sub message
        pubsub_message = json.loads(base64.b64decode(event["data"]).decode("utf-8"))
        file_id = pubsub_message.get("fileId")  # File ID from the Pub/Sub message
        pdf_folder_id = pubsub_message.get("folderId")
        prompt_folder_id = "1jAA-tgnNy7vDeNKA4cBQNvvsKzQ-zV9i"

        if not file_id or not pdf_folder_id:
            raise ValueError("Missing fileId or folderId in Pub/Sub message.")

        drive_service = authenticate_google_drive()

        # Fetch specific file details
        file = drive_service.files().get(fileId=file_id, fields="id, name, mimeType").execute()
        file_name = file["name"]
        mime_type = file["mimeType"]

        # Skip prompt files
        if file_name in ["short_prompt", "long_prompt"]:
            print(f"Skipping prompt file: {file_name}")
            return

        # Identify and download prompt files
        prompt_results = drive_service.files().list(
            q=f"'{prompt_folder_id}' in parents and trashed = false",
            fields="files(id, name, mimeType)"
        ).execute()
        prompt_files = prompt_results.get("files", [])
        short_prompt_file = next((f for f in prompt_files if f["name"] == "short_prompt"), None)
        long_prompt_file = next((f for f in prompt_files if f["name"] == "long_prompt"), None)

        if not short_prompt_file or not long_prompt_file:
            raise ValueError("Required prompt files (short_prompt and long_prompt) are missing.")

        short_prompt_path = download_text_file(drive_service, short_prompt_file["id"], "short_prompt", short_prompt_file["mimeType"])
        long_prompt_path = download_text_file(drive_service, long_prompt_file["id"], "long_prompt", long_prompt_file["mimeType"])

        with open(short_prompt_path, "r", encoding="utf-8") as f:
            short_prompt = f.read()
        with open(long_prompt_path, "r", encoding="utf-8") as f:
            long_prompt = f.read()

        # Create summary folder
        summary_folder_id = ensure_summary_folder_exists(drive_service, pdf_folder_id)

        # Check if master summary file exists in the folder
        master_summary_file = drive_service.files().list(
            q=f"'{summary_folder_id}' in parents and name = 'masterSummary.txt' and trashed = false",
            fields="files(id, name)"
        ).execute()
        master_summary_file = master_summary_file.get("files", [])

        # Download master summary file if it exists
        if master_summary_file:
            master_summary_id = master_summary_file[0]["id"]
            master_summary_path = download_text_file(drive_service, master_summary_id, "masterSummary.txt", "text/plain")
            append_mode = "a"  # Append mode
        else:
            # Create a new master summary file locally
            master_summary_path = os.path.join(tempfile.gettempdir(), "masterSummary.txt")
            with open(master_summary_path, "w", encoding="utf-8") as f:
                f.write("Master Summary:\n\n")
            append_mode = "w"  # Write mode

        # Download the specific file
        text_path = download_text_file(drive_service, file_id, file_name, mime_type)

        # Extract content
        if mime_type == "application/pdf":
            content = extract_text_from_pdf_with_vision(text_path, bucket_name="misfits-production.appspot.com")
        else:
            with open(text_path, "r", encoding="utf-8") as f:
                content = f.read()

        # Generate long summary
        long_summary = generate_summary(content, long_prompt)
        long_summary_path = os.path.join(tempfile.gettempdir(), f"{file_name}_long_summary.txt")
        with open(long_summary_path, "w", encoding="utf-8") as f:
            f.write(long_summary)

        # Generate short summary using the long summary as content
        short_summary = generate_summary(long_summary, short_prompt)
        short_summary_path = os.path.join(tempfile.gettempdir(), f"{file_name}_short_summary.txt")
        with open(short_summary_path, "w", encoding="utf-8") as f:
            f.write(short_summary)

        # Upload summaries
        upload_file(drive_service, summary_folder_id, long_summary_path)
        upload_file(drive_service, summary_folder_id, short_summary_path)

        # Append to master summary file
        with open(master_summary_path, append_mode, encoding="utf-8") as master_file:
            master_file.write(f"File: {file_name}\n")
            master_file.write(f"Long Summary:\n{long_summary}\n")
            master_file.write(f"Short Summary:\n{short_summary}\n\n")

        # Upload the updated master summary file
        upload_file(drive_service, summary_folder_id, master_summary_path)

        # Send short summary to Slack
        send_slack_message(slack_hook, short_summary)

        # Clean up temporary files
        os.remove(text_path)
        os.remove(short_prompt_path)
        os.remove(long_prompt_path)
        os.remove(short_summary_path)
        if not master_summary_file:
            os.remove(master_summary_path)

        print(f"Summaries for {file_name} generated and uploaded successfully.")

    except Exception as e:
        print(f"Error processing Pub/Sub event: {e}")
