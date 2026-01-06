import { test, expect } from '@playwright/test';

test.describe('User Profile Edit Page Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Login first (using any valid user credentials)
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // Login with user credentials
    await page.locator('input#email').fill('admin@xyz.com');
    await page.locator('input#password').fill('admin@123');
    await page.locator('button[type="submit"]').click();
    
    // Wait for login to complete
    await page.waitForTimeout(2000);
    
    // Navigate to profile page
    await page.goto('/user/profile');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
  });

  // Page Load Tests
  test('Profile page should load successfully', async ({ page }) => {
    const profileContainer = page.locator('.profile-container').first();
    await expect(profileContainer).toBeVisible();
  });

  test('Should display profile summary section', async ({ page }) => {
    const summary = page.locator('.profile-summary').first();
    await expect(summary).toBeVisible();
  });

  test('Should display profile content section', async ({ page }) => {
    const content = page.locator('.profile-content').first();
    await expect(content).toBeVisible();
  });

  // Summary Section Tests
  test('Summary should display "Your Profile Details" title', async ({ page }) => {
    const title = page.locator('.summary-title').first();
    await expect(title).toBeVisible();
    await expect(title).toContainText('Your Profile Details');
  });

  test('Summary should have user icon', async ({ page }) => {
    const icon = page.locator('.fa-user-circle').first();
    await expect(icon).toBeVisible();
  });

  test('Summary should display name field', async ({ page }) => {
    const nameLabel = page.locator('.label').filter({ hasText: /your name/i }).first();
    await expect(nameLabel).toBeVisible();
  });

  test('Summary should display email field', async ({ page }) => {
    const emailLabel = page.locator('.label').filter({ hasText: /your email/i }).first();
    await expect(emailLabel).toBeVisible();
  });

  test('Summary should display mobile field', async ({ page }) => {
    const mobileLabel = page.locator('.label').filter({ hasText: /your mobile/i }).first();
    await expect(mobileLabel).toBeVisible();
  });

  test('Summary should display status field', async ({ page }) => {
    const statusLabel = page.locator('.label').filter({ hasText: /status/i }).first();
    await expect(statusLabel).toBeVisible();
  });

  test('Summary should show "Active" status', async ({ page }) => {
    const status = page.locator('.value.active').first();
    await expect(status).toBeVisible();
    await expect(status).toContainText('Active');
  });

  // Tab Navigation Tests
  test('Should display "Edit Profile" tab', async ({ page }) => {
    const editTab = page.locator('.tab').filter({ hasText: /edit profile/i }).first();
    await expect(editTab).toBeVisible();
  });

  test('Should display "Change Password" tab', async ({ page }) => {
    const passwordTab = page.locator('.tab').filter({ hasText: /change password/i }).first();
    await expect(passwordTab).toBeVisible();
  });

  test('"Edit Profile" tab should be active by default', async ({ page }) => {
    const editTab = page.locator('.tab').filter({ hasText: /edit profile/i }).first();
    const className = await editTab.getAttribute('class');
    expect(className).toContain('active');
  });

  test('Should switch to "Change Password" tab on click', async ({ page }) => {
    const passwordTab = page.locator('.tab').filter({ hasText: /change password/i }).first();
    await passwordTab.click();
    await page.waitForTimeout(300);
    
    const className = await passwordTab.getAttribute('class');
    expect(className).toContain('active');
  });

  // Edit Profile Form Tests
  test('Should display "Full Name" input field', async ({ page }) => {
    const nameInput = page.locator('input#name').first();
    await expect(nameInput).toBeVisible();
  });

  test('Should display "Email" input field', async ({ page }) => {
    const emailInput = page.locator('input#email').first();
    await expect(emailInput).toBeVisible();
  });

  test('Should display "Mobile No" input field', async ({ page }) => {
    const phoneInput = page.locator('input#phoneNumber').first();
    await expect(phoneInput).toBeVisible();
  });

  test('Should display "Location" input field', async ({ page }) => {
    const locationInput = page.locator('input#location').first();
    await expect(locationInput).toBeVisible();
  });

  test('Email field should be disabled (read-only)', async ({ page }) => {
    const emailInput = page.locator('input#email').first();
    const isDisabled = await emailInput.isDisabled();
    expect(isDisabled).toBeTruthy();
  });

  test('Name field should be disabled initially (before edit)', async ({ page }) => {
    const nameInput = page.locator('input#name').first();
    const isDisabled = await nameInput.isDisabled();
    expect(isDisabled).toBeTruthy();
  });

  test('Should display "Edit" button', async ({ page }) => {
    const editButton = page.locator('button').filter({ hasText: /^edit$/i }).first();
    await expect(editButton).toBeVisible();
  });

  test('Clicking "Edit" button should enable form fields', async ({ page }) => {
    const editButton = page.locator('button').filter({ hasText: /^edit$/i }).first();
    await editButton.click();
    await page.waitForTimeout(300);
    
    const nameInput = page.locator('input#name').first();
    const isDisabled = await nameInput.isDisabled();
    expect(isDisabled).toBeFalsy();
  });

  test('After clicking Edit, should show "Cancel" and "Update" buttons', async ({ page }) => {
    const editButton = page.locator('button').filter({ hasText: /^edit$/i }).first();
    await editButton.click();
    await page.waitForTimeout(300);
    
    const cancelButton = page.locator('button').filter({ hasText: /cancel/i }).first();
    const updateButton = page.locator('button').filter({ hasText: /update/i }).first();
    
    await expect(cancelButton).toBeVisible();
    await expect(updateButton).toBeVisible();
  });

  test('Should accept input in name field when in edit mode', async ({ page }) => {
    const editButton = page.locator('button').filter({ hasText: /^edit$/i }).first();
    await editButton.click();
    await page.waitForTimeout(300);
    
    const nameInput = page.locator('input#name').first();
    await nameInput.fill('Test User');
    
    const value = await nameInput.inputValue();
    expect(value).toBe('Test User');
  });

  test('Should accept input in phone field when in edit mode', async ({ page }) => {
    const editButton = page.locator('button').filter({ hasText: /^edit$/i }).first();
    await editButton.click();
    await page.waitForTimeout(300);
    
    const phoneInput = page.locator('input#phoneNumber').first();
    await phoneInput.fill('9876543210');
    
    const value = await phoneInput.inputValue();
    expect(value).toBe('9876543210');
  });

  test('Should accept input in location field when in edit mode', async ({ page }) => {
    const editButton = page.locator('button').filter({ hasText: /^edit$/i }).first();
    await editButton.click();
    await page.waitForTimeout(300);
    
    const locationInput = page.locator('input#location').first();
    await locationInput.fill('Mumbai, Maharashtra');
    
    const value = await locationInput.inputValue();
    expect(value).toBe('Mumbai, Maharashtra');
  });

  test('Cancel button should revert changes', async ({ page }) => {
    const editButton = page.locator('button').filter({ hasText: /^edit$/i }).first();
    await editButton.click();
    await page.waitForTimeout(300);
    
    const nameInput = page.locator('input#name').first();
    const originalValue = await nameInput.inputValue();
    
    await nameInput.fill('Changed Name');
    
    const cancelButton = page.locator('button').filter({ hasText: /cancel/i }).first();
    await cancelButton.click();
    await page.waitForTimeout(300);
    
    const currentValue = await nameInput.inputValue();
    expect(currentValue).toBe(originalValue);
  });

  test('Cancel button should disable form fields', async ({ page }) => {
    const editButton = page.locator('button').filter({ hasText: /^edit$/i }).first();
    await editButton.click();
    await page.waitForTimeout(300);
    
    const cancelButton = page.locator('button').filter({ hasText: /cancel/i }).first();
    await cancelButton.click();
    await page.waitForTimeout(300);
    
    const nameInput = page.locator('input#name').first();
    const isDisabled = await nameInput.isDisabled();
    expect(isDisabled).toBeTruthy();
  });

  // Password Change Form Tests
  test('Password form should display when clicking "Change Password" tab', async ({ page }) => {
    const passwordTab = page.locator('.tab').filter({ hasText: /change password/i }).first();
    await passwordTab.click();
    await page.waitForTimeout(300);
    
    const currentPasswordInput = page.locator('input#currentPassword').first();
    await expect(currentPasswordInput).toBeVisible();
  });

  test('Should display "Current Password" field', async ({ page }) => {
    const passwordTab = page.locator('.tab').filter({ hasText: /change password/i }).first();
    await passwordTab.click();
    await page.waitForTimeout(300);
    
    const currentPasswordInput = page.locator('input#currentPassword').first();
    await expect(currentPasswordInput).toBeVisible();
  });

  test('Should display "New Password" field', async ({ page }) => {
    const passwordTab = page.locator('.tab').filter({ hasText: /change password/i }).first();
    await passwordTab.click();
    await page.waitForTimeout(300);
    
    const newPasswordInput = page.locator('input#newPassword').first();
    await expect(newPasswordInput).toBeVisible();
  });

  test('Should display "Confirm Password" field', async ({ page }) => {
    const passwordTab = page.locator('.tab').filter({ hasText: /change password/i }).first();
    await passwordTab.click();
    await page.waitForTimeout(300);
    
    const confirmPasswordInput = page.locator('input#confirmPassword').first();
    await expect(confirmPasswordInput).toBeVisible();
  });

  test('Password fields should have type="password"', async ({ page }) => {
    const passwordTab = page.locator('.tab').filter({ hasText: /change password/i }).first();
    await passwordTab.click();
    await page.waitForTimeout(300);
    
    const currentPasswordInput = page.locator('input#currentPassword').first();
    const type = await currentPasswordInput.getAttribute('type');
    expect(type).toBe('password');
  });

  test('Should display "Change Password" submit button', async ({ page }) => {
    const passwordTab = page.locator('.tab').filter({ hasText: /change password/i }).first();
    await passwordTab.click();
    await page.waitForTimeout(300);
    
    const submitButton = page.locator('button').filter({ hasText: /change password/i }).first();
    await expect(submitButton).toBeVisible();
  });

  test('Should accept input in password fields', async ({ page }) => {
    const passwordTab = page.locator('.tab').filter({ hasText: /change password/i }).first();
    await passwordTab.click();
    await page.waitForTimeout(300);
    
    const currentPasswordInput = page.locator('input#currentPassword').first();
    await currentPasswordInput.fill('currentPass123');
    
    const value = await currentPasswordInput.inputValue();
    expect(value).toBe('currentPass123');
  });

  // Form Grid Layout Tests
  test('Profile form should have grid-2 layout', async ({ page }) => {
    const grid = page.locator('.grid-2').first();
    await expect(grid).toBeVisible();
  });

  test('Form should have proper row structure', async ({ page }) => {
    const formRows = page.locator('.form-row');
    const count = await formRows.count();
    expect(count).toBeGreaterThanOrEqual(4);
  });

  // Label Tests
  test('All input fields should have labels', async ({ page }) => {
    const labels = page.locator('.profile-form label');
    const count = await labels.count();
    expect(count).toBeGreaterThanOrEqual(4);
  });

  test('Name label should display "Full Name"', async ({ page }) => {
    const label = page.locator('label[for="name"]').first();
    await expect(label).toContainText('Full Name');
  });

  test('Email label should display "Email"', async ({ page }) => {
    const label = page.locator('label[for="email"]').first();
    await expect(label).toContainText('Email');
  });

  test('Phone label should display "Mobile No"', async ({ page }) => {
    const label = page.locator('label[for="phoneNumber"]').first();
    await expect(label).toContainText('Mobile No');
  });

  test('Location label should display "Location"', async ({ page }) => {
    const label = page.locator('label[for="location"]').first();
    await expect(label).toContainText('Location');
  });

  // Input Placeholder Tests
  test('Name input should have placeholder', async ({ page }) => {
    const nameInput = page.locator('input#name').first();
    const placeholder = await nameInput.getAttribute('placeholder');
    expect(placeholder).toContain('name');
  });

  test('Phone input should have placeholder', async ({ page }) => {
    const phoneInput = page.locator('input#phoneNumber').first();
    const placeholder = await phoneInput.getAttribute('placeholder');
    expect(placeholder).toBeTruthy();
  });

  test('Location input should have placeholder', async ({ page }) => {
    const locationInput = page.locator('input#location').first();
    const placeholder = await locationInput.getAttribute('placeholder');
    expect(placeholder).toContain('City');
  });

  // Button State Tests
  test('Update button should be disabled during save', async ({ page }) => {
    const editButton = page.locator('button').filter({ hasText: /^edit$/i }).first();
    await editButton.click();
    await page.waitForTimeout(300);
    
    const nameInput = page.locator('input#name').first();
    await nameInput.fill('Test');
    
    const updateButton = page.locator('button').filter({ hasText: /update/i }).first();
    await updateButton.click();
    
    await page.waitForTimeout(200);
    
    // Button should show "Saving..." or be disabled
    const isDisabled = await updateButton.isDisabled();
    const buttonText = await updateButton.textContent();
    
    expect(isDisabled || buttonText.includes('Saving')).toBeTruthy();
  });

  test('Phone input should have type="tel"', async ({ page }) => {
    const phoneInput = page.locator('input#phoneNumber').first();
    const type = await phoneInput.getAttribute('type');
    expect(type).toBe('tel');
  });

  test('Page should have navy-theme class', async ({ page }) => {
    const container = page.locator('.profile-container.navy-theme').first();
    await expect(container).toBeVisible();
  });

  test('Email in summary should be clickable mailto link', async ({ page }) => {
    const emailLink = page.locator('.summary-item a[href^="mailto:"]').first();
    
    if (await emailLink.count() > 0) {
      await expect(emailLink).toBeVisible();
    }
  });

  test('Form actions should be visible', async ({ page }) => {
    const formActions = page.locator('.form-actions').first();
    await expect(formActions).toBeVisible();
  });

  test('Should have tabs container', async ({ page }) => {
    const tabs = page.locator('.tabs').first();
    await expect(tabs).toBeVisible();
  });
});
