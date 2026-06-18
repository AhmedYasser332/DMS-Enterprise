class NotificationRepository extends BaseRepository {
  constructor() {
    super(Config.TABLES.NOTIFICATIONS, "Notification_ID");
  }

  findByRecipient(email) {
    const all = this.findAll(false); // Notifications don't use Is_Deleted
    return all.filter(n => n.Recipient_Email === email);
  }

  countUnread(email) {
    const all = this.findByRecipient(email);
    return all.filter(n => String(n.Is_Read).toUpperCase() !== "TRUE").length;
  }

  markRead(notificationIds) {
    let hasChanges = false;
    const sheet = this._getSheet();
    const sheetRows = sheet.getDataRange().getValues();
    const headers = sheetRows[0].map(h => String(h).trim());
    const idColIdx = headers.indexOf(this.idColumn);
    const readColIdx = headers.indexOf("Is_Read");
    const readAtColIdx = headers.indexOf("Read_At");

    if (idColIdx === -1 || readColIdx === -1) return false;

    const readAt = new Date().toISOString();

    for (let i = 1; i < sheetRows.length; i++) {
      const id = sheetRows[i][idColIdx];
      if (notificationIds.includes(id) && String(sheetRows[i][readColIdx]).toUpperCase() !== "TRUE") {
        sheetRows[i][readColIdx] = true;
        if(readAtColIdx !== -1) {
          sheetRows[i][readAtColIdx] = readAt;
        }
        sheet.getRange(i + 1, 1, 1, headers.length).setValues([sheetRows[i]]);
        hasChanges = true;
      }
    }

    if (hasChanges) {
      this.db.commit();
      CacheManager.bustCache();
    }
    
    return true;
  }
}

const notificationRepo = new NotificationRepository();
