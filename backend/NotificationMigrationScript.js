/**
 * Notification Migration Script
 * Call this from the Apps Script editor to create the Notifications table.
 */
function runNotificationMigration() {
  const db = SpreadsheetApp.getActiveSpreadsheet();
  const sheetName = Config.TABLES.NOTIFICATIONS;
  
  let sheet = db.getSheetByName(sheetName);
  if (!sheet) {
    sheet = db.insertSheet(sheetName);
    Logger.log("Created Notifications sheet.");
  }
  
  const headers = [
    "Notification_ID",
    "Recipient_Email",
    "Type",
    "Title",
    "Message",
    "Link",
    "Is_Read",
    "Created_At",
    "Read_At"
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#d9ead3");
  
  Logger.log("Notification migration completed successfully.");
}
