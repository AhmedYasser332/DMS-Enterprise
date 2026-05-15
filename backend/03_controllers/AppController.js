/**
 * App Controllers (Facade Layer)
 * البوابات الرسمية والوحيدة التي يمكن للواجهة الأمامية (Frontend) التحدث معها
 */

function _enforcePermission(userEmail, actionType) {
  // adminEmail or userEmail is passed. We fetch the user from DB.
  if(!userEmail || userEmail === 'System') return; // Bypass for initial setup or system calls if necessary
  const user = userService.userRepo.findByUsername(userEmail);
  if(!user) throw new Error("مستخدم غير صالح لعملية " + actionType);
  if(user.Role === 'Admin') return; // Admins can do everything
  if(user.Role === 'Viewer') throw new Error("صلاحيات القراءة فقط. لا يمكنك " + actionType);
  
  // Custom permissions check can be expanded here based on actionType
}

// ==========================================
// 1. Auth Controllers (تسجيل الدخول)
// ==========================================
function api_login(username, password) {
  try {
    const userData = authService.login(username, password);
    return ResponseFactory.success(userData, `أهلاً بك يا ${userData.name}`);
  } catch (error) {
    return ResponseFactory.error(error.message);
  }
}

// ==========================================
// 2. Client Controllers (العملاء)
// ==========================================
function api_getAllClients() {
  try {
    const clients = clientService.getAllClients();
    return ResponseFactory.success(clients, "تم جلب العملاء بنجاح");
  } catch (error) {
    return ResponseFactory.error(error.message);
  }
}

function api_addClient(name, taxId, legalEntity, userEmail) {
  try {

    const newClient = clientService.addClient(name, taxId, legalEntity, userEmail);
    return ResponseFactory.success(newClient, "تم إضافة العميل بنجاح");
  } catch (error) {
    return ResponseFactory.error(error.message);
  }
}

function api_deleteClient(clientId, clientName, userEmail) {
  try {

    clientService.deleteClient(clientId, clientName, userEmail);
    return ResponseFactory.success(null, "تم نقل العميل لسلة المهملات");
  } catch (error) {
    return ResponseFactory.error(error.message);
  }
}

// ==========================================
// 3. Group Controllers (الأقسام/المجموعات)
// ==========================================
function api_getGroupsByClient(clientId) {
  try {
    const groups = groupService.getGroupsByClient(clientId);
    return ResponseFactory.success(groups);
  } catch (error) {
    return ResponseFactory.error(error.message);
  }
}

function api_addGroup(clientId, groupName, userEmail) {
  try {

    const newGroup = groupService.addGroup(clientId, groupName, userEmail);
    return ResponseFactory.success(newGroup, "تم إضافة المجموعة بنجاح");
  } catch (error) {
    return ResponseFactory.error(error.message);
  }
}

function api_deleteGroup(groupId, groupName, userEmail) {
  try {

    groupService.deleteGroup(groupId, groupName, userEmail);
    return ResponseFactory.success(null, "تم حذف المجموعة");
  } catch (error) {
    return ResponseFactory.error(error.message);
  }
}

// ==========================================
// 4. Record Controllers (السجلات)
// ==========================================
function api_getRecordsByGroup(groupId) {
  try {
    const records = recordService.getRecordsByGroup(groupId);
    return ResponseFactory.success(records);
  } catch (error) {
    return ResponseFactory.error(error.message);
  }
}

function api_addRecord(groupId, title, description, tags, userEmail) {
  try {

    const newRecord = recordService.addRecord(groupId, title, description, tags, userEmail);
    return ResponseFactory.success(newRecord, "تمت إضافة السجل بنجاح");
  } catch (error) {
    return ResponseFactory.error(error.message);
  }
}

function api_deleteRecord(recordId, title, userEmail) {
  try {

    recordService.deleteRecord(recordId, title, userEmail);
    return ResponseFactory.success(null, "تم حذف السجل");
  } catch (error) {
    return ResponseFactory.error(error.message);
  }
}

// ==========================================
// 5. Attachment Controllers (المرفقات)
// ==========================================
function api_uploadAttachment(recordId, fileName, base64Data, mimeType, userEmail) {
  try {

    const newAttachment = attachmentService.uploadAttachment(recordId, fileName, base64Data, mimeType, userEmail);
    return ResponseFactory.success(newAttachment, "تم رفع الملف بنجاح!");
  } catch (error) {
    return ResponseFactory.error(error.message);
  }
}

function api_deleteAttachment(fileId, fileName, userEmail) {
  try {

    attachmentService.deleteAttachment(fileId, fileName, userEmail);
    return ResponseFactory.success(null, "تم حذف المرفق بنجاح");
  } catch (error) {
    return ResponseFactory.error(error.message);
  }
}

function api_getFileBase64(driveFileId) {
  try {
    const data = attachmentService.getFileBase64(driveFileId);
    return ResponseFactory.success(data, "تم جلب بيانات الملف للطباعة");
  } catch (error) {
    return ResponseFactory.error(error.message);
  }
}


// ==========================================
// 6. System Boot Controller (تحميل أولي)
// ==========================================
function api_getInitialAppData() {
  try {
    // نقوم بجلب كل البيانات المطلوبة للذاكرة المركزية عبر طبقة الخدمات (Services) للحفاظ على المعمارية النظيفة
    const data = {
      clients: clientService.getAllClients(),
      groups: groupService.getAllGroups(),
      records: recordService.getAllRecords(),
      attachments: attachmentService.getAllAttachments(),
      users: userService.getAllUsers(),
      tags: tagService.getAllTags()
    };
    return ResponseFactory.success(data, "تم تحميل النظام");
  } catch (error) {
    return ResponseFactory.error(error.message);
  }
}


// ==========================================
// 7. Trash & Users API
// ==========================================
function api_getTrashData() {
  try {
    return ResponseFactory.success(trashService.getDeletedItems());
  } catch (error) { return ResponseFactory.error(error.message); }
}

function api_restoreItem(type, id, name, userEmail) {
  try {
    trashService.restoreItem(type, id, name, userEmail);
    return ResponseFactory.success(null, "تمت الاستعادة");
  } catch (error) { return ResponseFactory.error(error.message); }
}

function api_permanentDelete(type, id, name, userEmail) {
  try {
    trashService.permanentDelete(type, id, name, userEmail);
    return ResponseFactory.success(null, "تم الحذف النهائي");
  } catch (error) { return ResponseFactory.error(error.message); }
}

function api_addUser(userData, adminEmail) {
  try {
    const res = userService.addUser(userData, adminEmail);
    return ResponseFactory.success(res, "تم إضافة المستخدم");
  } catch (error) { return ResponseFactory.error(error.message); }
}

function api_updateUser(userId, userData, adminEmail) {
  try {
    const res = userService.updateUser(userId, userData, adminEmail);
    return ResponseFactory.success(res, "تم التعديل بنجاح");
  } catch (error) { return ResponseFactory.error(error.message); }
}

function api_uploadAvatar(userId, base64Data, mimeType, adminEmail) {
  try {
    const url = userService.uploadAvatar(userId, base64Data, mimeType, adminEmail);
    return ResponseFactory.success(url, "تم رفع الصورة بنجاح");
  } catch (error) { return ResponseFactory.error(error.message); }
}

function api_deleteUser(userId, adminEmail) {
  try {
    const res = userService.deleteUser(userId, adminEmail);
    return ResponseFactory.success(res, "تم الإيقاف بنجاح");
  } catch (error) { return ResponseFactory.error(error.message); }
}

function api_getLogs() {
  try {
    const logs = logService.getAllLogs();
    return ResponseFactory.success(logs, "تم جلب السجلات");
  } catch (error) { return ResponseFactory.error(error.message); }
}

// ==========================================
// 8. Tags API
// ==========================================
function api_addTag(name, color, userEmail) {
  try {

    const res = tagService.addTag(name, color, userEmail);
    return ResponseFactory.success(res, "تم إضافة التاج");
  } catch (error) { return ResponseFactory.error(error.message); }
}

function api_updateTag(tagId, name, color, userEmail) {
  try {

    const res = tagService.updateTag(tagId, name, color, userEmail);
    return ResponseFactory.success(res, "تم التعديل بنجاح");
  } catch (error) { return ResponseFactory.error(error.message); }
}

function api_deleteTag(tagId, name, userEmail) {
  try {

    const res = tagService.deleteTag(tagId, name, userEmail);
    return ResponseFactory.success(res, "تم مسح التاج");
  } catch (error) { return ResponseFactory.error(error.message); }
}
