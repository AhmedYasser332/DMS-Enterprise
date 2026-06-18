/**
 * System Configuration
 * المركز الرئيسي لإعدادات النظام بالكامل
 */
const Config = {
  // معرف قاعدة البيانات (الشيت الحالي)
  DATABASE_ID: SpreadsheetApp.getActiveSpreadsheet().getId(),
  
  // أسماء الجداول (الشيتات)
  TABLES: {
    CLIENTS: "Clients",
    GROUPS: "Groups",
    RECORDS: "Records",
    ATTACHMENTS: "Attachments",
    USERS: "Users",
    LOGS: "Activity_Log",
    TAGS: "Tags",
    LEGAL_ENTITIES: "Legal_Entities",
    TASKS: "Tasks",
    TASK_TEMPLATES: "Task_Templates",
    TAX_CONFIG: "TaxConfig",
    CREDENTIALS: "Credentials",
    NOTIFICATIONS: "Notifications"
  },
  
  // أنواع الصلاحيات (Roles)
  ROLES: {
    ADMIN: "Admin",
    USER: "User",
    VIEWER: "Viewer"
  },

  // حالات المهام (Task Status)
  TASK_STATUS: {
    PENDING: "Pending",
    NEEDS_REVIEW: "Needs_Review",
    COMPLETED: "Completed"
  },

  // حالات الرد (Response Status)
  STATUS: {
    SUCCESS: "success",
    ERROR: "error"
  }
};

// تجميد الكائن لمنع تعديله برمجياً بالخطأ في أي مكان آخر في التطبيق (Immutability)
Object.freeze(Config);
Object.freeze(Config.TABLES);
Object.freeze(Config.ROLES);
Object.freeze(Config.TASK_STATUS);
Object.freeze(Config.STATUS);
