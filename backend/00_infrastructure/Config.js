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
    GROUPS: "Data_Groups",
    RECORDS: "Records",
    ATTACHMENTS: "Attachments",
    USERS: "Users",
    LOGS: "Activity_Log"
  },
  
  // أنواع الصلاحيات (Roles)
  ROLES: {
    ADMIN: "Admin",
    USER: "User",
    VIEWER: "Viewer"
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
Object.freeze(Config.STATUS);