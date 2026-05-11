/**
 * نظام التحقق من الهوية والصلاحيات (Authentication System)
 */

// 1. دالة تسجيل الدخول
function loginUser(username, password) {
  try {
    const users = getSheetData("Users", false); // جلب كل المستخدمين
    
    // البحث عن المستخدم
    const user = users.find(u => 
      u.Username === username && 
      u.Password === password && 
      String(u.Is_Active).toUpperCase() === "TRUE" &&
      String(u.Is_Deleted).toUpperCase() === "FALSE"
    );

    if (user) {
      // تسجيل الدخول في سجل النشاطات
      logAction("تسجيل دخول", `المستخدم ${user.Name} دخل النظام`);
      
      // نرجع بيانات المستخدم (بدون الباسوورد للأمان)
      return {
        status: "success",
        user: {
          id: user.User_ID,
          name: user.Name,
          role: user.Role,
          allowedClients: user.Allowed_Clients
        }
      };
    } else {
      return { status: "error", message: "اسم المستخدم أو كلمة المرور غير صحيحة" };
    }
  } catch (e) {
    return { status: "error", message: e.toString() };
  }
}