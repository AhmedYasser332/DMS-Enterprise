class LegalEntityService {
  constructor(legalEntityRepository, logRepository, userRepository) {
    this.entityRepo = legalEntityRepository;
    this.logRepo = logRepository;
    this.userRepo = userRepository;
  }

  _checkPermission(userEmail, actionType) {
    if(!userEmail || userEmail === 'System') return; // Bypass for system calls
    const user = this.userRepo.findByUsername(userEmail);
    if(!user) throw new Error("مستخدم غير صالح لعملية إدارة الكيانات");
    if(user.Role === 'Admin') return; // Admins can do everything
    
    let perms = {};
    if(user.Permissions) {
      try { 
        perms = typeof user.Permissions === 'string' ? JSON.parse(user.Permissions) : user.Permissions; 
      } catch(e) {
        Logger.log("فشل في تحليل صلاحيات المستخدم: " + e.message);
      }
    }
    
    if(!perms.legalEntities || !perms.legalEntities[actionType]) {
      throw new Error(`ليس لديك صلاحية لـ ${actionType === 'add' ? 'إضافة' : (actionType === 'edit' ? 'تعديل' : 'حذف')} الكيانات القانونية`);
    }
  }

  getAllEntities() {
    return this.entityRepo.findAll();
  }

  addEntity(name, color, userEmail) {
    this._checkPermission(userEmail, 'add');
    if (!name || name.trim() === "") throw new Error("اسم الكيان مطلوب.");
    
    const allEntities = this.entityRepo.findAll(true);
    const exists = allEntities.find(e => e.Name.toLowerCase() === name.trim().toLowerCase() && String(e.Is_Deleted).toUpperCase() !== 'TRUE');
    if (exists) throw new Error("الكيان القانوني موجود بالفعل.");

    const newEntity = {
      "Entity_ID": "LE_" + new Date().getTime(),
      "Name": name.trim(),
      "Color": color || "#198754",
      "Created_By": userEmail || "Admin",
      "Is_Deleted": false
    };

    const createdEntity = this.entityRepo.create(newEntity);
    this.logRepo.logAction("إدارة الكيانات", `تم إضافة الكيان القانوني "${name}"`, userEmail);
    return createdEntity;
  }

  updateEntity(entityId, name, color, userEmail) {
    this._checkPermission(userEmail, 'edit');
    if (!name || name.trim() === "") throw new Error("اسم الكيان مطلوب.");
    
    this.entityRepo.update(entityId, { "Name": name.trim(), "Color": color });
    this.logRepo.logAction("إدارة الكيانات", `تم تعديل الكيان القانوني "${name}"`, userEmail);
    return true;
  }

  deleteEntity(entityId, name, userEmail) {
    this._checkPermission(userEmail, 'delete');
    const success = this.entityRepo.softDelete(entityId);
    if (!success) throw new Error("تعذر مسح الكيان القانوني.");
    
    this.logRepo.logAction("حذف كيان قانوني", `تم مسح الكيان القانوني "${name}"`, userEmail);
    return true;
  }
}

// Ensure repositories exist. We will assume legalEntityRepo will be defined in Code.js like others
const legalEntityService = new LegalEntityService(legalEntityRepo, logRepo, userRepo);
