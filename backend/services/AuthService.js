/**
 * AuthService (Business Logic Layer)
 * مسؤولة عن عمليات المصادقة وتسجيل الدخول
 */
class AuthService {
  // حقن التبعيات (Dependency Injection) - نمرر الـ Repositories في الـ Constructor
  constructor(userRepository, logRepository) {
    this.userRepo = userRepository;
    this.logRepo = logRepository;
  }

  /**
   * تسجيل الدخول
   * @param {string} username 
   * @param {string} password 
   */
  login(username, password) {
    const user = this.userRepo.findByUsername(username);

    // Business Rules (قواعد العمل)
    if (!user) {
      throw new Error("اسم المستخدم غير موجود بالنظام.");
    }
    if (user.Password !== password) {
      throw new Error("كلمة المرور غير صحيحة.");
    }
    if (String(user.Is_Active).toUpperCase() !== "TRUE" || String(user.Is_Deleted).toUpperCase() === "TRUE") {
      throw new Error("عفواً، هذا الحساب موقوف أو تم حذفه.");
    }

    // DTO (Data Transfer Object) - استخراج البيانات المطلوبة فقط بدون الباسوورد للأمان
    const userDTO = {
      id: user.User_ID,
      name: user.Name,
      username: user.Username,
      role: user.Role,
      allowedClients: user.Allowed_Clients
    };

    // تسجيل الحدث
    this.logRepo.logAction("تسجيل دخول", `المستخدم ${user.Name} سجل الدخول للنظام`, user.Username);

    return userDTO;
  }
}

// إنشاء الـ Service وحقن الـ Repositories بداخلها
const authService = new AuthService(userRepo, logRepo);