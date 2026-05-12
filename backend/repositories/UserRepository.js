/**
 * مستودع المستخدمين
 */
class UserRepository extends BaseRepository {
  constructor() {
    super(Config.TABLES.USERS, "User_ID");
  }

  /**
   * استعلام مخصص: البحث عن مستخدم باسم الدخول (Username)
   */
  findByUsername(username) {
    return this.findAll().find(user => user.Username === username) || null;
  }

  /**
   * استعلام مخصص: جلب المستخدمين النشطين فقط
   */
  findActiveUsers() {
    return this.findAll().filter(user => String(user.Is_Active).toUpperCase() === "TRUE");
  }
}

const userRepo = new UserRepository();