/**
 * ClientService (Business Logic Layer)
 * مسؤولة عن عمليات العملاء وقواعد العمل الخاصة بهم
 */
class ClientService {
  constructor(clientRepository, logRepository) {
    this.clientRepo = clientRepository;
    this.logRepo = logRepository;
  }

  getAllClients() {
    return this.clientRepo.findAll();
  }

  addClient(name, taxId, legalEntity, userEmail) {
    // 1. Business Rule: Validation الأساسي
    if (!name || name.trim() === "") {
      throw new Error("اسم العميل حقل إجباري لا يمكن تركه فارغاً.");
    }

    // 2. Business Rule: Validation الرقم الضريبي (من ملف الـ notes.txt الخاص بك 🚀)
    // الشرط: 999-999-999 وميقبلش غير كدا
    if (taxId && taxId.trim() !== "") {
      const taxIdRegex = /^\d{3}-\d{3}-\d{3}$/;
      if (!taxIdRegex.test(taxId)) {
        throw new Error("صيغة رقم التسجيل الضريبي غير صحيحة. يجب أن تكون على شكل 999-999-999");
      }
      
      // التأكد من عدم تكرار الرقم الضريبي (قاعدة عمل قوية)
      const existingClient = this.clientRepo.findByTaxId(taxId);
      if (existingClient) {
        throw new Error("رقم التسجيل الضريبي مسجل بالفعل لعميل آخر!");
      }
    }

    // إنشاء الكائن (Entity)
    const newClient = {
      "Main_ID": "CL_" + new Date().getTime(),
      "Name": name.trim(),
      "Tax_ID": taxId || "-",
      "Legal_Entity": legalEntity || "-",
      "Created_By": userEmail || "Admin",
      "Created_At": new Date().toLocaleString('en-GB'),
      "Is_Deleted": false
    };

    // الحفظ في قاعدة البيانات عبر المستودع
    const createdClient = this.clientRepo.create(newClient);
    
    // تسجيل النشاط
    this.logRepo.logAction("إضافة عميل", `تم إضافة العميل الجديد: ${name}`, userEmail);

    return createdClient;
  }

  deleteClient(clientId, clientName, userEmail) {
    // Business Rule: Soft Delete
    const success = this.clientRepo.softDelete(clientId);
    
    if (!success) {
      throw new Error("تعذر مسح العميل، قد يكون غير موجود أو محذوف مسبقاً.");
    }

    this.logRepo.logAction("حذف عميل", `تم نقل العميل "${clientName}" لسلة المهملات`, userEmail);
    return true;
  }
}

const clientService = new ClientService(clientRepo, logRepo);