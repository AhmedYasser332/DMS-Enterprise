class TrashService {
  constructor(clientRepo, groupRepo, recordRepo, logRepo) {
    this.repos = [clientRepo, groupRepo, recordRepo]; // بنراقب الجداول دي
    this.logRepo = logRepo;
  }

  // جلب كل العناصر اللي فيها Is_Deleted = true
  getDeletedItems() {
    let allDeleted = [];
    
    // جلب العملاء المحذوفين
    this.repos[0].findAll(false).filter(c => String(c.Is_Deleted).toUpperCase() === "TRUE")
      .forEach(c => allDeleted.push({...c, type: 'عميل', display: c.Name, id: c.Main_ID}));
      
    // جلب المجموعات المحذوفة
    this.repos[1].findAll(false).filter(g => String(g.Is_Deleted).toUpperCase() === "TRUE")
      .forEach(g => allDeleted.push({...g, type: 'مجموعة', display: g.Name, id: g.Group_ID}));

    // جلب السجلات المحذوفة
    this.repos[2].findAll(false).filter(r => String(r.Is_Deleted).toUpperCase() === "TRUE")
      .forEach(r => allDeleted.push({...r, type: 'سجل', display: r.Title, id: r.Record_ID}));

    return allDeleted;
  }

  restoreItem(type, id, name, userEmail) {
    let repo = type === 'عميل' ? this.repos[0] : (type === 'مجموعة' ? this.repos[1] : this.repos[2]);
    repo.restore(id);
    this.logRepo.logAction("استعادة", `تم استعادة ${type}: ${name}`, userEmail);
    return true;
  }

  permanentDelete(type, id, name, userEmail) {
    let repo = type === 'عميل' ? this.repos[0] : (type === 'مجموعة' ? this.repos[1] : this.repos[2]);
    repo.hardDelete(id);
    this.logRepo.logAction("حذف نهائي", `تم حذف ${type} نهائياً: ${name}`, userEmail);
    return true;
  }
}

const trashService = new TrashService(clientRepo, groupRepo, recordRepo, logRepo);