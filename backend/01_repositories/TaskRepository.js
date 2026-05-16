/**
 * Task Repository (Data Access Layer)
 * Handles CRUD operations for the Tasks table.
 * Includes a custom query method to filter tasks by assignee.
 */
class TaskRepository extends BaseRepository {
  constructor() {
    super(Config.TABLES.TASKS, "Task_ID");
  }

  /**
   * Custom Query: Find all active tasks assigned to a specific user.
   * @param {string} userId - The User_ID of the assignee
   * @returns {Object[]} Array of task objects assigned to this user
   */
  findByAssignee(userId) {
    return this.findAll().filter(task => task.Assigned_To === userId);
  }
}

// Instance ready for injection into the Service layer
const taskRepo = new TaskRepository();
