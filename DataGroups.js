// 1. جلب مجموعات البيانات لعميل معين
function getDataGroups(clientId) {
  try {
    const allGroups = getSheetData(CONFIG.SHEETS.GROUPS);
    return allGroups.filter(group => group.Main_ID === clientId);
  } catch (e) { throw new Error("فشل جلب المجموعات: " + e.message); }
}

// 2. إضافة مجموعة بيانات جديدة
function addDataGroup(clientId, groupName) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEETS.GROUPS);
    const newId = "GP_" + new Date().getTime(); 
    const user = Session.getActiveUser().getEmail() || 'Admin';
    const date = new Date().toLocaleString('en-GB');
    
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    let newRow = new Array(headers.length).fill("");
    
    newRow[headers.indexOf("Group_ID")] = newId;
    newRow[headers.indexOf("Main_ID")] = clientId;
    newRow[headers.indexOf("Name")] = groupName;
    newRow[headers.indexOf("Created_By")] = user;
    newRow[headers.indexOf("Created_At")] = date;
    newRow[headers.indexOf("Is_Deleted")] = false;

    sheet.appendRow(newRow);
    SpreadsheetApp.flush();
    logAction("إضافة مجموعة", `أضاف مجموعة "${groupName}" للعميل ID: ${clientId}`);
    return { status: "success" };
  } catch (e) { return { status: "error", message: e.message }; }
}

// 3. حذف مجموعة (نقل للسلة)
function deleteDataGroup(groupId, groupName) {
  try {
    const success = updateCellById(CONFIG.SHEETS.GROUPS, groupId, "Group_ID", "Is_Deleted", true);
    if (success) {
      logAction("حذف مجموعة", `نقل المجموعة "${groupName}" لسلة المهملات`);
      return { status: "success" };
    }
    return { status: "error", message: "المجموعة غير موجودة" };
  } catch (e) { return { status: "error", message: e.message }; }
}