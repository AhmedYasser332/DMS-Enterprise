/**
 * نظام إدارة المستخدمين (للمديرين فقط)
 */

function getAllUsers() {
  try {
    // جلب المستخدمين غير المحذوفين
    const users = getSheetData("Users", false).filter(u => String(u.Is_Deleted).toUpperCase() !== "TRUE");
    
    // ⚠️ أمان: بنشيل الباسوورد من الداتا قبل ما نبعتها للواجهة عشان محدش يسرقها من الـ Console
    return users.map(u => ({
      id: u.User_ID,
      name: u.Name,
      username: u.Username,
      role: u.Role,
      allowedClients: u.Allowed_Clients,
      isActive: String(u.Is_Active).toUpperCase() === "TRUE",
      createdAt: u.Created_At
    }));
  } catch(e) { 
    return []; 
  }
}

function addNewUser(name, username, password, role, allowedClients) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Users");
    
    // التأكد إن اليوزرنيم مش متكرر
    const existingUsers = getSheetData("Users", false);
    const isDuplicate = existingUsers.some(u => u.Username === username && String(u.Is_Deleted).toUpperCase() !== "TRUE");
    if(isDuplicate) throw new Error("اسم المستخدم (Username) موجود بالفعل، اختر اسماً آخر.");

    const newId = "USR_" + new Date().getTime();
    const date = new Date().toLocaleString('en-GB');
    const creator = Session.getActiveUser().getEmail() || 'Admin';

    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    let newRow = new Array(headers.length).fill("");

    newRow[headers.indexOf("User_ID")] = newId;
    newRow[headers.indexOf("Name")] = name;
    newRow[headers.indexOf("Username")] = username;
    newRow[headers.indexOf("Password")] = password;
    newRow[headers.indexOf("Role")] = role;
    newRow[headers.indexOf("Allowed_Clients")] = allowedClients || "ALL";
    newRow[headers.indexOf("Is_Active")] = true;
    newRow[headers.indexOf("Created_At")] = date;
    newRow[headers.indexOf("Created_By")] = creator;
    newRow[headers.indexOf("Is_Deleted")] = false;

    sheet.appendRow(newRow);
    SpreadsheetApp.flush();
    logAction("إدارة المستخدمين", `تم إضافة مستخدم جديد: ${username} بصلاحية ${role}`);
    return {status: "success"};
  } catch(e) { 
    return {status: "error", message: e.message}; 
  }
}

function toggleUserStatus(userId, currentStatus) {
  try {
    const newStatus = !currentStatus; // عكس الحالة الحالية
    updateCellById("Users", userId, "User_ID", "Is_Active", newStatus);
    logAction("إدارة المستخدمين", `تم تغيير حالة المستخدم (ID: ${userId}) إلى ${newStatus ? 'نشط' : 'معطل'}`);
    return {status: "success"};
  } catch(e) {
    return {status: "error", message: e.message}; 
  }
}

function deleteUserAccount(userId, username) {
  try {
    updateCellById("Users", userId, "User_ID", "Is_Deleted", true);
    logAction("إدارة المستخدمين", `تم حذف المستخدم: ${username}`);
    return {status: "success"};
  } catch(e) {
    return {status: "error", message: e.message}; 
  }
}