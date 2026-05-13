/**
 * AuthService (Business Logic Layer)
 * مسؤولة عن عمليات المصادقة وتسجيل الدخول
 */
class AuthService {
  constructor(userRepository) {
    this.userRepo = userRepository;
  }

  login(username, password) {
    const user = this.userRepo.findByUsername(username);
    
    // 1. التحقق من وجود المستخدم
    if (!user) {
      throw new Error("اسم المستخدم غير موجود!");
    }
    
    // 2. التحقق من كلمة المرور
    if (user.Password !== password) {
      throw new Error("كلمة المرور خاطئة، حاول مرة أخرى!");
    }
    
    // 3. التحقق من حالة الحساب (نشط أم موقوف)
    if (String(user.Is_Active).toUpperCase() !== 'TRUE') {
      throw new Error("هذا الحساب موقوف، يرجى مراجعة الإدارة.");
    }
    
    return {
      id: user.User_ID,
      name: user.Name,
      username: user.Username,
      role: user.Role,
      allowedClients: user.Allowed_Clients || ""
    };
  }
}

// تأكد من تهيئة الكلاس في نهاية الملف
var authService = new AuthService(userRepo);