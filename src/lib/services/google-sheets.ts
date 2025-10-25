// GOOGLE SHEETS IS DISABLED FOR FIREBASE DEMO
// All code in this file is now inactive. See firestore-data.ts for new backend.

/**
 * Google Sheets API Service
 * Handles all interactions with user's Google Sheets for data storage
 */

// import { googleAuth } from './google-auth';
// import type { UserProfile, DailyLog } from '@/types';

// const SHEET_NAME = 'DermAir - My Health Data';
// const PROFILE_TAB = 'Profile';
// const CHECKINS_TAB = 'CheckIns';
// const WEATHER_TAB = 'WeatherHistory';

// interface SpreadsheetInfo {
//   spreadsheetId: string;
//   spreadsheetUrl: string;
//   sheets: string[];
// }

// class GoogleSheetsService {
//   private static instance: GoogleSheetsService;
//   private spreadsheetId: string | null = null;
//   private readonly API_BASE = 'https://sheets.googleapis.com/v4/spreadsheets';

//   private constructor() {
//     this.loadSpreadsheetId();
//   }

//   static getInstance(): GoogleSheetsService {
//     if (!GoogleSheetsService.instance) {
//       GoogleSheetsService.instance = new GoogleSheetsService();
//     }
//     return GoogleSheetsService.instance;
//   }

//   /**
//    * Initialize or retrieve existing spreadsheet for the user
//    */
//   async initializeSpreadsheet(): Promise<SpreadsheetInfo> {
//     const accessToken = await googleAuth.getAccessToken();

//     // Check if spreadsheet already exists
//     const existingSheet = await this.findExistingSpreadsheet(accessToken);
    
//     if (existingSheet) {
//       this.spreadsheetId = existingSheet.spreadsheetId;
//       this.saveSpreadsheetId(existingSheet.spreadsheetId);
//       return existingSheet;
//     }

//     // Create new spreadsheet
//     return await this.createNewSpreadsheet(accessToken);
//   }

//   /**
//    * Find existing DermAir spreadsheet in user's Drive
//    */
//   private async findExistingSpreadsheet(accessToken: string): Promise<SpreadsheetInfo | null> {
//     try {
//       // Search for spreadsheet by name using Drive API
//       const driveResponse = await fetch(
//         `https://www.googleapis.com/drive/v3/files?` +
//         `q=name='${SHEET_NAME}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false` +
//         `&fields=files(id,name,webViewLink)`,
//         {
//           headers: {
//             Authorization: `Bearer ${accessToken}`,
//           },
//         }
//       );

//       if (!driveResponse.ok) {
//         throw new Error('Failed to search for spreadsheet');
//       }

//       const driveData = await driveResponse.json();

//       if (driveData.files && driveData.files.length > 0) {
//         const file = driveData.files[0];
        
//         // Get sheet details
//         const sheetResponse = await fetch(
//           `${this.API_BASE}/${file.id}?fields=sheets.properties.title`,
//           {
//             headers: {
//               Authorization: `Bearer ${accessToken}`,
//             },
//           }
//         );

//         const sheetData = await sheetResponse.json();
//         const sheets = sheetData.sheets?.map((s: any) => s.properties.title) || [];

//         return {
//           spreadsheetId: file.id,
//           spreadsheetUrl: file.webViewLink,
//           sheets,
//         };
//       }

//       return null;
//     } catch (error) {
//       console.error('Error finding spreadsheet:', error);
//       return null;
//     }
//   }

//   /**
//    * Create new spreadsheet in user's Drive
//    */
//   private async createNewSpreadsheet(accessToken: string): Promise<SpreadsheetInfo> {
//     const createRequest = {
//       properties: {
//         title: SHEET_NAME,
//       },
//       sheets: [
//         {
//           properties: {
//             title: PROFILE_TAB,
//             gridProperties: {
//               rowCount: 100,
//               columnCount: 10,
//             },
//           },
//           data: [{
//             rowData: [{
//               values: [
//                 { userEnteredValue: { stringValue: 'ProfileID' }, userEnteredFormat: { textFormat: { bold: true } } },
//                 { userEnteredValue: { stringValue: 'Email' }, userEnteredFormat: { textFormat: { bold: true } } },
//                 { userEnteredValue: { stringValue: 'Location' }, userEnteredFormat: { textFormat: { bold: true } } },
//                 { userEnteredValue: { stringValue: 'Triggers' }, userEnteredFormat: { textFormat: { bold: true } } },
//                 { userEnteredValue: { stringValue: 'Severity' }, userEnteredFormat: { textFormat: { bold: true } } },
//                 { userEnteredValue: { stringValue: 'CreatedAt' }, userEnteredFormat: { textFormat: { bold: true } } },
//                 { userEnteredValue: { stringValue: 'UpdatedAt' }, userEnteredFormat: { textFormat: { bold: true } } },
//               ],
//             }],
//           }],
//         },
//         {
//           properties: {
//             title: CHECKINS_TAB,
//             gridProperties: {
//               rowCount: 1000,
//               columnCount: 10,
//             },
//           },
//           data: [{
//             rowData: [{
//               values: [
//                 { userEnteredValue: { stringValue: 'Date' }, userEnteredFormat: { textFormat: { bold: true } } },
//                 { userEnteredValue: { stringValue: 'ItchScore' }, userEnteredFormat: { textFormat: { bold: true } } },
//                 { userEnteredValue: { stringValue: 'RednessScore' }, userEnteredFormat: { textFormat: { bold: true } } },
//                 { userEnteredValue: { stringValue: 'MedicationUsed' }, userEnteredFormat: { textFormat: { bold: true } } },
//                 { userEnteredValue: { stringValue: 'Notes' }, userEnteredFormat: { textFormat: { bold: true } } },
//                 { userEnteredValue: { stringValue: 'PhotoURL' }, userEnteredFormat: { textFormat: { bold: true } } },
//               ],
//             }],
//           }],
//         },
//         {
//           properties: {
//             title: WEATHER_TAB,
//             gridProperties: {
//               rowCount: 1000,
//               columnCount: 8,
//             },
//           },
//           data: [{
//             rowData: [{
//               values: [
//                 { userEnteredValue: { stringValue: 'Date' }, userEnteredFormat: { textFormat: { bold: true } } },
//                 { userEnteredValue: { stringValue: 'Temp' }, userEnteredFormat: { textFormat: { bold: true } } },
//                 { userEnteredValue: { stringValue: 'Humidity' }, userEnteredFormat: { textFormat: { bold: true } } },
//                 { userEnteredValue: { stringValue: 'UV' }, userEnteredFormat: { textFormat: { bold: true } } },
//                 { userEnteredValue: { stringValue: 'AQI' }, userEnteredFormat: { textFormat: { bold: true } } },
//                 { userEnteredValue: { stringValue: 'Pollen' }, userEnteredFormat: { textFormat: { bold: true } } },
//               ],
//             }],
//           }],
//         },
//       ],
//     };

//     const response = await fetch(this.API_BASE, {
//       method: 'POST',
//       headers: {
//         Authorization: `Bearer ${accessToken}`,
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(createRequest),
//     });

//     if (!response.ok) {
//       const errorData = await response.json().catch(() => ({}));
//       console.error('Failed to create spreadsheet:', response.status, errorData);
//       throw new Error(
//         `Failed to create spreadsheet: ${response.status} - ${errorData.error?.message || 'Unknown error'}`
//       );
//     }

//     const data = await response.json();
//     this.spreadsheetId = data.spreadsheetId;
//     this.saveSpreadsheetId(data.spreadsheetId);

//     return {
//       spreadsheetId: data.spreadsheetId,
//       spreadsheetUrl: data.spreadsheetUrl,
//       sheets: [PROFILE_TAB, CHECKINS_TAB, WEATHER_TAB],
