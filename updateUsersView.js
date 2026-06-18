const fs = require('fs');
const path = 'frontend/views/UsersView.html';
let content = fs.readFileSync(path, 'utf8');

// 1. Extract the permissions block from editUserModal
const editStart = content.indexOf('<!-- Permissions Block Edit -->');
const editEnd = content.indexOf('<button type="submit"', editStart);
let editBlock = content.substring(editStart, editEnd);

// 2. Add Select All buttons to the extracted block
editBlock = editBlock.replace(/<h6 class="fw-bold mb-3 border-bottom pb-2" style="color: var\(--text-main\);">([^<]+)<\/h6>/g, `
<div class="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
  <h6 class="fw-bold m-0" style="color: var(--text-main);">$1</h6>
  <button type="button" class="btn btn-sm btn-outline-secondary py-0" style="font-size: 0.7rem;" onclick="UserController.toggleCardPerms(this)">تحديد الكل</button>
</div>
`.trim());

// Update the original editUserModal in content
content = content.substring(0, editStart) + editBlock + content.substring(editEnd);

// 3. Create the addBlock by replacing eu-perm with nu-perm
let addBlock = editBlock.replace(/eu-perm/g, 'nu-perm');
addBlock = addBlock.replace('<!-- Permissions Block Edit -->', '<!-- Permissions Block Add -->');

// 4. Replace the old Add User Modal permissions
// The old block starts with <h6 class="fw-bold">إدارة العملاء والمجموعات</h6> and ends at <button type="submit" ... "حفظ المستخدم"
// Wait, the structure was:
// <div class="row">
//   <div class="col-md-4 mb-3">
//     <h6 class="fw-bold">إدارة العملاء والمجموعات</h6>
// ...
const oldAddStart = content.indexOf('<div class="row">', content.indexOf('<form id="addUserForm"'));
const oldAddEnd = content.indexOf('<button type="submit"', oldAddStart);
// Let's replace the surrounding div as well
const oldAddBlockStart = content.lastIndexOf('<div class="mb-3">', oldAddStart); // where the label is
content = content.substring(0, oldAddBlockStart) + addBlock + content.substring(oldAddEnd);

// 5. Add UserController.toggleCardPerms and UserController.toggleActive
const jsMethods = `
  static toggleCardPerms(btn) {
    const card = btn.closest('.card');
    const checkboxes = card.querySelectorAll('input[type="checkbox"]');
    const allChecked = Array.from(checkboxes).every(cb => cb.checked);
    checkboxes.forEach(cb => cb.checked = !allChecked);
  }

  static async toggleActive(userId, currentStatus) {
    const newStatus = !(String(currentStatus).toUpperCase() === 'TRUE');
    UIManager.showLoader(newStatus ? "جاري التفعيل..." : "جاري الإيقاف...");
    try {
      const adminEmail = GlobalStore.getState().currentUser.username;
      const success = await ApiClient.call('api_updateUser', userId, { Is_Active: newStatus }, adminEmail);
      if (success) {
        let updatedUsers = GlobalStore.getState().users.map(u => {
           if (u.User_ID == userId) return { ...u, Is_Active: newStatus };
           return u;
        });
        GlobalStore.setState({ users: updatedUsers });
        this.renderTable();
        UIManager.showSuccess(newStatus ? "تم تفعيل الحساب" : "تم إيقاف الحساب");
      }
    } catch (e) {
      UIManager.showError(e.message);
    }
  }
`;

content = content.replace('static renderTable() {', jsMethods + '\n  static renderTable() {');

// 6. Update renderTable HTML for toggleActive button
content = content.replace(
  /<button class="btn btn-sm btn-outline-danger mx-1" onclick="UserController\.confirmDelete\('\${u\.User_ID}'\)" title="إيقاف \/ حذف"><i class="fas fa-trash-alt"><\/i><\/button>/,
  `<button class="btn btn-sm btn-outline-\${String(u.Is_Active).toUpperCase() === 'TRUE' ? 'warning' : 'success'} mx-1" onclick="UserController.toggleActive('\${u.User_ID}', \${u.Is_Active})" title="\${String(u.Is_Active).toUpperCase() === 'TRUE' ? 'إيقاف' : 'تفعيل'}"><i class="fas \${String(u.Is_Active).toUpperCase() === 'TRUE' ? 'fa-ban' : 'fa-check'}"></i></button>
          <button class="btn btn-sm btn-outline-danger mx-1" onclick="UserController.confirmDelete('\${u.User_ID}')" title="حذف للمهملات"><i class="fas fa-trash-alt"></i></button>`
);

fs.writeFileSync(path, content, 'utf8');
console.log('Successfully updated UsersView.html');
