/**
 * GroupService (Business Logic Layer)
 * مسؤولة عن إدارة مجموعات البيانات (الأقسام الفرعية)
 */
class GroupService {
  constructor(groupRepository, clientRepository, logRepository) {
    this.groupRepo = groupRepository;
    this.clientRepo = clientRepository; // حقن مستودع العملاء للتأكد من وجود العميل!
    this.logRepo = logRepository;
  }

  getGroupsByClient(clientId) {
    return this.groupRepo.findByClientId(clientId);
  }

  addGroup(clientId, groupName, userEmail) {
    if (!groupName || groupName.trim() === "") {
      throw new Error("اسم المجموعة لا يمكن أن يكون فارغاً.");
    }

    // Business Rule: هل العميل موجود أصلاً ونشط؟ (حماية من البيانات اليتيمة)
    const client = this.clientRepo.findById(clientId);
    if (!client || String(client.Is_Deleted).toUpperCase() === "TRUE") {
      throw new Error("عملية مرفوضة: لا يمكن إضافة مجموعة لعميل محذوف أو غير موجود بالأساس!");
    }

    const newGroup = {
      "Group_ID": "GP_" + new Date().getTime(),
      "Main_ID": clientId,
      "Name": groupName.trim(),
      "Created_By": userEmail || "Admin",
      "Created_At": new Date().toLocaleString('en-GB'),
      "Is_Deleted": false
    };

    const createdGroup = this.groupRepo.create(newGroup);
    this.logRepo.logAction("إضافة مجموعة", `إضافة مجموعة "${groupName}" للعميل: ${client.Name}`, userEmail);

    return createdGroup;
  }

  deleteGroup(groupId, groupName, userEmail) {
    const success = this.groupRepo.softDelete(groupId);
    if (!success) throw new Error("تعذر مسح المجموعة.");
    
    this.logRepo.logAction("حذف مجموعة", `نقل المجموعة "${groupName}" لسلة المهملات`, userEmail);
    return true;
  }
}

const groupService = new GroupService(groupRepo, clientRepo, logRepo);