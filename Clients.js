// جلب العملاء (لاحظ الاختصار الرهيب بفضل Utils)
function getClients() {
  try {
    return getSheetData(CONFIG.SHEETS.CLIENTS);
  } catch (e) { throw new Error("خطأ في جلب العملاء: " + e.message); }
}

// إضافة عميل جديد
function addClient(name, taxId, legalEntity) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEETS.CLIENTS);
    const newId = "CL_" + new Date().getTime(); 
    const user = Session.getActiveUser().getEmail() || 'Admin';
    const date = new Date().toLocaleString('en-GB');
    
    // إحنا بنجيب الـ Headers عشان نضمن إننا بنضيف البيانات في مكانها حتى لو ضفت أعمدة في النص
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    let newRow = new Array(headers.length).fill("");
    
    // ملء البيانات الأساسية في أماكنها الصحيحة
    newRow[headers.indexOf("Main_ID")] = newId;
    newRow[headers.indexOf("Name")] = name;
    newRow[headers.indexOf("Tax_ID")] = taxId;
    newRow[headers.indexOf("Legal_Entity")] = legalEntity;
    newRow[headers.indexOf("Created_By")] = user;
    newRow[headers.indexOf("Created_At")] = date;
    newRow[headers.indexOf("Is_Deleted")] = false;

    sheet.appendRow(newRow);
    SpreadsheetApp.flush();
    logAction("إضافة عميل", `تم إضافة العميل: ${name}`);
    return { status: "success" };
  } catch (e) { return { status: "error", message: e.message }; }
}

// حذف عميل (نقل للسلة) - الـ ID هو الملك هنا
function deleteClient(clientId, clientName) {
  try {
    const success = updateCellById(CONFIG.SHEETS.CLIENTS, clientId, "Main_ID", "Is_Deleted", true);
    if (success) {
      logAction("حذف عميل", `نقل العميل لسلة المهملات: ${clientName}`);
      return { status: "success" };
    }
    return { status: "error", message: "العميل غير موجود" };
  } catch (e) { return { status: "error", message: e.message }; }
}