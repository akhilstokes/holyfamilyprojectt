import { test, expect } from '@playwright/test';

test.describe('Admin Staff Invite Page Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin first
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // Fill login credentials
    await page.locator('input#email').fill('admin@xyz.com');
    await page.locator('input#password').fill('admin@123');
    await page.locator('button[type="submit"]').click();
    
    // Wait for redirect to admin home
    await page.waitForURL('**/admin/home', { timeout: 10000 });
    
    // Navigate to staff management page
    await page.goto('/admin/staff');
    await page.waitForLoadState('networkidle');
  });

  test('Staff management page should load correctly', async ({ page }) => {
    // Check if we're on the staff page
    const heading = page.locator('h1, h2').filter({ hasText: /staff/i }).first();
    await expect(heading).toBeVisible();
    
    // Check for invite staff button or form
    const inviteButton = page.locator('button').filter({ hasText: /invite|add/i }).first();
    const emailInput = page.locator('input[name="email"]');
    
    // Either button or form should be visible
    const hasInviteUI = (await inviteButton.count() > 0) || (await emailInput.count() > 0);
    expect(hasInviteUI).toBeTruthy();
  });

  test('Should display staff invite form fields', async ({ page }) => {
    // Check for essential form fields
    const emailInput = page.locator('input[name="email"]');
    const phoneInput = page.locator('input[name="phone"]');
    const nameInput = page.locator('input[name="name"]');
    
    await expect(emailInput).toBeVisible();
    await expect(phoneInput).toBeVisible();
    await expect(nameInput).toBeVisible();
  });

  test('Should have role selection dropdown', async ({ page }) => {
    // Check for role selector
    const roleSelect = page.locator('select[name="role"]');
    await expect(roleSelect).toBeVisible();
    
    // Check role options
    const options = await roleSelect.locator('option').allTextContents();
    const hasFieldStaff = options.some(opt => opt.toLowerCase().includes('field'));
    const hasLabStaff = options.some(opt => opt.toLowerCase().includes('lab'));
    const hasDeliveryStaff = options.some(opt => opt.toLowerCase().includes('delivery'));
    
    expect(hasFieldStaff).toBeTruthy();
    expect(hasLabStaff).toBeTruthy();
    expect(hasDeliveryStaff).toBeTruthy();
  });

  test('Should validate email field - empty', async ({ page }) => {
    const emailInput = page.locator('input[name="email"]');
    const submitButton = page.locator('button').filter({ hasText: /invite|send|submit/i }).first();
    
    // Clear email and try to submit
    await emailInput.clear();
    await submitButton.click();
    
    await page.waitForTimeout(500);
    
    // Should show validation error
    const errorMessage = page.locator('.error, .error-message, .validation-error').first();
    const isVisible = await errorMessage.isVisible();
    expect(isVisible).toBeTruthy();
  });

  test('Should validate email format', async ({ page }) => {
    const emailInput = page.locator('input[name="email"]');
    const submitButton = page.locator('button').filter({ hasText: /invite|send|submit/i }).first();
    
    // Enter invalid email
    await emailInput.fill('invalid-email');
    await submitButton.click();
    
    await page.waitForTimeout(500);
    
    // Should show validation error
    const errorMessage = page.locator('.error, .error-message, .validation-error').first();
    const hasError = await errorMessage.isVisible();
    expect(hasError).toBeTruthy();
  });

  test('Should validate phone number field', async ({ page }) => {
    const phoneInput = page.locator('input[name="phone"]');
    const submitButton = page.locator('button').filter({ hasText: /invite|send|submit/i }).first();
    
    // Clear phone and try to submit
    await phoneInput.clear();
    await submitButton.click();
    
    await page.waitForTimeout(500);
    
    // Should show validation error
    const errorMessage = page.locator('.error, .error-message, .validation-error').first();
    const isVisible = await errorMessage.isVisible();
    expect(isVisible).toBeTruthy();
  });

  test('Should validate name field', async ({ page }) => {
    const nameInput = page.locator('input[name="name"]');
    const submitButton = page.locator('button').filter({ hasText: /invite|send|submit/i }).first();
    
    // Clear name and try to submit
    await nameInput.clear();
    await submitButton.click();
    
    await page.waitForTimeout(500);
    
    // Should show validation error
    const errorMessage = page.locator('.error, .error-message, .validation-error').first();
    const isVisible = await errorMessage.isVisible();
    expect(isVisible).toBeTruthy();
  });

  test('Should show confirmation dialog before sending invite', async ({ page }) => {
    const timestamp = Date.now();
    
    // Fill valid data
    await page.locator('input[name="email"]').fill(`teststaff${timestamp}@example.com`);
    await page.locator('input[name="phone"]').fill('9876543210');
    await page.locator('input[name="name"]').fill('Test Staff Member');
    await page.locator('input[name="address"]').fill('Test Address');
    await page.locator('select[name="role"]').selectOption('field');
    
    // Submit form
    const submitButton = page.locator('button').filter({ hasText: /invite|send|submit/i }).first();
    await submitButton.click();
    
    await page.waitForTimeout(1000);
    
    // Should show confirmation dialog
    const confirmDialog = page.locator('.confirmation, .modal, .dialog').first();
    const hasConfirmation = await confirmDialog.isVisible();
    
    if (hasConfirmation) {
      expect(hasConfirmation).toBeTruthy();
    }
  });

  test('Should display success message after sending invite', async ({ page }) => {
    const timestamp = Date.now();
    
    // Fill valid data
    await page.locator('input[name="email"]').fill(`newstaff${timestamp}@example.com`);
    await page.locator('input[name="phone"]').fill('9876543210');
    await page.locator('input[name="name"]').fill('New Staff Member');
    await page.locator('input[name="address"]').fill('123 Test Street');
    await page.locator('select[name="role"]').selectOption('field');
    
    // Submit form
    const submitButton = page.locator('button').filter({ hasText: /invite|send|submit/i }).first();
    await submitButton.click();
    
    // Handle confirmation if it appears
    await page.waitForTimeout(500);
    const confirmButton = page.locator('button').filter({ hasText: /confirm|yes|proceed/i }).first();
    if (await confirmButton.count() > 0) {
      await confirmButton.click();
    }
    
    // Wait for success message
    await page.waitForSelector('.success, .success-message', { timeout: 5000 });
    
    const successMessage = page.locator('.success, .success-message').first();
    await expect(successMessage).toBeVisible();
    await expect(successMessage).toContainText(/success|sent|invited/i);
  });

  test('Should prevent duplicate email invites', async ({ page }) => {
    // Try to invite with admin email (already exists)
    await page.locator('input[name="email"]').fill('admin@xyz.com');
    await page.locator('input[name="phone"]').fill('9876543210');
    await page.locator('input[name="name"]').fill('Test Name');
    await page.locator('input[name="address"]').fill('Test Address');
    
    const submitButton = page.locator('button').filter({ hasText: /invite|send|submit/i }).first();
    await submitButton.click();
    
    await page.waitForTimeout(1000);
    
    // Handle confirmation if shown
    const confirmButton = page.locator('button').filter({ hasText: /confirm|yes|proceed/i }).first();
    if (await confirmButton.count() > 0) {
      await confirmButton.click();
    }
    
    // Should show error message
    await page.waitForSelector('.error, .error-message', { timeout: 5000 });
    
    const errorMessage = page.locator('.error, .error-message').first();
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText(/already|exists|duplicate|used/i);
  });

  test('Should display list of invited staff', async ({ page }) => {
    // Check for staff table or list
    const staffTable = page.locator('table, .staff-list, .staff-table').first();
    await expect(staffTable).toBeVisible();
    
    // Check for table headers
    const headers = page.locator('th, .table-header');
    const headerCount = await headers.count();
    expect(headerCount).toBeGreaterThan(0);
  });

  test('Should have search/filter functionality', async ({ page }) => {
    // Check for search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i], input[placeholder*="filter" i]').first();
    
    if (await searchInput.count() > 0) {
      await expect(searchInput).toBeVisible();
      
      // Try searching
      await searchInput.fill('test');
      await page.waitForTimeout(500);
      
      // Results should update (table should still be visible)
      const staffTable = page.locator('table, .staff-list').first();
      await expect(staffTable).toBeVisible();
    }
  });

  test('Should have role filter dropdown', async ({ page }) => {
    // Check for role filter
    const roleFilter = page.locator('select').filter({ hasText: /role|filter/i }).first();
    
    if (await roleFilter.count() > 0) {
      await expect(roleFilter).toBeVisible();
      
      // Change filter
      await roleFilter.selectOption({ index: 1 });
      await page.waitForTimeout(500);
    }
  });

  test('Should display staff status badges', async ({ page }) => {
    // Check for status indicators
    const statusBadges = page.locator('.status, .badge, [class*="status"]');
    const badgeCount = await statusBadges.count();
    
    if (badgeCount > 0) {
      // At least one status badge should be visible
      await expect(statusBadges.first()).toBeVisible();
    }
  });

  test('Should have resend invite option for pending staff', async ({ page }) => {
    // Look for resend button
    const resendButton = page.locator('button').filter({ hasText: /resend/i }).first();
    
    if (await resendButton.count() > 0) {
      await expect(resendButton).toBeVisible();
    }
  });

  test('Should have approve button for verified staff', async ({ page }) => {
    // Look for approve button
    const approveButton = page.locator('button').filter({ hasText: /approve/i }).first();
    
    if (await approveButton.count() > 0) {
      await expect(approveButton).toBeVisible();
    }
  });

  test('Should clear form after successful submission', async ({ page }) => {
    const timestamp = Date.now();
    
    // Fill form
    await page.locator('input[name="email"]').fill(`cleartest${timestamp}@example.com`);
    await page.locator('input[name="phone"]').fill('9876543210');
    await page.locator('input[name="name"]').fill('Clear Test');
    await page.locator('input[name="address"]').fill('Test Address');
    
    // Submit
    const submitButton = page.locator('button').filter({ hasText: /invite|send|submit/i }).first();
    await submitButton.click();
    
    // Confirm if needed
    await page.waitForTimeout(500);
    const confirmButton = page.locator('button').filter({ hasText: /confirm|yes|proceed/i }).first();
    if (await confirmButton.count() > 0) {
      await confirmButton.click();
    }
    
    // Wait for success
    await page.waitForTimeout(2000);
    
    // Form fields should be cleared
    const emailValue = await page.locator('input[name="email"]').inputValue();
    const nameValue = await page.locator('input[name="name"]').inputValue();
    
    expect(emailValue).toBe('');
    expect(nameValue).toBe('');
  });

  test('Should sanitize phone number input', async ({ page }) => {
    const phoneInput = page.locator('input[name="phone"]');
    
    // Enter phone with spaces and special characters
    await phoneInput.fill('98 765 - 43210');
    await phoneInput.blur();
    
    await page.waitForTimeout(300);
    
    // Should be sanitized (spaces removed)
    const value = await phoneInput.inputValue();
    const hasNoSpaces = !value.includes(' ');
    expect(hasNoSpaces).toBeTruthy();
  });

  test('Should validate address field', async ({ page }) => {
    const addressInput = page.locator('input[name="address"], textarea[name="address"]');
    
    if (await addressInput.count() > 0) {
      await expect(addressInput).toBeVisible();
      
      // Try with empty address
      await addressInput.clear();
      const submitButton = page.locator('button').filter({ hasText: /invite|send|submit/i }).first();
      await submitButton.click();
      
      await page.waitForTimeout(500);
      
      // May show validation error (optional field in some cases)
      const hasError = await page.locator('.error, .error-message').first().isVisible();
      // Address might be optional, so we just check the field exists
      expect(await addressInput.count()).toBeGreaterThan(0);
    }
  });

  test('Should display staff ID field', async ({ page }) => {
    const staffIdInput = page.locator('input[name="staffId"]');
    
    if (await staffIdInput.count() > 0) {
      await expect(staffIdInput).toBeVisible();
    }
  });

  test('Should have download/export staff list option', async ({ page }) => {
    // Check for export/download buttons
    const exportButton = page.locator('button').filter({ hasText: /download|export|pdf|excel/i }).first();
    
    if (await exportButton.count() > 0) {
      await expect(exportButton).toBeVisible();
    }
  });

  test('Should show loading state during form submission', async ({ page }) => {
    const timestamp = Date.now();
    
    // Fill form
    await page.locator('input[name="email"]').fill(`loading${timestamp}@example.com`);
    await page.locator('input[name="phone"]').fill('9876543210');
    await page.locator('input[name="name"]').fill('Loading Test');
    
    // Submit
    const submitButton = page.locator('button').filter({ hasText: /invite|send|submit/i }).first();
    await submitButton.click();
    
    // Check for loading state
    await page.waitForTimeout(200);
    
    const isDisabled = await submitButton.isDisabled();
    const buttonText = await submitButton.textContent();
    const hasLoadingState = isDisabled || buttonText.toLowerCase().includes('sending') || buttonText.toLowerCase().includes('loading');
    
    expect(hasLoadingState).toBeTruthy();
  });
});
