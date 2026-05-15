/**
 * Database Connection Manager (Singleton Pattern)
 * يضمن الاتصال بقاعدة البيانات (Google Sheets) مرة واحدة فقط لزيادة الأداء وسرعة الاستجابة
 */
class DatabaseConnection {
  constructor() {
    // التحقق من عدم وجود نسخة مسبقة (Singleton)
    if (DatabaseConnection.instance) {
      return DatabaseConnection.instance;
    }
    
    this.spreadsheet = null;
    this.sheetsCache = {}; // ذاكرة مؤقتة للشيتات المطلوبة
    
    DatabaseConnection.instance = this;
  }

  /**
   * جلب قاعدة البيانات (تحميل متأخر - Lazy Initialization)
   * @returns {GoogleAppsScript.Spreadsheet.Spreadsheet}
   */
  getSpreadsheet() {
    if (!this.spreadsheet) {
      this.spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    }
    return this.spreadsheet;
  }

  /**
   * جلب جدول معين مع استخدام الكاش لتسريع العمليات المتكررة
   * @param {string} sheetName 
   * @returns {GoogleAppsScript.Spreadsheet.Sheet}
   */
  getSheet(sheetName) {
    // إذا لم يكن الشيت في الكاش، قم بجلبه وحفظه
    if (!this.sheetsCache[sheetName]) {
      const ss = this.getSpreadsheet();
      const sheet = ss.getSheetByName(sheetName);
      
      if (!sheet) {
        throw new Error(`Critical Error: Table (Sheet) '${sheetName}' not found in the database.`);
      }
      
      this.sheetsCache[sheetName] = sheet;
    }
    return this.sheetsCache[sheetName];
  }
  
  /**
   * حفظ التعديلات فوراً في الشيت (Commit)
   */
  commit() {
    SpreadsheetApp.flush();
  }
}

// تصدير نسخة واحدة فقط لتستخدمها كل أجزاء النظام
const Database = new DatabaseConnection();
