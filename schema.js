function getSpreadsheetSchema() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ss.getSheets();
  let schema = {};

  sheets.forEach(sheet => {
    const sheetName = sheet.getName();
    const lastCol = sheet.getLastColumn();
    let headers = [];
    
    // التأكد من أن الشيت ليس فارغاً
    if (lastCol > 0) {
      headers = sheet.getRange(1, 1, 1, lastCol).getDisplayValues()[0];
      // تنظيف أي أعمدة فارغة في النهاية
      headers = headers.filter(header => header.trim() !== "");
    }
    
    schema[sheetName] = headers;
  });

  const schemaString = JSON.stringify(schema, null, 2);
  
  // طباعة المخطط في سجل التنفيذ
  console.log("=== مخطط قاعدة البيانات الحالي ===");
  console.log(schemaString);
  
  return schemaString;
}