const { test, expect } = require('@playwright/test');

const APP_URL = 'https://script.google.com/macros/s/AKfycby3wGLTyJVptTSE-YlseVERqKFH1Mjt6zI9OapNko2DAM_VE-Ad0uGvZDvv7McW8eC_/exec';

test.describe('DMS Supreme E2E Workflows', () => {
  
  test('test_admin_login_displays_dashboard_successfully', async ({ page }) => {
    // 1. Navigate to the deployed web app
    await page.goto(APP_URL);
    
    // GAS serves the actual app inside a nested iframe structure
    // Wait for the main iframe to be attached
    const mainFrame = await page.waitForSelector('iframe', { state: 'attached' });
    const frame = await mainFrame.contentFrame();
    
    // GAS might have a second nested iframe depending on domain restrictions
    // Let's use a dynamic locator strategy to find the inputs
    
    // Fill credentials
    // Note: We use page.frameLocator() to pierce through the iframes
    const appFrame = page.frameLocator('iframe[title="نظام الأرشيف الإلكتروني (Enterprise)"]').frameLocator('iframe[title="نظام الأرشيف الإلكتروني (Enterprise)"]');
    
    // We try the nested approach first, if it fails, fallback to single iframe
    const locatorFrame = page.frames().length > 1 ? appFrame : page.frameLocator('iframe');
    
    await locatorFrame.getByRole('textbox', { name: 'Username' }).fill('admin');
    await locatorFrame.getByRole('textbox', { name: '••••••••' }).fill('admin');
    
    // Submit login
    await locatorFrame.getByRole('button', { name: ' دخول للنظام' }).click();
    
    // 2. Wait for successful login and dashboard rendering
    // We expect the dashboard title to become visible
    await expect(locatorFrame.getByText('لوحة التحكم والإحصائيات')).toBeVisible({ timeout: 15000 });
    
    // 3. Verify that the UI loaded components from the backend successfully
    const clientsCardText = await locatorFrame.getByText('العملاء').first();
    await expect(clientsCardText).toBeVisible();
  });

});
