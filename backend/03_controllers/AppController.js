/**
 * App Controllers (Facade Layer)
 * البوابات الرسمية والوحيدة التي يمكن للواجهة الأمامية (Frontend) التحدث معها
 */

// ==========================================
// 1. Auth Controllers (تسجيل الدخول)
// ==========================================
function api_login(username, password) {
  return ResponseFactory.execute(
    () => authService.login(username, password),
    data => `أهلاً بك يا ${data.name}`
  );
}

// ==========================================
// 2. Client Controllers (العملاء)
// ==========================================
function api_getAllClients() {
  return ResponseFactory.execute(() => clientService.getAllClients(), "تم جلب العملاء بنجاح");
}

function api_addClient(name, taxId, legalEntity, userEmail) {
  return ResponseFactory.execute(
    () => clientService.addClient(name, taxId, legalEntity, userEmail),
    "تم إضافة العميل بنجاح"
  );
}

function api_deleteClient(clientId, clientName, userEmail) {
  return ResponseFactory.execute(
    () => clientService.deleteClient(clientId, clientName, userEmail),
    "تم نقل العميل لسلة المهملات"
  );
}

// ==========================================
// 3. Group Controllers (الأقسام/المجموعات)
// ==========================================
function api_getGroupsByClient(clientId) {
  return ResponseFactory.execute(() => groupService.getGroupsByClient(clientId));
}

function api_addGroup(clientId, groupName, userEmail) {
  return ResponseFactory.execute(
    () => groupService.addGroup(clientId, groupName, userEmail),
    "تم إضافة المجموعة بنجاح"
  );
}

function api_deleteGroup(groupId, groupName, userEmail) {
  return ResponseFactory.execute(
    () => groupService.deleteGroup(groupId, groupName, userEmail),
    "تم حذف المجموعة"
  );
}

// ==========================================
// 4. Record Controllers (السجلات)
// ==========================================
function api_getRecordsByGroup(groupId) {
  return ResponseFactory.execute(() => recordService.getRecordsByGroup(groupId));
}

function api_addRecord(groupId, title, description, tags, userEmail) {
  return ResponseFactory.execute(
    () => recordService.addRecord(groupId, title, description, tags, userEmail),
    "تمت إضافة السجل بنجاح"
  );
}

function api_deleteRecord(recordId, title, userEmail) {
  return ResponseFactory.execute(
    () => recordService.deleteRecord(recordId, title, userEmail),
    "تم حذف السجل"
  );
}

// ==========================================
// 5. Attachment Controllers (المرفقات)
// ==========================================
function api_uploadAttachment(recordId, fileName, base64Data, mimeType, userEmail) {
  return ResponseFactory.execute(
    () => attachmentService.uploadAttachment(recordId, fileName, base64Data, mimeType, userEmail),
    "تم رفع الملف بنجاح!"
  );
}

function api_deleteAttachment(fileId, fileName, userEmail) {
  return ResponseFactory.execute(
    () => attachmentService.deleteAttachment(fileId, fileName, userEmail),
    "تم حذف المرفق بنجاح"
  );
}

function api_getFileBase64(driveFileId) {
  return ResponseFactory.execute(
    () => attachmentService.getFileBase64(driveFileId),
    "تم جلب بيانات الملف للطباعة"
  );
}

// ==========================================
// 6. System Boot Controller (تحميل أولي)
// ==========================================
function api_getInitialAppData(userEmail) {
  return ResponseFactory.execute(() => {
    // نقوم بجلب كل البيانات المطلوبة للذاكرة المركزية عبر طبقة الخدمات (Services) للحفاظ على المعمارية النظيفة
    return {
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
  }, "تم تحميل النظام");
}

// ==========================================
// 7. Trash & Users API
// ==========================================
function api_getTrashData() {
  return ResponseFactory.execute(() => trashService.getDeletedItems());
}

function api_restoreItem(type, id, name, userEmail) {
  return ResponseFactory.execute(() => {
    trashService.restoreItem(type, id, name, userEmail);
    return null;
  }, "تمت الاستعادة");
}

function api_permanentDelete(type, id, name, userEmail) {
  return ResponseFactory.execute(() => {
    trashService.permanentDelete(type, id, name, userEmail);
    return null;
  }, "تم الحذف النهائي");
}

function api_addUser(userData, adminEmail) {
  return ResponseFactory.execute(() => userService.addUser(userData, adminEmail), "تم إضافة المستخدم");
}

function api_updateUser(userId, userData, adminEmail) {
  return ResponseFactory.execute(() => userService.updateUser(userId, userData, adminEmail), "تم التعديل بنجاح");
}

function api_uploadAvatar(userId, base64Data, mimeType, adminEmail) {
  return ResponseFactory.execute(() => userService.uploadAvatar(userId, base64Data, mimeType, adminEmail), "تم رفع الصورة بنجاح");
}

function api_deleteUser(userId, adminEmail) {
  return ResponseFactory.execute(() => userService.deleteUser(userId, adminEmail), "تم الإيقاف بنجاح");
}

function api_getLogs() {
  return ResponseFactory.execute(() => logService.getAllLogs(), "تم جلب السجلات");
}

// ==========================================
// 8. Tags API
// ==========================================
function api_addTag(name, color, userEmail) {
  return ResponseFactory.execute(() => tagService.addTag(name, color, userEmail), "تم إضافة التاج");
}

function api_updateTag(tagId, name, color, userEmail) {
  return ResponseFactory.execute(() => tagService.updateTag(tagId, name, color, userEmail), "تم التعديل بنجاح");
}

function api_deleteTag(tagId, name, userEmail) {
  return ResponseFactory.execute(() => tagService.deleteTag(tagId, name, userEmail), "تم مسح التاج");
}

// ==========================================
// 9. Legal Entities API
// ==========================================
function api_addLegalEntity(name, color, userEmail) {
  return ResponseFactory.execute(() => legalEntityService.addEntity(name, color, userEmail), "تم إضافة الكيان القانوني");
}

function api_updateLegalEntity(entityId, name, color, userEmail) {
  return ResponseFactory.execute(() => legalEntityService.updateEntity(entityId, name, color, userEmail), "تم تعديل الكيان بنجاح");
}

function api_deleteLegalEntity(entityId, name, userEmail) {
  return ResponseFactory.execute(() => legalEntityService.deleteEntity(entityId, name, userEmail), "تم مسح الكيان القانوني");
}

// ==========================================
// 10. Task Templates API
// ==========================================
function api_getAllTaskTemplates() {
  return ResponseFactory.execute(() => taskTemplateService.getAllTemplates(), "تم جلب القوالب");
}

function api_addTaskTemplate(title, description, warningDays, criticalDays, userEmail) {
  return ResponseFactory.execute(
    () => taskTemplateService.addTemplate(title, description, warningDays, criticalDays, userEmail),
    "تم إضافة القالب"
  );
}

function api_updateTaskTemplate(templateId, updateData, userEmail) {
  return ResponseFactory.execute(() => taskTemplateService.updateTemplate(templateId, updateData, userEmail), "تم تعديل القالب");
}

function api_deleteTaskTemplate(templateId, userEmail) {
  return ResponseFactory.execute(() => taskTemplateService.deleteTemplate(templateId, userEmail), "تم حذف القالب");
}

// ==========================================
// 11. Tasks API
// ==========================================
function api_getAllTasks(userEmail) {
  return ResponseFactory.execute(() => taskService.getAllTasks(userEmail), "تم جلب المهام");
}

function api_addTask(title, description, assignedTo, clientId, deadline, warningDays, criticalDays, templateId, userEmail) {
  return ResponseFactory.execute(
    () => taskService.addTask(title, description, assignedTo, clientId, deadline, warningDays, criticalDays, templateId, userEmail),
    "تم إنشاء المهمة بنجاح"
  );
}

function api_completeTask(taskId, completionNote, userEmail) {
  return ResponseFactory.execute(() => taskService.completeTask(taskId, completionNote, userEmail), "تم تقديم المهمة للمراجعة");
}

function api_approveTask(taskId, userEmail) {
  return ResponseFactory.execute(() => taskService.approveTask(taskId, userEmail), "تم اعتماد المهمة بنجاح");
}

function api_rejectTask(taskId, reason, userEmail) {
  return ResponseFactory.execute(() => taskService.rejectTask(taskId, reason, userEmail), "تم رفض المهمة");
}

function api_updateTask(taskId, updateData, userEmail) {
  return ResponseFactory.execute(() => taskService.updateTask(taskId, updateData, userEmail), "تم تعديل المهمة");
}

function api_deleteTask(taskId, userEmail) {
  return ResponseFactory.execute(() => taskService.deleteTask(taskId, userEmail), "تم حذف المهمة");
}
