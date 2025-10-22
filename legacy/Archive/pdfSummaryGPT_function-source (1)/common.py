import io
import os

import openai
import requests
from docx import Document
from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload, MediaIoBaseDownload

def authenticate_google_drive():
    creds = Credentials.from_service_account_file(
        "./drive-service-account.json",
        scopes=["https://www.googleapis.com/auth/drive"]
    )
    print(creds)
    drive_service = build("drive", "v3", credentials=creds)
    return drive_service

def download_text_file(drive_service, file_id, file_name, mime_type=None):
    try:
        # Export Google Docs or download binary files
        if mime_type and mime_type.startswith("application/vnd.google-apps"):
            export_mime_type = "text/plain" if mime_type == "application/vnd.google-apps.document" else None
            if export_mime_type:
                request = drive_service.files().export_media(fileId=file_id, mimeType=export_mime_type)
            else:
                raise ValueError(f"Unsupported Google App MIME type: {mime_type}")
        else:
            request = drive_service.files().get_media(fileId=file_id)

        fh = io.BytesIO()
        downloader = MediaIoBaseDownload(fh, request)
        done = False
        while not done:
            _, done = downloader.next_chunk()

        # Save the downloaded content
        file_path = f"{file_name}.txt" if mime_type == "application/vnd.google-apps.document" else file_name
        with open(file_path, "wb") as f:
            fh.seek(0)
            f.write(fh.read())
        return file_path
    except Exception as e:
        print(f"Error downloading file: {e}")
        return None

def upload_file(drive_service, folder_id, file_name, mime_type="text/plain"):
    file_metadata = {"name": os.path.basename(file_name), "parents": [folder_id]}
    media = MediaFileUpload(file_name, mimetype=mime_type)
    file = drive_service.files().create(body=file_metadata, media_body=media, fields="id").execute()
    return file.get("id")

def ensure_summary_folder_exists(drive_service, parent_folder_id, folder_name="AI Generated Summary"):
    results = drive_service.files().list(
        q=f"'{parent_folder_id}' in parents and name = '{folder_name}' and mimeType = 'application/vnd.google-apps.folder'",
        fields="files(id)"
    ).execute()
    folders = results.get("files", [])
    if folders:
        return folders[0]["id"]
    file_metadata = {"name": folder_name, "parents": [parent_folder_id], "mimeType": "application/vnd.google-apps.folder"}
    folder = drive_service.files().create(body=file_metadata, fields="id").execute()
    return folder["id"]

def extract_text_from_file(file_path):
    try:
        if file_path.endswith(".txt"):
            with open(file_path, "r", encoding="utf-8") as f:
                return f.read()
        elif file_path.endswith(".docx"):
            doc = Document(file_path)
            return "\n".join([para.text for para in doc.paragraphs])
    except Exception as e:
        print(f"Error extracting text from file: {e}")
    return ""

def generate_summary(content, prompt):
    try:
        formatted_prompt = prompt.replace("{content}", content)
        openai.api_key = os.environ.get("OPENAI_API_KEY")
        response = openai.ChatCompletion.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are a summary generator."},
                {"role": "user", "content": formatted_prompt},
            ]
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Error generating summary: {e}")
        return ""

def send_slack_message(slack_hook_url, message):
    try:
        payload = {"text": message}
        response = requests.post(slack_hook_url, json=payload)
        if response.status_code == 200:
            print("Message sent to Slack successfully.")
        else:
            print(f"Failed to send message to Slack: {response.status_code}, {response.text}")
    except Exception as e:
        print(f"Error sending message to Slack: {e}")