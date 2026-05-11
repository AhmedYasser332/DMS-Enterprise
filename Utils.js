/**
 * ملف الأدوات المساعدة - المركز الرئيسي للعمليات المتكررة
 */

const CONFIG = {
  DB_ID: SpreadsheetApp.getActiveSpreadsheet().getId(),
  SHEETS: {
    CLIENTS: "Clients",
    GROUPS: "Data_Groups",
    RECORDS: "Records",
    ATTACHMENTS: "Attachments",
    LOGS: "Activity_Log"
  }
};

// 1. دالة جلب البيانات وتحويلها لـ Objects أوتوماتيكياً
function getSheetData(sheetName, filterDeleted = true) {
  const ss = SpreadsheetApp.openById(CONFIG.DB_ID);
  const sheet = ss.getSheetByName(sheetName);
  const data = sheet.getDataRange().getDisplayValues(); // لضمان قراءة النصوص والتواريخ صحيحة
  
  if (data.length <= 1) return [];

  const headers = data[0];
  const rows = data.slice(1);
  
  // البحث عن مكان عمود الحذف ديناميكياً
  const isDeletedIdx = headers.indexOf("Is_Deleted");

  return rows.map(row => {
    let obj = {};
    headers.forEach((header, i) => {
      obj[header] = row[i];
    });
    return obj;
  }).filter(item => {
    if (!filterDeleted || isDeletedIdx === -1) return true;
    return String(item["Is_Deleted"]).toUpperCase() !== "TRUE";
  });
}

// 2. دالة تحديث خلية بناءً على ID واسم العمود (حل مشكلة الأرقام السحرية)
function updateCellById(sheetName, idValue, idColumnName, targetColumnName, newValue) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  const idColIdx = headers.indexOf(idColumnName);
  const targetColIdx = headers.indexOf(targetColumnName);
  
  if (idColIdx === -1 || targetColIdx === -1) throw new Error("لم يتم العثور على الأعمدة المطلوبة");

  for (let i = 1; i < data.length; i++) {
    if (data[i][idColIdx] == idValue) {
      sheet.getRange(i + 1, targetColIdx + 1).setValue(newValue);
      SpreadsheetApp.flush();
      return true;
    }
  }
  return false;
}

// 3. دالة تسجيل النشاط الموحدة
function logAction(action, details) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEETS.LOGS);
  const logId = "LOG_" + new Date().getTime();
  const user = Session.getActiveUser().getEmail() || 'Admin';
  const timestamp = new Date().toLocaleString('en-GB');
  sheet.appendRow([logId, user, action, details, timestamp]);
}