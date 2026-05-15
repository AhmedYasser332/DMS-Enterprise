/**
 * مستودع العملاء
 * يتعامل مع جدول العملاء ويحتوي على الاستعلامات المخصصة لهم
 */
class ClientRepository extends BaseRepository {
  constructor() {
    super(Config.TABLES.CLIENTS, "Client_ID");
  }

  /**
   * استعلام مخصص: البحث عن عميل برقم التسجيل الضريبي
   * @param {string} taxId 
   */
  findByTaxId(taxId) {
    return this.findAll().find(client => client.Tax_ID === taxId) || null;
  }
}

// إنشاء نسخة (Instance) جاهزة للحقن في طبقة الخدمات (Services)
const clientRepo = new ClientRepository();
