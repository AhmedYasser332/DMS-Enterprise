/**
 * RecordService (Business Logic Layer)
 * مسؤولة عن إدارة السجلات (الملفات)
 */
class RecordService {
  constructor(recordRepository, groupRepository, logRepository) {
    this.recordRepo = recordRepository;
    this.groupRepo = groupRepository;
    this.logRepo = logRepository;
  }

  getRecordsByGroup(groupId) {
    return this.recordRepo.findByGroupId(groupId);
  }

  addRecord(groupId, title, description, tags, userEmail) {
    if (!title || title.trim() === "") throw new Error("عنوان السجل مطلوب.");

    // Business Rule: حماية البيانات اليتيمة (التأكد من وجود المجموعة)
    const group = this.groupRepo.findById(groupId);
    if (!group || String(group.Is_Deleted).toUpperCase() === "TRUE") {
      throw new Error("عملية مرفوضة: لا يمكن إضافة سجل داخل مجموعة محذوفة أو غير موجودة.");
    }

    const newRecord = {
      "Record_ID": "REC_" + new Date().getTime(),
      "Sub_ID": groupId,
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

  deleteRecord(recordId, title, userEmail) {
    const success = this.recordRepo.softDelete(recordId);
    if (!success) throw new Error("تعذر إيجاد السجل لحذفه.");
    
    this.logRepo.logAction("حذف سجل", `نقل السجل "${title}" لسلة المهملات`, userEmail);
    return true;
  }
}

const recordService = new RecordService(recordRepo, groupRepo, logRepo);