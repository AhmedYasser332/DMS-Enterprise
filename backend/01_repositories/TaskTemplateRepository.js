/**
 * Task Template Repository (Data Access Layer)
 * Handles CRUD operations for the Task_Templates table.
 */
class TaskTemplateRepository extends BaseRepository {
  constructor() {
    super(Config.TABLES.TASK_TEMPLATES, "Template_ID");
  }
}

// Instance ready for injection into the Service layer
const taskTemplateRepo = new TaskTemplateRepository();
