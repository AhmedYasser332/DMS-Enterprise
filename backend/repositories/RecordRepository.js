/**
 * مستودع السجلات
 */
class RecordRepository extends BaseRepository {
  constructor() {
    super(Config.TABLES.RECORDS, "Record_ID");
  }

  /**
   * استعلام مخصص: جلب السجلات التابعة لمجموعة بيانات معينة
   */
  findByGroupId(groupId) {
    return this.findAll().filter(record => record.Sub_ID === groupId);
  }
}

const recordRepo = new RecordRepository();