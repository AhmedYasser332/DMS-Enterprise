/**
 * مستودع المرفقات (Attachment Repository)
 */
class AttachmentRepository extends BaseRepository {
  constructor() {
    super(Config.TABLES.ATTACHMENTS, "File_ID");
  }

  findByRecordId(recordId) {
    return this.findAll().filter(att => att.Record_ID === recordId);
  }
}

const attachmentRepo = new AttachmentRepository();