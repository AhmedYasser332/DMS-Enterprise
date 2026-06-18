/**
 * Migration Script for Dashboard Command Center (Stage 1 & 2)
 * Creates the TaxConfig and Credentials sheets if they do not exist,
 * and sets up the required column headers.
 */
function migrateCommandCenter() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Setup TaxConfig Sheet
  let taxConfigSheet = ss.getSheetByName("TaxConfig");
  if (!taxConfigSheet) {
    taxConfigSheet = ss.insertSheet("TaxConfig");
    const headers = [
      "Task_Type",
      "Warning_Days",
      "Critical_Days",
      "Penalty_Flat",
      "Penalty_Daily_Rate",
      "Penalty_Cap"
    ];
    taxConfigSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    taxConfigSheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
    
    // Add some default rows to get started
    const defaultData = [
      ["VAT", 7, 3, 3000, 0, 0],
      ["Income_Tax", 14, 5, 5000, 0, 0]
    ];
    taxConfigSheet.getRange(2, 1, defaultData.length, headers.length).setValues(defaultData);
    Logger.log("Created TaxConfig sheet with default data.");
  } else {
    Logger.log("TaxConfig sheet already exists.");
  }

  // 2. Setup Credentials Sheet
  let credentialsSheet = ss.getSheetByName("Credentials");
  if (!credentialsSheet) {
    credentialsSheet = ss.insertSheet("Credentials");
    const headers = [
      "Cred_ID",
      "Client_ID",
      "Portal_Type",
      "Username",
      "Password",
      "Expiry_Date",
      "Last_Rotated",
      "Updated_By",
      "Is_Deleted"
    ];
    credentialsSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    credentialsSheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
    Logger.log("Created Credentials sheet.");
  } else {
    Logger.log("Credentials sheet already exists.");
  }
}
