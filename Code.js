// نقطة الدخول الأساسية لأي تطبيق ويب في Apps Script
// الدالة دي هي اللي بتشتغل أول ما المستخدم يفتح رابط الموقع
function doGet(e) {
  // بنستدعي ملف Index.html وبنجهزه للعرض
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('نظام الأرشيف الرقمي - DMS')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1') // عشان يكون متجاوب مع الموبايل
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// دالة مساعدة مهمة جداً (هتنفعنا قدام)
// بتسمح لنا نفصل أكواد الجافاسكريبت والـ CSS في ملفات منفصلة ونستدعيها جوه Index
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function getInitialAppData(userRole) {
  try {
    const allClients = getSheetData(CONFIG.SHEETS.CLIENTS, false);
    const allGroups = getSheetData(CONFIG.SHEETS.GROUPS, false);
    const allRecords = getSheetData(CONFIG.SHEETS.RECORDS, false);
    const allAttachments = getSheetData(CONFIG.SHEETS.ATTACHMENTS, false);

    let allUsers = [];
    // أمان: هنجيب المستخدمين لو اللي بيطلب الداتا ده مدير فقط
    if (userRole === 'Admin') {
      const usersData = getSheetData("Users", false);
      allUsers = usersData.map(u => ({
          id: u.User_ID,
          name: u.Name,
          username: u.Username,
          role: u.Role,
          allowedClients: u.Allowed_Clients,
          isActive: String(u.Is_Active).toUpperCase() === "TRUE",
          isDeleted: String(u.Is_Deleted).toUpperCase() === "TRUE",
          createdAt: u.Created_At
      }));
    }

    return {
      status: "success",
      db: {
        clients: allClients,
        groups: allGroups,
        records: allRecords,
        attachments: allAttachments,
        users: allUsers // ضفنا المستخدمين هنا
      }
    };
  } catch (error) {
    return { status: "error", message: error.toString() };
  }
}