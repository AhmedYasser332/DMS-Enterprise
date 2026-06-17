const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Load the AuthService code into the current context
function loadScript(scriptName, context) {
  const filePath = path.join(__dirname, '..', '02_services', scriptName);
  const code = fs.readFileSync(filePath, 'utf-8');
  // We wrap the code so we can extract the class without throwing errors on global instantiations
  const wrappedCode = `
    ${code};
    if (typeof AuthService !== 'undefined') {
      AuthService;
    }
  `;
  // Provide a dummy userRepo to avoid the "userRepo is not defined" error at the end of the file
  context.userRepo = {}; 
  return vm.runInNewContext(wrappedCode, context);
}

describe('AuthService', () => {
  let AuthServiceClass;

  beforeAll(() => {
    const sandbox = {
      userRepo: {}
    };
    AuthServiceClass = loadScript('AuthService.js', sandbox);
  });

  it('test_valid_credentials_returns_user_details', () => {
    // Arrange
    const mockUserRepo = {
      findByUsername: jest.fn().mockReturnValue({
        User_ID: 'U1',
        Name: 'Admin User',
        Username: 'admin',
        Password: 'correct_password',
        Role: 'Admin',
        Is_Deleted: 'FALSE',
        Allowed_Clients: 'All',
        Permissions: 'Write'
      })
    };
    const authService = new AuthServiceClass(mockUserRepo);

    // Act
    const result = authService.login('admin', 'correct_password');

    // Assert
    expect(result).toEqual({
      userId: 'U1',
      name: 'Admin User',
      username: 'admin',
      role: 'Admin',
      allowedClients: 'All',
      permissions: 'Write'
    });
  });

  it('test_invalid_username_throws_error', () => {
    const mockUserRepo = {
      findByUsername: jest.fn().mockReturnValue(null)
    };
    const authService = new AuthServiceClass(mockUserRepo);

    expect(() => authService.login('unknown', 'any_pass')).toThrow("اسم المستخدم غير موجود!");
  });

  it('test_incorrect_password_throws_error', () => {
    const mockUserRepo = {
      findByUsername: jest.fn().mockReturnValue({
        Username: 'admin',
        Password: 'correct_password'
      })
    };
    const authService = new AuthServiceClass(mockUserRepo);

    expect(() => authService.login('admin', 'wrong_pass')).toThrow("كلمة المرور خاطئة، حاول مرة أخرى!");
  });

  it('test_deleted_account_throws_error', () => {
    const mockUserRepo = {
      findByUsername: jest.fn().mockReturnValue({
        Username: 'admin',
        Password: 'correct_password',
        Is_Deleted: 'TRUE'
      })
    };
    const authService = new AuthServiceClass(mockUserRepo);

    expect(() => authService.login('admin', 'correct_password')).toThrow("تم إيقاف هذا الحساب، يرجى مراجعة مدير النظام.");
  });
});
