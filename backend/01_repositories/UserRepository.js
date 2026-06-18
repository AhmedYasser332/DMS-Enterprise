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

  /**
   * Override _mapRowToObject to safely parse Permissions JSON
   */
  _mapRowToObject(row, headers) {
    let obj = super._mapRowToObject(row, headers);
    
    // Default empty permissions if none exist
    let defaultPermissions = {
      dashboard: { view: false, viewKPIs: false },
      clients: { add: false, edit: false, delete: false },
      records: { add: false, edit: false, delete: false },
      attachments: { upload: false, download: false, print: false, delete: false },
      recycleBin: { view: false, restoreOwn: false, restoreAll: false, empty: false },
      admin: { manageUsers: false, manageTemplates: false, viewLogs: false },
      tags: { add: false, edit: false, delete: false },
      legalEntities: { add: false, edit: false, delete: false },
      tasks: { manageTasks: false, myTasks: false },
      credentials: { view: false, add: false, edit: false, delete: false }
    };

    if (obj.Permissions) {
      try {
        obj.Permissions = JSON.parse(obj.Permissions);
      } catch (e) {
        // Fallback in case of invalid JSON
        obj.Permissions = defaultPermissions;
      }
    } else {
      obj.Permissions = defaultPermissions;
    }
    
    return obj;
  }

  /**
   * Override create to stringify Permissions before saving
   */
  create(entityObject) {
    if (entityObject.Permissions && typeof entityObject.Permissions === 'object') {
      entityObject.Permissions = JSON.stringify(entityObject.Permissions);
    }
    return super.create(entityObject);
  }

  /**
   * Override update to stringify Permissions before saving
   */
  update(id, updatedFields) {
    if (updatedFields.Permissions && typeof updatedFields.Permissions === 'object') {
      updatedFields.Permissions = JSON.stringify(updatedFields.Permissions);
    }
    return super.update(id, updatedFields);
  }
}

const userRepo = new UserRepository();
