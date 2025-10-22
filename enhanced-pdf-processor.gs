/**
 * Google Apps Script for Processing Pitch Deck PDFs
 * Service Account JWT Auth + Vision API + Gemini AI
 * Replicates Python colleague's working approach
 */

// Service Account Credentials
const SERVICE_ACCOUNT = {
  type: "service_account",
  project_id: "misfits-production",
  private_key_id: "ad71af95c176d11f64ef886d23e0a9d90907621b",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCEEPicbbuBLJ3z\nkm7jK5VQMNaS5P7G3Wo7jIDqKHE6XHOO1YaALuNC50+61+9SMEfMpq/0obUhXX5L\nK0Qj05I49tsqzoXQ1aJXhok90XCTEp6HunvvWFPuO0BVCSgcHRJsQ+z29khtmFoy\nHee40C7Do7jkjwa+LVCLsroqfwAHhccYoCtx/TZ6aqzgH26OzlO5jHfCC+mqCwLE\nevD+pFsFRW9QOchiz5MNRgvmWIRz17AggLkxwjSIJ3WwjVmnpzqW0pianXeSPuZr\nVfZuhH5gpftprsl8JEKcH06pmq88MOkNU/ptf+8CFdqqbMOTRrWnfcRYtTtnvT5B\nvYPhzn9HAgMBAAECggEAE6L0XEoCnb/VEoDc5QE3d89zMC9FZKtKXuVSy75Mq6lQ\nc1XzZD7Ugr+i/ryZtIZCPr8wHXcn1/ivTRz3Sj5smPS3fMNtaTJCq7Hw2RS5oNyd\nXsAPKnTfMeZ0d9BfOuLluNxWsRfIiCcljhsdN8EYmvVOiglsLr3NIqBmBuiQSA3Y\n8H9yW8E1tgiCvHdES9vb6jU+TADlAKgGph03ZJAKZYOp5dA/2fiAc07o/HG2S/QW\nKVoreT5bPshJoL907CxBEFDbFApGHsh1B4lb+rVL0c7rSEIe6NcC7374CEAMGFT5\n9bHUSCkDps+lrewMSxL5ZagCmo3SB5gWSEPppLn2KQKBgQC5qTigo0Kq/TjwwtVI\nJKPUoc/NmsjfobtVTYfD3Q0B7uliroO69M2hEoHiK8kTvK88pFigeE58yuN4c+2A\naKDElKcj6Mu6sn9kfIm5gEMZVmsckSX0vYUz9+ltkLxonLnJZ6ZTniN+X74nc+nb\nAFHMewxEdKHN8kHdcYZxYnVCWQKBgQC2GbyqLufnLrCk4MzQ9tgnvTcdX1vq+oFF\nCGdz2/Kq+SuvsqObELWM8gWH/maK9MEErK8b58/kALCYya+AdYvpoFZ6TmZS2t9r\nPBB9gOulCK/T33j/ip6XGBGwnve5P1mjv2CL0Qw9JaojsP64GbU66cGbWxYoV3AO\n+3qNY/9anwKBgQCVEAKBJtM+CbUPyL4JADHxZEE9aIri0i1gHbFlVjM9XB5Rtp/Z\nGPeH3R4fAtycVh+z5pepry4FD7h2W01Sja6WZmuTbzMzIGEbwsmpAAvfafzxoLAC\nwa8SvHbUGyLKMxsPU4K9G/iPXDuF3ZDi3mzOafS9eY73lQvAyYcRveU7cQKBgQCl\n0LG21ZddL2qx9/EIpn0VUnqJSHfOc+SaE5kAKtvBS7q39hZ78K8gdJEM0F5XUZ8g\nvo2E/4SRvP8RYTVp559LUTDtlc4ezCZ84uixH19zm4FfkDIBnxvhwYz6Iwa3rDPX\no0AqkGRwmYdfkJ+gy+f2iTw+VqbKfTQQsHVboh63SQKBgE2uvjMewCwZN0oeZIY9\nVF0pLnKCxmnP08MoIGKw6/leQ1YkyqkOtP0IUMvEXsoRm4ClmgVa0HShMM6Of+Op\nvrmLVJ5XB4zCzdLbLcHmvqWTffU1riPeW/BsynkaNveBfOgNtW858bgrFUSi9Qa/\njDj2eE1XgF/yxSKagRdRfxvN\n-----END PRIVATE KEY-----\n",
  client_email: "misfits-production-ddn@misfits-production.iam.gserviceaccount.com",
  client_id: "116541547029023251461",
  token_uri: "https://oauth2.googleapis.com/token"
};

const CONFIG = {
  DRIVE_FOLDER_ID: '1F8WEIwICXJCU-PlMlTqLAIcktJ-ydktA',
  SHEET_ID: '1mjpvPEfxDe3es9-PaUiHcb2DXXZmRhLBaF4X1aLSzOo',
  SHEET_NAME: 'Sheet1',
  GEMINI_API_KEY: 'AIzaSyCVUY23QoKhrmyvhGEH-NFvRokgg0MNdCw',
  SAMPLE_LIMIT: 3,
  HEADERS: ['Company Name', 'Founder Name', 'Title/Role', 'Business Type (B2B/B2C)', 'Industry', 'LinkedIn', 'Email', 'PDF File', 'Date'],
  DELAY_BETWEEN_REQUESTS: 2000
};

function processSamplePDFs() {
  console.log('Starting PDF processing...');
  const startTime = new Date();
  
  try {
    const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(CONFIG.SHEET_NAME);
    setupSheet(sheet);
    
    const folder = DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID);
    const files = folder.getFilesByType(MimeType.PDF);
    const allPdfs = [];
    while (files.hasNext()) {
      allPdfs.push(files.next());
    }
    
    console.log(`Found ${allPdfs.length} PDFs`);
    
    const pdfFiles = CONFIG.SAMPLE_LIMIT ? allPdfs.slice(0, CONFIG.SAMPLE_LIMIT) : allPdfs;
    console.log(`Processing ${pdfFiles.length} files`);
    
    let currentRow = 2;
    let successCount = 0;
    
    for (let i = 0; i < pdfFiles.length; i++) {
      const pdfFile = pdfFiles[i];
      console.log(`[${i + 1}/${pdfFiles.length}] Processing: ${pdfFile.getName()}`);
      
      try {
        const pdfText = extractTextFromPDF(pdfFile);
        if (!pdfText) {
          console.log('  → Failed to extract text');
          continue;
        }
        
        console.log(`  → Extracted ${pdfText.length} characters`);
        
        const extractedInfo = parsePDFWithAI(pdfText);
        
        if (extractedInfo.founders && extractedInfo.founders.length > 0) {
          for (const founder of extractedInfo.founders) {
            const rowData = [
              extractedInfo.companyName || '',
              founder.name || '',
              founder.title || '',
              extractedInfo.businessType || '',
              extractedInfo.industry || '',
              founder.linkedin || '',
              founder.email || '',
              pdfFile.getName(),
              new Date().toISOString().split('T')[0]
            ];
            sheet.getRange(currentRow, 1, 1, rowData.length).setValues([rowData]);
            currentRow++;
          }
          successCount++;
        }
      } catch (error) {
        console.error(`  → Error: ${error.message}`);
      }
      
      if (i < pdfFiles.length - 1) {
        Utilities.sleep(CONFIG.DELAY_BETWEEN_REQUESTS);
      }
    }
    
    const duration = ((new Date() - startTime) / 1000).toFixed(2);
    console.log(`✓ Completed in ${duration}s - ${successCount}/${pdfFiles.length} successful`);
    
  } catch (error) {
    console.error('Fatal error:', error);
    throw error;
  }
}

function processAllPDFs() {
  const originalLimit = CONFIG.SAMPLE_LIMIT;
  CONFIG.SAMPLE_LIMIT = null;
  try {
    processSamplePDFs();
  } finally {
    CONFIG.SAMPLE_LIMIT = originalLimit;
  }
}

/**
 * Extract text using Vision API + Service Account JWT
 * Same approach as Python colleague's google-cloud-vision client
 */
function extractTextFromPDF(pdfFile) {
  try {
    const fileName = pdfFile.getName();
    console.log(`  Extracting: ${fileName}`);
    
    const pdfBlob = pdfFile.getBlob();
    const base64Pdf = Utilities.base64Encode(pdfBlob.getBytes());
    
    const accessToken = getAccessTokenFromServiceAccount();
    if (!accessToken) {
      console.error('  → No access token');
      return null;
    }
    
    const request = {
      requests: [{
        image: { content: base64Pdf },
        features: [{ type: 'DOCUMENT_TEXT_DETECTION' }]
      }]
    };
    
    const response = UrlFetchApp.fetch('https://vision.googleapis.com/v1/images:annotate', {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(request),
      headers: { 'Authorization': `Bearer ${accessToken}` },
      muteHttpExceptions: true,
      timeout: 30
    });
    
    if (response.getResponseCode() !== 200) {
      console.error(`  → API error ${response.getResponseCode()}`);
      return null;
    }
    
    const data = JSON.parse(response.getContentText());
    
    if (data.error || !data.responses || !data.responses[0]) {
      console.error('  → Invalid response from API');
      return null;
    }
    
    const resp = data.responses[0];
    
    if (resp.fullTextAnnotation && resp.fullTextAnnotation.text) {
      return resp.fullTextAnnotation.text;
    }
    
    if (resp.textAnnotations && resp.textAnnotations.length > 0) {
      const text = resp.textAnnotations.map(a => a.description || '').join(' ').trim();
      if (text.length > 0) return text;
    }
    
    console.log('  → No text in response');
    return null;
    
  } catch (error) {
    console.error(`  → Error: ${error.message}`);
    return null;
  }
}

/**
 * Generate JWT and get access token
 */
function getAccessTokenFromServiceAccount() {
  try {
    const now = Math.floor(Date.now() / 1000);
    
    const header = {
      alg: 'RS256',
      typ: 'JWT',
      kid: SERVICE_ACCOUNT.private_key_id
    };
    
    const payload = {
      iss: SERVICE_ACCOUNT.client_email,
      scope: 'https://www.googleapis.com/auth/cloud-vision',
      aud: SERVICE_ACCOUNT.token_uri,
      exp: now + 3600,
      iat: now
    };
    
    const headerEncoded = encodeBase64Url(JSON.stringify(header));
    const payloadEncoded = encodeBase64Url(JSON.stringify(payload));
    const signatureInput = `${headerEncoded}.${payloadEncoded}`;
    
    const signature = Utilities.computeRsaSha256Signature(signatureInput, SERVICE_ACCOUNT.private_key);
    const signatureEncoded = encodeBase64Url(signature);
    
    const jwtToken = `${signatureInput}.${signatureEncoded}`;
    
    const tokenResponse = UrlFetchApp.fetch(SERVICE_ACCOUNT.token_uri, {
      method: 'post',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      payload: {
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwtToken
      },
      muteHttpExceptions: true
    });
    
    if (tokenResponse.getResponseCode() !== 200) {
      console.error('Token exchange failed');
      return null;
    }
    
    const tokenData = JSON.parse(tokenResponse.getContentText());
    return tokenData.access_token;
    
  } catch (error) {
    console.error('Auth error:', error.message);
    return null;
  }
}

function encodeBase64Url(input) {
  const base64 = typeof input === 'string' 
    ? Utilities.base64Encode(input) 
    : Utilities.base64Encode(input, Utilities.Charset.UTF_8);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function parsePDFWithAI(pdfText) {
  try {
    const prompt = `Extract from this pitch deck:
1. Company Name
2. All Founder Names & Titles
3. Business Type (B2B/B2C)
4. Industry
5. LinkedIn profiles
6. Emails

Content: ${pdfText.substring(0, 3000)}

Respond ONLY with valid JSON:
{
  "companyName": "string",
  "founders": [{"name": "string", "title": "string", "linkedin": "string", "email": "string"}],
  "businessType": "B2B" or "B2C",
  "industry": "string"
}`;

    const response = callGeminiAPI(prompt);
    const cleaned = cleanJSONResponse(response);
    const parsed = JSON.parse(cleaned);
    
    if (!parsed.founders) parsed.founders = [];
    return parsed;
    
  } catch (error) {
    console.error('AI parsing error:', error.message);
    return {
      companyName: '',
      founders: [],
      businessType: '',
      industry: ''
    };
  }
}

function callGeminiAPI(prompt) {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${CONFIG.GEMINI_API_KEY}`;
    
    const payload = {
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 1500
      }
    };
    
    const response = UrlFetchApp.fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });
    
    if (response.getResponseCode() !== 200) {
      throw new Error(`Gemini API error: ${response.getResponseCode()}`);
    }
    
    const data = JSON.parse(response.getContentText());
    return data.candidates[0].content.parts[0].text;
    
  } catch (error) {
    console.error('Gemini API error:', error.message);
    throw error;
  }
}

function cleanJSONResponse(response) {
  let cleaned = response.trim();
  cleaned = cleaned.replace(/```json\s*/g, '').replace(/```\s*/g, '');
  cleaned = cleaned.trim();
  
  if (!cleaned.startsWith('{')) {
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start !== -1 && end !== -1) {
      cleaned = cleaned.substring(start, end + 1);
    }
  }
  
  return cleaned;
}

function setupSheet(sheet) {
  sheet.clear();
  sheet.getRange(1, 1, 1, CONFIG.HEADERS.length).setValues([CONFIG.HEADERS]);
  
  const headerRange = sheet.getRange(1, 1, 1, CONFIG.HEADERS.length);
  headerRange.setBackground('#4285f4');
  headerRange.setFontColor('white');
  headerRange.setFontWeight('bold');
  
  for (let i = 1; i <= CONFIG.HEADERS.length; i++) {
    sheet.setColumnWidth(i, 150);
  }
}

// Test functions
function testSetup() {
  console.log('Testing setup...');
  const folder = DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID);
  console.log('✓ Folder access: OK');
  
  const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(CONFIG.SHEET_NAME);
  console.log('✓ Sheet access: OK');
  
  const files = folder.getFilesByType(MimeType.PDF);
  let count = 0;
  while (files.hasNext()) {
    files.next();
    count++;
  }
  console.log(`✓ Found ${count} PDF files`);
}

function testAuth() {
  console.log('Testing auth...');
  const token = getAccessTokenFromServiceAccount();
  if (token) {
    console.log('✓ Auth successful');
  } else {
    console.log('✗ Auth failed');
  }
}

function testExtraction() {
  const folder = DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID);
  const files = folder.getFilesByType(MimeType.PDF);
  if (files.hasNext()) {
    const testFile = files.next();
    console.log(`Testing extraction on: ${testFile.getName()}`);
    const text = extractTextFromPDF(testFile);
    if (text) {
      console.log(`✓ Extracted ${text.length} characters`);
    } else {
      console.log('✗ Extraction failed');
    }
  }
}

function testAI() {
  const mockText = `
    Mewa Hub - Connecting Communities
    Founders: John Smith (CEO), Sarah Johnson (CTO)
    B2B SaaS for community management
    PropTech sector
    john@mewahub.com
  `;
  
  console.log('Testing AI parsing...');
  const result = parsePDFWithAI(mockText);
  console.log('Result:', JSON.stringify(result, null, 2));
}

