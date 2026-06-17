const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Mock Config from Config.js
const Config = {
  ROLES: { ADMIN: "Admin", USER: "User", VIEWER: "Viewer" },
  TASK_STATUS: { PENDING: "Pending", NEEDS_REVIEW: "Needs_Review", COMPLETED: "Completed" }
};

function loadScript(scriptName, context) {
  const filePath = path.join(__dirname, '..', '02_services', scriptName);
  const code = fs.readFileSync(filePath, 'utf-8');
  const wrappedCode = `
    ${code};
    if (typeof TaskService !== 'undefined') {
      TaskService;
    }
  `;
  // Provide dummy dependencies to prevent ReferenceError at the end of the script
  context.taskRepo = {};
  context.logRepo = {};
  context.userRepo = {};
  context.clientRepo = {};
  return vm.runInNewContext(wrappedCode, context);
}

describe('TaskService RBAC validation', () => {
  let TaskServiceClass;

  beforeAll(() => {
    const sandbox = { Config };
    TaskServiceClass = loadScript('TaskService.js', sandbox);
  });

  describe('getAllTasks', () => {
    it('test_admin_gets_all_tasks', () => {
      // Arrange
      const mockUserRepo = {
        findByUsername: jest.fn().mockReturnValue({ User_ID: 'U1', Role: Config.ROLES.ADMIN })
      };
      const mockTaskRepo = {
        findAll: jest.fn().mockReturnValue([{ Task_ID: 'T1' }, { Task_ID: 'T2' }]),
        findByAssignee: jest.fn()
      };
      const taskService = new TaskServiceClass(mockTaskRepo, {}, mockUserRepo, {});

      // Act
      const result = taskService.getAllTasks('admin@dms.com');

      // Assert
      expect(result).toHaveLength(2);
      expect(mockTaskRepo.findAll).toHaveBeenCalled();
      expect(mockTaskRepo.findByAssignee).not.toHaveBeenCalled();
    });

    it('test_non_admin_gets_only_assigned_tasks', () => {
      // Arrange
      const mockUserRepo = {
        findByUsername: jest.fn().mockReturnValue({ User_ID: 'U2', Role: Config.ROLES.USER })
      };
      const mockTaskRepo = {
        findAll: jest.fn(),
        findByAssignee: jest.fn().mockReturnValue([{ Task_ID: 'T1' }])
      };
      const taskService = new TaskServiceClass(mockTaskRepo, {}, mockUserRepo, {});

      // Act
      const result = taskService.getAllTasks('user@dms.com');

      // Assert
      expect(result).toHaveLength(1);
      expect(mockTaskRepo.findByAssignee).toHaveBeenCalledWith('U2');
      expect(mockTaskRepo.findAll).not.toHaveBeenCalled();
    });
  });

  describe('addTask', () => {
    it('test_non_admin_cannot_add_task', () => {
      const mockUserRepo = {
        findByUsername: jest.fn().mockReturnValue({ User_ID: 'U2', Role: Config.ROLES.USER })
      };
      const taskService = new TaskServiceClass({}, {}, mockUserRepo, {});

      expect(() => {
        taskService.addTask('Title', 'Desc', 'U3', 'C1', '2026-10-10', 3, 1, 'TPL1', 'user@dms.com');
      }).toThrow("هذه العملية متاحة فقط للمسؤولين: إنشاء مهمة");
    });
  });
});
