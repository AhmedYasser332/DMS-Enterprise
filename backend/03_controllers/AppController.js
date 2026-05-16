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
function api_getInitialAppData(userEmail) {
  try {
    // نقوم بجلب كل البيانات المطلوبة للذاكرة المركزية عبر طبقة الخدمات (Services) للحفاظ على المعمارية النظيفة
    const data = {
      clients: clientService.getAllClients(),
      groups: groupService.getAllGroups(),
      records: recordService.getAllRecords(),
      attachments: attachmentService.getAllAttachments(),
      users: userService.getAllUsers(),
      tags: tagService.getAllTags(),
      legalEntities: legalEntityService.getAllEntities(),
      tasks: taskService.getAllTasks(userEmail),
      taskTemplates: taskTemplateService.getAllTemplates()
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

// ==========================================
// 9. Legal Entities API
// ==========================================
function api_addLegalEntity(name, color, userEmail) {
  try {
    const res = legalEntityService.addEntity(name, color, userEmail);
    return ResponseFactory.success(res, "تم إضافة الكيان القانوني");
  } catch (error) { return ResponseFactory.error(error.message); }
}

function api_updateLegalEntity(entityId, name, color, userEmail) {
  try {
    const res = legalEntityService.updateEntity(entityId, name, color, userEmail);
    return ResponseFactory.success(res, "تم تعديل الكيان بنجاح");
  } catch (error) { return ResponseFactory.error(error.message); }
}

function api_deleteLegalEntity(entityId, name, userEmail) {
  try {
    const res = legalEntityService.deleteEntity(entityId, name, userEmail);
    return ResponseFactory.success(res, "تم مسح الكيان القانوني");
  } catch (error) { return ResponseFactory.error(error.message); }
}

// ==========================================
// 10. Task Templates API
// ==========================================
function api_getAllTaskTemplates() {
  try {
    const templates = taskTemplateService.getAllTemplates();
    return ResponseFactory.success(templates, "تم جلب القوالب");
  } catch (error) { return ResponseFactory.error(error.message); }
}

function api_addTaskTemplate(title, description, warningDays, criticalDays, userEmail) {
  try {
    const res = taskTemplateService.addTemplate(title, description, warningDays, criticalDays, userEmail);
    return ResponseFactory.success(res, "تم إضافة القالب");
  } catch (error) { return ResponseFactory.error(error.message); }
}

function api_updateTaskTemplate(templateId, updateData, userEmail) {
  try {
    const res = taskTemplateService.updateTemplate(templateId, updateData, userEmail);
    return ResponseFactory.success(res, "تم تعديل القالب");
  } catch (error) { return ResponseFactory.error(error.message); }
}

function api_deleteTaskTemplate(templateId, userEmail) {
  try {
    const res = taskTemplateService.deleteTemplate(templateId, userEmail);
    return ResponseFactory.success(res, "تم حذف القالب");
  } catch (error) { return ResponseFactory.error(error.message); }
}

// ==========================================
// 11. Tasks API
// ==========================================
function api_getAllTasks(userEmail) {
  try {
    const tasks = taskService.getAllTasks(userEmail);
    return ResponseFactory.success(tasks, "تم جلب المهام");
  } catch (error) { return ResponseFactory.error(error.message); }
}

function api_addTask(title, description, assignedTo, clientId, deadline, warningDays, criticalDays, templateId, userEmail) {
  try {
    const res = taskService.addTask(title, description, assignedTo, clientId, deadline, warningDays, criticalDays, templateId, userEmail);
    return ResponseFactory.success(res, "تم إنشاء المهمة بنجاح");
  } catch (error) { return ResponseFactory.error(error.message); }
}

function api_completeTask(taskId, completionNote, userEmail) {
  try {
    const res = taskService.completeTask(taskId, completionNote, userEmail);
    return ResponseFactory.success(res, "تم تقديم المهمة للمراجعة");
  } catch (error) { return ResponseFactory.error(error.message); }
}

function api_approveTask(taskId, userEmail) {
  try {
    const res = taskService.approveTask(taskId, userEmail);
    return ResponseFactory.success(res, "تم اعتماد المهمة بنجاح");
  } catch (error) { return ResponseFactory.error(error.message); }
}

function api_rejectTask(taskId, reason, userEmail) {
  try {
    const res = taskService.rejectTask(taskId, reason, userEmail);
    return ResponseFactory.success(res, "تم رفض المهمة");
  } catch (error) { return ResponseFactory.error(error.message); }
}

function api_updateTask(taskId, updateData, userEmail) {
  try {
    const res = taskService.updateTask(taskId, updateData, userEmail);
    return ResponseFactory.success(res, "تم تعديل المهمة");
  } catch (error) { return ResponseFactory.error(error.message); }
}

function api_deleteTask(taskId, userEmail) {
  try {
    const res = taskService.deleteTask(taskId, userEmail);
    return ResponseFactory.success(res, "تم حذف المهمة");
  } catch (error) { return ResponseFactory.error(error.message); }
}
