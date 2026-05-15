/**
 * GroupService (Business Logic Layer)
 * مسؤولة عن إدارة مجموعات البيانات (الأقسام الفرعية)
 */
class GroupService {
  constructor(groupRepository, clientRepository, logRepository, userRepository) {
    this.groupRepo = groupRepository;
    this.clientRepo = clientRepository; // حقن مستودع العملاء للتأكد من وجود العميل!
    this.logRepo = logRepository;
    this.userRepo = userRepository;
  }

  _checkPermission(userEmail, action) {
    if(!userEmail || userEmail === 'System') return; 
    const user = this.userRepo.findByUsername(userEmail);
    if(!user) throw new Error("مستخدم غير صالح لعملية " + action);
    if(user.Role === 'Admin') return; 
    if(user.Role === 'Viewer') throw new Error("صلاحيات القراءة فقط. لا يمكنك " + action);
  }

  getGroupsByClient(clientId) {
    return this.groupRepo.findByClientId(clientId);
  }

  getAllGroups() {
    return this.groupRepo.findAll();
  }

  addGroup(clientId, groupName, userEmail) {
    this._checkPermission(userEmail, 'إضافة مجموعة');
    if (!groupName || groupName.trim() === "") {
      throw new Error("اسم المجموعة لا يمكن أن يكون فارغاً.");
    }

    // Business Rule: هل العميل موجود أصلاً ونشط؟ (حماية من البيانات اليتيمة)
    const client = this.clientRepo.findById(clientId);
    if (!client || String(client.Is_Deleted).toUpperCase() === "TRUE") {
      throw new Error("عملية مرفوضة: لا يمكن إضافة مجموعة لعميل محذوف أو غير موجود بالأساس!");
    }

    const newGroup = {
      "Group_ID": "GRP_" + new Date().getTime(),
      "Client_ID": clientId,
      "Name": groupName.trim(),
      "Created_By": userEmail || "Admin",
      "Created_At": new Date().toLocaleString('en-GB'),
      "Is_Deleted": false
    };

    const createdGroup = this.groupRepo.create(newGroup);
    this.logRepo.logAction("إضافة مجموعة", `إضافة مجموعة "${groupName}" للعميل: ${client.Name}`, userEmail);

    return createdGroup;
  }

  updateGroup(groupId, updateData, userEmail) {
    this._checkPermission(userEmail, 'تعديل مجموعة');
    if (updateData.Name && updateData.Name.trim() === "") throw new Error("اسم المجموعة لا يمكن أن يكون فارغاً.");
    
    this.groupRepo.update(groupId, updateData);
    this.logRepo.logAction("تعديل مجموعة", `تم تعديل بيانات المجموعة ID: ${groupId}`, userEmail);
    return true;
  }

  deleteGroup(groupId, groupName, userEmail) {
    this._checkPermission(userEmail, 'حذف مجموعة');
    const success = this.groupRepo.softDelete(groupId);
    if (!success) throw new Error("تعذر مسح المجموعة.");
    
    this.logRepo.logAction("حذف مجموعة", `نقل المجموعة "${groupName}" لسلة المهملات`, userEmail);
    return true;
  }
}

const groupService = new GroupService(groupRepo, clientRepo, logRepo, userRepo);