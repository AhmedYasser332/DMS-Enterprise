class UserService {
  constructor(userRepository, logRepository) {
    this.userRepo = userRepository;
    this.logRepo = logRepository;
  }

  getAllUsers() {
    return this.userRepo.findAll();
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

  updateUser(userId, updatedData, adminEmail) {
    // 1. الحماية من ثغرة IDOR
    const requester = this.userRepo.findByUsername(adminEmail);
    if (!requester) {
      throw new Error("المستخدم المنفذ للعملية غير موجود!");
    }
    
    // إذا لم يكن المُعدِّل هو Admin، فيجب أن يكون هو نفسه صاحب الحساب المُراد تعديله
    if (requester.Role !== 'Admin' && String(requester.User_ID) !== String(userId)) {
      throw new Error("غير مصرح لك بتعديل بيانات مستخدم آخر!");
    }

    // 2. if username changed, check for duplicates
    if (updatedData.Username) {
      const existing = this.userRepo.findByUsername(updatedData.Username);
      if (existing && String(existing.User_ID) !== String(userId)) {
        throw new Error("اسم المستخدم موجود بالفعل لمستخدم آخر!");
      }
    }
    
    this.userRepo.update(userId, updatedData);
    this.logRepo.logAction("إدارة مستخدمين", `تم تعديل بيانات المستخدم ID: ${userId}`, adminEmail);
    return true;
  }

  uploadAvatar(userId, base64Data, mimeType, adminEmail) {
    // IDOR Protection: Check if requester is Admin or the same user
    const requester = this.userRepo.findByUsername(adminEmail);
    if (!requester) {
      throw new Error("المستخدم المنفذ للعملية غير موجود!");
    }
    if (requester.Role !== 'Admin' && String(requester.User_ID) !== String(userId)) {
      throw new Error("غير مصرح لك بتعديل بيانات مستخدم آخر!");
    }

    try {
      const folderId = CONFIG.AVATARS_FOLDER_ID || CONFIG.DRIVE_FOLDER_ID; // Fallback to main folder if avatars folder not configured
      const folder = DriveApp.getFolderById(folderId);
      
      const blob = Utilities.newBlob(Utilities.base64Decode(base64Data.split(',')[1]), mimeType, `Avatar_${userId}`);
      const file = folder.createFile(blob);
      
      const driveUrl = file.getUrl();
      
      this.userRepo.update(userId, { Avatar: driveUrl });
      this.logRepo.logAction("الملف الشخصي", `تم رفع صورة شخصية للمستخدم ID: ${userId}`, adminEmail);
      
      return driveUrl;
    } catch (error) {
      throw new Error("فشل في رفع الصورة إلى Google Drive: " + error.message);
    }
  }

  deleteUser(userId, adminEmail) {
    // Soft delete: set Is_Deleted = true using softDelete method
    this.userRepo.softDelete(userId);
    this.logRepo.logAction("إدارة مستخدمين", `تم إيقاف/حذف المستخدم ID: ${userId}`, adminEmail);
    return true;
  }
}

const userService = new UserService(userRepo, logRepo);
