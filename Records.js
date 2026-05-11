// 1. جلب السجلات لمجموعة معينة
function getRecords(groupId) {
  try {
    const allRecords = getSheetData(CONFIG.SHEETS.RECORDS);
    return allRecords.filter(rec => rec.Sub_ID === groupId); // الحقل في الشيت لسه اسمه Sub_ID
  } catch (e) { throw new Error("فشل جلب السجلات: " + e.message); }
}

// 2. إضافة سجل جديد
function addRecord(groupId, title, description, tags) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEETS.RECORDS);
    const newId = "REC_" + new Date().getTime(); 
    const user = Session.getActiveUser().getEmail() || 'Admin';
    const date = new Date().toLocaleString('en-GB');
    
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    let newRow = new Array(headers.length).fill("");
    
    newRow[headers.indexOf("Record_ID")] = newId;
    newRow[headers.indexOf("Sub_ID")] = groupId;
    newRow[headers.indexOf("Title")] = title;
    newRow[headers.indexOf("Description")] = description;
    newRow[headers.indexOf("Tags")] = tags;
    newRow[headers.indexOf("Created_By")] = user;
    newRow[headers.indexOf("Created_At")] = date;
    newRow[headers.indexOf("Is_Deleted")] = false;

    sheet.appendRow(newRow);
    SpreadsheetApp.flush();
    logAction("إضافة سجل", `تم إضافة سجل بعنوان: ${title}`);
    return { status: "success" };
  } catch (e) { return { status: "error", message: e.message }; }
}

// 3. حذف سجل
function deleteRecord(recordId, title) {
  try {
    const success = updateCellById(CONFIG.SHEETS.RECORDS, recordId, "Record_ID", "Is_Deleted", true);
    if (success) {
      logAction("حذف سجل", `نقل السجل "${title}" لسلة المهملات`);
      return { status: "success" };
    }
    return { status: "error", message: "السجل غير موجود" };
  } catch (e) { return { status: "error", message: e.message }; }
}


// دالة البحث الشامل (النسخة النظيفة والآمنة)
function getAllRecordsData() {
  try {
    // 1. جلب كل البيانات (بدون المحذوف)
    const clients = getSheetData(CONFIG.SHEETS.CLIENTS);
    const groups = getSheetData(CONFIG.SHEETS.GROUPS);
    const records = getSheetData(CONFIG.SHEETS.RECORDS);

    // 2. عمل Maps (فهارس) للوصول السريع جداً بدل اللوب المتداخل
    let clientsMap = {};
    clients.forEach(c => clientsMap[c.Main_ID] = c.Name);

    let groupsMap = {};
    groups.forEach(g => {
      // فقط لو العميل بتاع المجموعة دي لسة موجود (مش محذوف)
      if (clientsMap[g.Main_ID]) {
        groupsMap[g.Group_ID] = {
          name: g.Name,
          clientId: g.Main_ID,
          clientName: clientsMap[g.Main_ID]
        };
      }
    });

    // 3. تجميع السجلات النهائية
    let finalRecords = [];
    records.forEach(rec => {
      const parentGroup = groupsMap[rec.Sub_ID]; // Sub_ID هنا هو الـ Group_ID
      // لو المجموعة أو العميل محذوفين، السجل مش هيظهر! (حماية البيانات اليتيمة)
      if (parentGroup) {
        finalRecords.push({
          Record_ID: rec.Record_ID,
          Title: rec.Title,
          Description: rec.Description,
          Tags: rec.Tags,
          Created_At: rec.Created_At,
          Created_By: rec.Created_By,
          Group_ID: rec.Sub_ID,
          Group_Name: parentGroup.name,
          Client_ID: parentGroup.clientId,
          Client_Name: parentGroup.clientName
        });
      }
    });

    return finalRecords;
  } catch (error) {
    throw new Error("فشل جلب بيانات البحث الشامل: " + error.message);
  }
}

// دالة إحصائيات لوحة التحكم (Dashboard)
function getDashboardStats() {
  try {
    const clients = getSheetData(CONFIG.SHEETS.CLIENTS).length;
    const records = getSheetData(CONFIG.SHEETS.RECORDS).length;
    // لما نعمل جدول المستخدمين هنبقى نعدهم، مؤقتاً هنخليهم 1
    const users = 1; 
    
    return { status: "success", stats: { clients, records, users } };
  } catch (error) {
    return { status: "error", message: error.message };
  }
}