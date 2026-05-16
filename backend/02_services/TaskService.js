/**
 * TaskService (Business Logic Layer)
 * Core business logic for Task management.
 * Handles RBAC-filtered retrieval, creation, completion with proof-of-work, and admin operations.
 */
class TaskService {
  constructor(taskRepository, logRepository, userRepository, clientRepository) {
    this.taskRepo = taskRepository;
    this.logRepo = logRepository;
    this.userRepo = userRepository;
    this.clientRepo = clientRepository;
  }

  /**
   * Permission Check: Only Admins can perform management actions.
   */
  _checkAdmin(userEmail, action) {
    if (!userEmail) throw new Error("مستخدم غير معرف لعملية " + action);
    const user = this.userRepo.findByUsername(userEmail);
    if (!user) throw new Error("مستخدم غير صالح لعملية " + action);
    if (user.Role !== Config.ROLES.ADMIN) {
      throw new Error("هذه العملية متاحة فقط للمسؤولين: " + action);
    }
    return user;
  }

  /**
   * Get tasks with RBAC filtering.
   * Admins see ALL tasks. Users/Viewers see ONLY their assigned tasks.
   * @param {string} userEmail - Username of the requesting user
   * @returns {Object[]}
   */
  getAllTasks(userEmail) {
    if (!userEmail) throw new Error("مستخدم غير معرف.");
    const user = this.userRepo.findByUsername(userEmail);
    if (!user) throw new Error("مستخدم غير صالح.");

    if (user.Role === Config.ROLES.ADMIN) {
      return this.taskRepo.findAll();
    }

    // Non-admin: return only tasks assigned to this user
    return this.taskRepo.findByAssignee(user.User_ID);
  }

  /**
   * Create a new task (Admin-only).
   * @param {string} title - Task title (required)
   * @param {string} description - Task description
   * @param {string} assignedTo - User_ID of the assignee (required)
   * @param {string} clientId - Optional Client_ID
   * @param {string} deadline - Deadline date string (required)
   * @param {number} warningDays - Days before deadline for yellow warning
   * @param {number} criticalDays - Days before deadline for red critical
   * @param {string} templateId - Optional source Template_ID
   * @param {string} userEmail - Admin username
   * @returns {Object} The created task
   */
  addTask(title, description, assignedTo, clientId, deadline, warningDays, criticalDays, templateId, userEmail) {
    this._checkAdmin(userEmail, "إنشاء مهمة");

    // Validation: Required fields
    if (!title || title.trim() === "") {
      throw new Error("عنوان المهمة حقل إجباري.");
    }
    if (!assignedTo || assignedTo.trim() === "") {
      throw new Error("يجب تحديد المستخدم المسؤول عن المهمة.");
    }
    if (!deadline || deadline.trim() === "") {
      throw new Error("يجب تحديد موعد نهائي للمهمة.");
    }

    // Validate assignee exists and is active
    const assignee = this.userRepo.findById(assignedTo);
    if (!assignee) {
      throw new Error("المستخدم المحدد غير موجود في النظام.");
    }
    if (String(assignee.Is_Deleted).toUpperCase() === "TRUE") {
      throw new Error("المستخدم المحدد موقوف. لا يمكن تعيين مهمة له.");
    }

    // Validate client exists if provided
    if (clientId && clientId.trim() !== "") {
      const client = this.clientRepo.findById(clientId);
      if (!client) {
        throw new Error("العميل المحدد غير موجود في النظام.");
      }
    }

    const newTask = {
      "Task_ID": "TSK_" + new Date().getTime(),
      "Template_ID": templateId || "",
      "Title": title.trim(),
      "Description": (description || "").trim(),
      "Assigned_To": assignedTo,
      "Client_ID": clientId || "",
      "Deadline": deadline,
      "Warning_Days": parseInt(warningDays, 10) || 3,
      "Critical_Days": parseInt(criticalDays, 10) || 1,
      "Status": Config.TASK_STATUS.PENDING,
      "Completion_Note": "",
      "Completed_At": "",
      "Rejection_Reason": "",
      "Created_By": userEmail,
      "Created_At": new Date().toLocaleString('en-GB'),
      "Is_Deleted": false
    };

    const created = this.taskRepo.create(newTask);
    this.logRepo.logAction(
      "إنشاء مهمة",
      `تم إنشاء مهمة "${title}" وتعيينها للمستخدم ${assignedTo}`,
      userEmail
    );
    return created;
  }

  /**
   * Submit a task for review with a mandatory Completion Note (Proof of Work).
   * Changes status from Pending → Needs_Review (NOT directly to Completed).
   * @param {string} taskId - Task to submit
   * @param {string} completionNote - Required proof-of-work note
   * @param {string} userEmail - Username of the requester
   */
  completeTask(taskId, completionNote, userEmail) {
    if (!userEmail) throw new Error("مستخدم غير معرف.");
    const user = this.userRepo.findByUsername(userEmail);
    if (!user) throw new Error("مستخدم غير صالح.");

    const task = this.taskRepo.findById(taskId);
    if (!task) throw new Error("المهمة غير موجودة.");

    if (task.Status === Config.TASK_STATUS.COMPLETED) {
      throw new Error("هذه المهمة مكتملة بالفعل.");
    }
    if (task.Status === Config.TASK_STATUS.NEEDS_REVIEW) {
      throw new Error("هذه المهمة في انتظار مراجعة المسؤول بالفعل.");
    }

    // RBAC: Only the assignee or an Admin can submit
    if (user.Role !== Config.ROLES.ADMIN && task.Assigned_To !== user.User_ID) {
      throw new Error("لا يمكنك إكمال مهمة غير معينة لك.");
    }
    if (user.Role === Config.ROLES.VIEWER) {
      throw new Error("صلاحيات القراءة فقط. لا يمكنك إكمال المهام.");
    }

    if (!completionNote || completionNote.trim() === "") {
      throw new Error("يجب كتابة ملاحظة الإنجاز قبل إكمال المهمة.");
    }

    this.taskRepo.update(taskId, {
      "Status": Config.TASK_STATUS.NEEDS_REVIEW,
      "Completion_Note": completionNote.trim(),
      "Completed_At": new Date().toLocaleString('en-GB'),
      "Rejection_Reason": ""
    });

    this.logRepo.logAction(
      "تقديم مهمة للمراجعة",
      `تم تقديم المهمة "${task.Title}" للمراجعة | ملاحظة: ${completionNote.trim()}`,
      userEmail
    );
    return true;
  }

  /**
   * Approve a task (Admin-only). Changes status from Needs_Review → Completed.
   * @param {string} taskId
   * @param {string} userEmail - Admin username
   */
  approveTask(taskId, userEmail) {
    this._checkAdmin(userEmail, "اعتماد مهمة");

    const task = this.taskRepo.findById(taskId);
    if (!task) throw new Error("المهمة غير موجودة.");

    if (task.Status !== Config.TASK_STATUS.NEEDS_REVIEW) {
      throw new Error("لا يمكن اعتماد مهمة ليست في حالة انتظار المراجعة.");
    }

    this.taskRepo.update(taskId, {
      "Status": Config.TASK_STATUS.COMPLETED
    });

    this.logRepo.logAction(
      "اعتماد مهمة",
      `تم اعتماد المهمة "${task.Title}" (${taskId})`,
      userEmail
    );
    return true;
  }

  /**
   * Reject a task (Admin-only). Changes status from Needs_Review → Pending with reason.
   * @param {string} taskId
   * @param {string} reason - Mandatory rejection reason
   * @param {string} userEmail - Admin username
   */
  rejectTask(taskId, reason, userEmail) {
    this._checkAdmin(userEmail, "رفض مهمة");

    const task = this.taskRepo.findById(taskId);
    if (!task) throw new Error("المهمة غير موجودة.");

    if (task.Status !== Config.TASK_STATUS.NEEDS_REVIEW) {
      throw new Error("لا يمكن رفض مهمة ليست في حالة انتظار المراجعة.");
    }

    if (!reason || reason.trim() === "") {
      throw new Error("يجب كتابة سبب الرفض.");
    }

    this.taskRepo.update(taskId, {
      "Status": Config.TASK_STATUS.PENDING,
      "Rejection_Reason": reason.trim(),
      "Completion_Note": "",
      "Completed_At": ""
    });

    this.logRepo.logAction(
      "رفض مهمة",
      `تم رفض المهمة "${task.Title}" | السبب: ${reason.trim()}`,
      userEmail
    );
    return true;
  }

  /**
   * Update a task (Admin-only).
   */
  updateTask(taskId, updateData, userEmail) {
    this._checkAdmin(userEmail, "تعديل مهمة");

    if (updateData.Title && updateData.Title.trim() === "") {
      throw new Error("عنوان المهمة لا يمكن أن يكون فارغاً.");
    }

    this.taskRepo.update(taskId, updateData);
    this.logRepo.logAction("تعديل مهمة", `تم تعديل المهمة ID: ${taskId}`, userEmail);
    return true;
  }

  /**
   * Soft-delete a task (Admin-only).
   */
  deleteTask(taskId, userEmail) {
    this._checkAdmin(userEmail, "حذف مهمة");
    const success = this.taskRepo.softDelete(taskId);
    if (!success) throw new Error("تعذر حذف المهمة، قد تكون غير موجودة.");
    this.logRepo.logAction("حذف مهمة", `تم حذف المهمة ID: ${taskId}`, userEmail);
    return true;
  }
}

const taskService = new TaskService(taskRepo, logRepo, userRepo, clientRepo);
