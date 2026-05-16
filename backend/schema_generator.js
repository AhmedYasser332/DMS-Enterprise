/**
 * Schema Generator Utility
 * مسؤوليته استخراج هيكل جداول البيانات (Headers) من الـ Spreadsheet بالكامل
 * عشان نضمن إن ملف schema.txt متطابق مع الواقع في أي وقت
 */
function generateCurrentSchema() {
  Logger.log("جاري استخراج هيكل البيانات الحالي من Spreadsheet...");
  
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheets = ss.getSheets();
    const schema = {};

    sheets.forEach(sheet => {
      const sheetName = sheet.getName();
      // الحصول على الصف الأول فقط (Headers)
      const lastColumn = sheet.getLastColumn();
      
      if (lastColumn > 0) {
        // قراءة الصف الأول
        const headers = sheet.getRange(1, 1, 1, lastColumn).getValues()[0];
        // تنظيف المسميات من أي مسافات زائدة
        schema[sheetName] = headers
          .map(h => h.toString().trim())
          .filter(h => h !== "");
      } else {
        schema[sheetName] = [];
      }
    });

    const schemaString = JSON.stringify(schema, null, 2);
    
    Logger.log("✅ تم استخراج السكيما بنجاح:");
    Logger.log("\n" + schemaString);
    
    // إرجاع النتيجة لعرضها في الـ Execution Log
    return schemaString;
    
  } catch (error) {
    Logger.log("❌ فشل في استخراج السكيما: " + error.message);
    throw error;
  }
}
