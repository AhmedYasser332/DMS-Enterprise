/**
 * App Controllers (Facade Layer)
 * البوابات الرسمية والوحيدة التي يمكن للواجهة الأمامية (Frontend) التحدث معها
 */

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
    // نمرر البيانات لخدمة المرفقات للرفع على Drive والحفظ بالشيت
    const result = attachmentService.uploadAttachment(recordId, fileName, base64Data, mimeType, userEmail);
    return ResponseFactory.success(result, result.message);
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


// ==========================================
// 6. System Boot Controller (تحميل أولي)
// ==========================================
function api_getInitialAppData() {
  try {
    // نقوم بجلب كل البيانات المطلوبة للذاكرة المركزية
    const data = {
      clients: clientService.getAllClients(),
      groups: groupRepo.findAll(), // بنستخدم الـ Repo مباشرة للسرعة لو مفيش Business Logic معقد
      records: recordRepo.findAll(),
      attachments: attachmentRepo.findAll(),
      users: userRepo.findAll()
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