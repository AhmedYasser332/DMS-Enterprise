class TrashService {
  constructor(clientRepo, groupRepo, recordRepo, logRepo, userRepository) {
    this.repos = [clientRepo, groupRepo, recordRepo]; // بنراقب الجداول دي
    this.logRepo = logRepo;
    this.userRepo = userRepository;
  }

  _checkPermission(userEmail, action) {
    if(!userEmail || userEmail === 'System') return; 
    const user = this.userRepo.findByUsername(userEmail);
    if(!user) throw new Error("مستخدم غير صالح لعملية " + action);
    if(user.Role === 'Admin') return; 
    
    // Check specific permissions if needed
    let perms = {};
    if(user.Permissions) {
      try { 
        perms = typeof user.Permissions === 'string' ? JSON.parse(user.Permissions) : user.Permissions; 
      } catch(e) {
        Logger.log("فشل في تحليل صلاحيات المستخدم: " + e.message);
      }
    }
    if(action === 'استعادة' && !perms.recycleBin?.restoreOwn && !perms.recycleBin?.restoreAll) throw new Error("صلاحيات غير كافية لـ " + action);
    if(action === 'حذف نهائي' && !perms.recycleBin?.empty) throw new Error("صلاحيات غير كافية لـ " + action);
    if(action === 'عرض' && !perms.recycleBin?.view) throw new Error("صلاحيات غير كافية لـ " + action);
  }

  // جلب كل العناصر اللي فيها Is_Deleted = true
  getDeletedItems() {
    let allDeleted = [];
    
    // جلب العملاء المحذوفين
    this.repos[0].findAll(false).filter(c => String(c.Is_Deleted).toUpperCase() === "TRUE")
      .forEach(c => allDeleted.push({...c, type: 'عميل', display: c.Name, id: c.Client_ID}));
      
    // جلب المجموعات المحذوفة
    this.repos[1].findAll(false).filter(g => String(g.Is_Deleted).toUpperCase() === "TRUE")
      .forEach(g => allDeleted.push({...g, type: 'مجموعة', display: g.Name, id: g.Group_ID}));

    // جلب السجلات المحذوفة
    this.repos[2].findAll(false).filter(r => String(r.Is_Deleted).toUpperCase() === "TRUE")
      .forEach(r => allDeleted.push({...r, type: 'سجل', display: r.Title, id: r.Record_ID}));

    // جلب المستخدمين المحذوفين
    this.userRepo.findAll(false).filter(u => String(u.Is_Deleted).toUpperCase() === "TRUE")
      .forEach(u => allDeleted.push({...u, type: 'مستخدم', display: u.Name, id: u.User_ID}));

    return allDeleted;
  }

  restoreItem(type, id, name, userEmail) {
    this._checkPermission(userEmail, 'استعادة');
    let repo;
    if (type === 'عميل') repo = this.repos[0];
    else if (type === 'مجموعة') repo = this.repos[1];
    else if (type === 'سجل') repo = this.repos[2];
    else if (type === 'مستخدم') repo = this.userRepo;
    
    if (repo) repo.restore(id);
    this.logRepo.logAction("استعادة", `تم استعادة ${type}: ${name}`, userEmail);
    return true;
  }

  permanentDelete(type, id, name, userEmail) {
    this._checkPermission(userEmail, 'حذف نهائي');
    let repo;
    if (type === 'عميل') repo = this.repos[0];
    else if (type === 'مجموعة') repo = this.repos[1];
    else if (type === 'سجل') repo = this.repos[2];
    else if (type === 'مستخدم') repo = this.userRepo;
    
    if (repo) repo.hardDelete(id);
    this.logRepo.logAction("حذف نهائي", `تم حذف ${type} نهائياً: ${name}`, userEmail);
    return true;
  }
}

const trashService = new TrashService(clientRepo, groupRepo, recordRepo, logRepo, userRepo);
