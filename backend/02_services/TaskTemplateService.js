/**
 * TaskTemplateService (Business Logic Layer)
 * Handles business rules for Task Templates — Admin-only operations.
 */
class TaskTemplateService {
  constructor(templateRepository, logRepository, userRepository) {
    this.templateRepo = templateRepository;
    this.logRepo = logRepository;
    this.userRepo = userRepository;
  }

  /**
   * Permission Check: Only Admins can manage templates.
   * @param {string} userEmail - Username of the requesting user
   * @param {string} action - Description of the action for error messages
   */
  _checkAdmin(userEmail, action) {
    if (!userEmail) throw new Error("مستخدم غير معرف لعملية " + action);
    const user = this.userRepo.findByUsername(userEmail);
    if (!user) throw new Error("مستخدم غير صالح لعملية " + action);
    if (user.Role !== Config.ROLES.ADMIN) {
      throw new Error("صلاحية إدارة القوالب متاحة فقط للمسؤولين.");
    }
  }

  /**
   * Get all active task templates.
   * @returns {Object[]}
   */
  getAllTemplates() {
    return this.templateRepo.findAll();
  }

  /**
   * Create a new task template.
   * @param {string} title - Template title (required)
   * @param {string} description - Default description
   * @param {number} warningDays - Days before deadline for yellow warning
   * @param {number} criticalDays - Days before deadline for red critical
   * @param {string} userEmail - Admin username
   * @returns {Object} The created template
   */
  addTemplate(title, description, warningDays, criticalDays, userEmail) {
    this._checkAdmin(userEmail, "إضافة قالب مهمة");

    // Validation: Title is required
    if (!title || title.trim() === "") {
      throw new Error("عنوان القالب حقل إجباري لا يمكن تركه فارغاً.");
    }

    // Validation: Days must be positive integers
    const wDays = parseInt(warningDays, 10) || 3;
    const cDays = parseInt(criticalDays, 10) || 1;

    if (wDays < 1 || cDays < 1) {
      throw new Error("أيام التحذير والخطر يجب أن تكون أرقام موجبة.");
    }

    if (wDays <= cDays) {
      throw new Error("أيام التحذير يجب أن تكون أكبر من أيام الخطر (مثال: تحذير=3، خطر=1).");
    }

    const newTemplate = {
      "Template_ID": "TT_" + new Date().getTime(),
      "Title": title.trim(),
      "Description": (description || "").trim(),
      "Warning_Days": wDays,
      "Critical_Days": cDays,
      "Created_By": userEmail,
      "Created_At": new Date().toLocaleString('en-GB'),
      "Is_Deleted": false
    };

    const created = this.templateRepo.create(newTemplate);
    this.logRepo.logAction("إضافة قالب مهمة", `تم إنشاء قالب: ${title}`, userEmail);
    return created;
  }

  /**
   * Update an existing template.
   * @param {string} templateId - ID of the template to update
   * @param {Object} updateData - Fields to update
   * @param {string} userEmail - Admin username
   */
  updateTemplate(templateId, updateData, userEmail) {
    this._checkAdmin(userEmail, "تعديل قالب مهمة");

    if (updateData.Title && updateData.Title.trim() === "") {
      throw new Error("عنوان القالب لا يمكن أن يكون فارغاً.");
    }

    // Validate days if provided
    if (updateData.Warning_Days !== undefined && updateData.Critical_Days !== undefined) {
      if (parseInt(updateData.Warning_Days) <= parseInt(updateData.Critical_Days)) {
        throw new Error("أيام التحذير يجب أن تكون أكبر من أيام الخطر.");
      }
    }

    this.templateRepo.update(templateId, updateData);
    this.logRepo.logAction("تعديل قالب مهمة", `تم تعديل القالب ID: ${templateId}`, userEmail);
    return true;
  }

  /**
   * Soft-delete a template.
   * @param {string} templateId
   * @param {string} userEmail
   */
  deleteTemplate(templateId, userEmail) {
    this._checkAdmin(userEmail, "حذف قالب مهمة");
    const success = this.templateRepo.softDelete(templateId);
    if (!success) throw new Error("تعذر حذف القالب، قد يكون غير موجود.");
    this.logRepo.logAction("حذف قالب مهمة", `تم حذف القالب ID: ${templateId}`, userEmail);
    return true;
  }
}

const taskTemplateService = new TaskTemplateService(taskTemplateRepo, logRepo, userRepo);
