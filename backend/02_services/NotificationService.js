class NotificationService {
  constructor(notificationRepository) {
    this.repo = notificationRepository;
  }

  notify(payload) {
    try {
      const notification = {
        "Notification_ID": "NOTIF_" + Utilities.getUuid(),
        "Recipient_Email": payload.Recipient_Email,
        "Type": payload.Type || "SYSTEM",
        "Title": payload.Title,
        "Message": payload.Message,
        "Link": payload.Link || "",
        "Is_Read": payload.Is_Read !== undefined ? payload.Is_Read : false,
        "Created_At": new Date().toISOString(),
        "Read_At": payload.Is_Read ? new Date().toISOString() : ""
      };

      const lock = LockService.getScriptLock();
      lock.waitLock(10000);
      try {
        this.repo.create(notification);
      } finally {
        lock.releaseLock();
      }

      // Invalidate cached count
      CacheService.getUserCache().remove('unread_' + payload.Recipient_Email);
    } catch (e) {
      Logger.log('Notification failed (non-blocking): ' + e.message);
    }
  }

  getUnreadCount(email) {
    const cache = CacheService.getUserCache();
    const cached = cache.get('unread_' + email);
    if (cached !== null) return Number(cached);

    const count = this.repo.countUnread(email);
    cache.put('unread_' + email, String(count), 60); // 60s TTL
    return count;
  }

  getUserNotifications(email) {
    // Sort descending by Created_At
    const notifs = this.repo.findByRecipient(email);
    return notifs.sort((a, b) => new Date(b.Created_At) - new Date(a.Created_At));
  }

  markAsRead(notificationIds, email) {
    const success = this.repo.markRead(notificationIds);
    if (success) {
      CacheService.getUserCache().remove('unread_' + email);
    }
    return success;
  }
}

const notificationService = new NotificationService(notificationRepo);
