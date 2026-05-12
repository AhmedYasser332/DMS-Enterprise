class UserService {
  constructor(userRepository, logRepository) {
    this.userRepo = userRepository;
    this.logRepo = logRepository;
  }

  addUser(userData, adminEmail) {
    // Validation: التأكد من عدم تكرار Username
    if (this.userRepo.findByUsername(userData.Username)) {
      throw new Error("اسم المستخدم موجود بالفعل!");
    }
    
    const newUser = {
      ...userData,
      "User_ID": "USR_" + new Date().getTime(),
      "Created_At": new Date().toLocaleString('en-GB'),
      "Created_By": adminEmail,
      "Is_Deleted": false
    };
    
    const res = this.userRepo.create(newUser);
    this.logRepo.logAction("إدارة مستخدمين", `تم إضافة مستخدم جديد: ${userData.Name}`, adminEmail);
    return res;
  }
}

const userService = new UserService(userRepo, logRepo);