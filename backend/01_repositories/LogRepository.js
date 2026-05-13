/**
 * مستودع تسجيل النشاطات (System Logs)
 */
class LogRepository extends BaseRepository {
  constructor() {
    super(Config.TABLES.LOGS, "Log_ID");
  }

  /**
   * دالة مخصصة لتسجيل أي حدث في النظام بسرعة
   * @param {string} action - نوع الحدث (مثال: تسجيل دخول، خطأ برمجي)
   * @param {string} details - التفاصيل
   * @param {string} userEmail - الإيميل أو اسم المستخدم
   */
  logAction(action, details, userEmail = "System") {
    const logObj = {
      "Log_ID": "LOG_" + new Date().getTime(),
      "User_ID": userEmail,
      "Action": action,
      "Details": details,
      "Timestamp": new Date().toLocaleString('en-GB')
    };
    
    // استخدام دالة الإضافة الموروثة من BaseRepository
    this.create(logObj);
  }
}

const logRepo = new LogRepository();