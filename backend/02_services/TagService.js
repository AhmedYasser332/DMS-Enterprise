class TagService {
  constructor(tagRepository, logRepository, userRepository) {
    this.tagRepo = tagRepository;
    this.logRepo = logRepository;
    this.userRepo = userRepository;
  }

  _checkPermission(userEmail, actionType) {
    if(!userEmail || userEmail === 'System') return; // Bypass for system calls
    const user = this.userRepo.findByUsername(userEmail);
    if(!user) throw new Error("مستخدم غير صالح لعملية إدارة الوسوم");
    if(user.Role === 'Admin') return; // Admins can do everything
    
    let perms = {};
    if(user.Permissions) {
      try { perms = typeof user.Permissions === 'string' ? JSON.parse(user.Permissions) : user.Permissions; } catch(e) {}
    }
    
    if(!perms.tags || !perms.tags[actionType]) {
      throw new Error(`ليس لديك صلاحية لـ ${actionType === 'add' ? 'إضافة' : (actionType === 'edit' ? 'تعديل' : 'حذف')} الوسوم (Tags)`);
    }
  }

  getAllTags() {
    return this.tagRepo.findAll();
  }

  addTag(name, color, userEmail) {
    this._checkPermission(userEmail, 'add');
    if (!name || name.trim() === "") throw new Error("اسم التاج مطلوب.");
    
    const allTags = this.tagRepo.findAll(true);
    const exists = allTags.find(t => t.Name.toLowerCase() === name.trim().toLowerCase() && String(t.Is_Deleted).toUpperCase() !== 'TRUE');
    if (exists) throw new Error("التاج موجود بالفعل.");

    const newTag = {
      "Tag_ID": "TAG_" + new Date().getTime(),
      "Name": name.trim(),
      "Color": color || "#0d6efd",
      "Created_By": userEmail || "Admin",
      "Is_Deleted": false
    };

    const createdTag = this.tagRepo.create(newTag);
    this.logRepo.logAction("إدارة التاجز", `تم إضافة التاج "${name}"`, userEmail);
    return createdTag;
  }

  updateTag(tagId, name, color, userEmail) {
    this._checkPermission(userEmail, 'edit');
    if (!name || name.trim() === "") throw new Error("اسم التاج مطلوب.");
    
    this.tagRepo.update(tagId, { "Name": name.trim(), "Color": color });
    this.logRepo.logAction("إدارة التاجز", `تم تعديل التاج "${name}"`, userEmail);
    return true;
  }

  deleteTag(tagId, name, userEmail) {
    this._checkPermission(userEmail, 'delete');
    const success = this.tagRepo.softDelete(tagId);
    if (!success) throw new Error("تعذر مسح التاج.");
    
    this.logRepo.logAction("حذف تاج", `تم نقل التاج "${name}" لسلة المهملات`, userEmail);
    return true;
  }
}

// Ensure userRepo is passed here since it's global in Code.js or initialized before
// Assuming userRepo is globally available like tagRepo and logRepo
const tagService = new TagService(tagRepo, logRepo, userRepo);
