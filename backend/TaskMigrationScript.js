/**
 * Migration Script: Task Management Tables
 * Creates the "Task_Templates" and "Tasks" sheets with correct headers.
 * Idempotent — safe to run multiple times without duplicating sheets.
 * 
 * HOW TO RUN: Open Apps Script Editor → Select "migrateTaskTables" → Click ▶ Run
 */
function migrateTaskTables() {
  Logger.log("Starting Task Management Migration...");
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Define the schema for each new table
  const newTables = {
    "Task_Templates": [
      "Template_ID", "Title", "Description",
      "Warning_Days", "Critical_Days",
      "Created_By", "Created_At", "Is_Deleted"
    ],
    "Tasks": [
      "Task_ID", "Template_ID", "Title", "Description",
      "Assigned_To", "Client_ID", "Deadline",
      "Warning_Days", "Critical_Days", "Status",
      "Completion_Note", "Completed_At", "Rejection_Reason",
      "Created_By", "Created_At", "Is_Deleted"
    ]
  };

  let createdCount = 0;
  let skippedCount = 0;

  for (const [tableName, headers] of Object.entries(newTables)) {
    const existingSheet = ss.getSheetByName(tableName);

    if (existingSheet) {
      Logger.log(`⏭️ Sheet "${tableName}" already exists — skipping.`);
      skippedCount++;
      continue;
    }

    // Create the new sheet and write headers
    const newSheet = ss.insertSheet(tableName);
    newSheet.getRange(1, 1, 1, headers.length).setValues([headers]);

    // Freeze the header row for better UX
    newSheet.setFrozenRows(1);

    // Bold the header row
    newSheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");

    Logger.log(`✅ Created sheet "${tableName}" with ${headers.length} columns.`);
    createdCount++;
  }

  SpreadsheetApp.flush();

  const summary = `Migration Complete. Created: ${createdCount}, Skipped: ${skippedCount}.`;
  Logger.log(summary);
  return summary;
}
