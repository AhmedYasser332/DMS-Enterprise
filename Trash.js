// ==========================================
// سلة المهملات (Trash) المحدثة ديناميكياً
// ==========================================

function getTrashItems() {
  try {
    let trash = [];
    
    // دالة مساعدة داخلية لجلب العناصر المحذوفة من شيت معين
    function fetchDeleted(sheetName, idField, nameField, typeName) {
      const ss = SpreadsheetApp.openById(CONFIG.DB_ID);
      const sheet = ss.getSheetByName(sheetName);
      const data = sheet.getDataRange().getDisplayValues();
      if (data.length <= 1) return;
      
      const headers = data[0];
      const rows = data.slice(1);
      
      const delIdx = headers.indexOf("Is_Deleted");
      const idIdx = headers.indexOf(idField);
      const nameIdx = headers.indexOf(nameField);
      
      if(delIdx === -1 || idIdx === -1 || nameIdx === -1) return;
      
      rows.forEach(row => {
        if (String(row[delIdx]).toUpperCase() === "TRUE") {
          trash.push({ id: row[idIdx], name: row[nameIdx], type: typeName, sheetName: sheetName });
        }
      });
    }

    // جلب من كل الجداول
    fetchDeleted(CONFIG.SHEETS.CLIENTS, "Main_ID", "Name", "عميل");
    fetchDeleted(CONFIG.SHEETS.GROUPS, "Group_ID", "Name", "مجموعة بيانات");
    fetchDeleted(CONFIG.SHEETS.RECORDS, "Record_ID", "Title", "سجل");
    fetchDeleted(CONFIG.SHEETS.ATTACHMENTS, "File_ID", "File_Name", "مرفق");

    return trash;
  } catch (error) {
    throw new Error("فشل جلب سلة المهملات: " + error.message);
  }
}

function restoreItem(id, sheetName, itemName, itemType) {
  try {
    let idColName = "Main_ID";
    if(sheetName === CONFIG.SHEETS.GROUPS) idColName = "Group_ID";
    if(sheetName === CONFIG.SHEETS.RECORDS) idColName = "Record_ID";
    if(sheetName === CONFIG.SHEETS.ATTACHMENTS) idColName = "File_ID";

    const success = updateCellById(sheetName, id, idColName, "Is_Deleted", false);
    if (success) {
      logAction("استعادة", `تم استعادة ${itemType}: "${itemName}"`);
      return { status: "success" };
    }
    return { status: "error", message: "العنصر غير موجود!" };
  } catch (error) {
    return { status: "error", message: error.message };
  }
}

function hardDeleteItem(id, sheetName, itemName, itemType) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    const data = sheet.getDataRange().getValues();
    
    let idColName = "Main_ID";
    if(sheetName === CONFIG.SHEETS.GROUPS) idColName = "Group_ID";
    if(sheetName === CONFIG.SHEETS.RECORDS) idColName = "Record_ID";
    if(sheetName === CONFIG.SHEETS.ATTACHMENTS) idColName = "File_ID";
    
    const idColIdx = data[0].indexOf(idColName);
    if (idColIdx === -1) throw new Error("عمود الـ ID غير موجود");

    for (let i = 1; i < data.length; i++) {
      if (data[i][idColIdx] == id) {
        sheet.deleteRow(i + 1); // مسح نهائي للصف
        SpreadsheetApp.flush();
        logAction("حذف نهائي", `تم الحذف النهائي لـ ${itemType}: "${itemName}"`);
        return { status: "success" };
      }
    }
    return { status: "error", message: "العنصر غير موجود!" };
  } catch (error) {
    return { status: "error", message: error.message };
  }
}