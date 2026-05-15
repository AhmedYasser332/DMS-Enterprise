/**
 * RecordService (Business Logic Layer)
 * مسؤولة عن إدارة السجلات (الملفات)
 */
class RecordService {
  constructor(recordRepository, groupRepository, logRepository, userRepository) {
    this.recordRepo = recordRepository;
    this.groupRepo = groupRepository;
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

  getAllRecords() {
    return this.recordRepo.findAll();
  }

  getRecordsByGroup(groupId) {
    return this.recordRepo.findByGroupId(groupId);
  }

  addRecord(groupId, title, description, tags, userEmail) {
    this._checkPermission(userEmail, 'إضافة سجل');
    if (!title || title.trim() === "") throw new Error("عنوان السجل مطلوب.");

    // Business Rule: حماية البيانات اليتيمة (التأكد من وجود المجموعة)
    const group = this.groupRepo.findById(groupId);
    if (!group || String(group.Is_Deleted).toUpperCase() === "TRUE") {
      throw new Error("عملية مرفوضة: لا يمكن إضافة سجل داخل مجموعة محذوفة أو غير موجودة.");
    }

    const newRecord = {
      "Record_ID": "REC_" + new Date().getTime(),
      "Group_ID": groupId,
      "Title": title.trim(),
      "Description": description ? description.trim() : "",
      "Tags": tags ? tags.trim() : "",
      "Created_By": userEmail || "Admin",
      "Created_At": new Date().toLocaleString('en-GB'),
      "Is_Deleted": false
    };

    const createdRecord = this.recordRepo.create(newRecord);
    this.logRepo.logAction("إضافة سجل", `تم إضافة السجل "${title}"`, userEmail);

    return createdRecord;
  }

  updateRecord(recordId, updateData, userEmail) {
    this._checkPermission(userEmail, 'تعديل سجل');
    if (updateData.Title && updateData.Title.trim() === "") throw new Error("عنوان السجل لا يمكن أن يكون فارغاً.");
    
    this.recordRepo.update(recordId, updateData);
    this.logRepo.logAction("تعديل سجل", `تم تعديل بيانات السجل ID: ${recordId}`, userEmail);
    return true;
  }

  deleteRecord(recordId, title, userEmail) {
    this._checkPermission(userEmail, 'حذف سجل');
    const success = this.recordRepo.softDelete(recordId);
    if (!success) throw new Error("تعذر إيجاد السجل لحذفه.");
    
    this.logRepo.logAction("حذف سجل", `نقل السجل "${title}" لسلة المهملات`, userEmail);
    return true;
  }
}

const recordService = new RecordService(recordRepo, groupRepo, logRepo, userRepo);
