/**
 * مستودع مجموعات البيانات (الأقسام الفرعية)
 */
class GroupRepository extends BaseRepository {
  constructor() {
    super(Config.TABLES.GROUPS, "Group_ID");
  }

  /**
   * استعلام مخصص: جلب كل المجموعات التابعة لعميل معين
   */
  findByClientId(clientId) {
    return this.findAll().filter(group => group.Main_ID === clientId);
  }
}

const groupRepo = new GroupRepository();