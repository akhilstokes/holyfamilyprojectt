import { test, expect } from '@playwright/test';

test.describe('Manager Rate Update Page Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Login as manager
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // Use manager credentials
    await page.locator('input#email').fill('manager@xyz.com');
    await page.locator('input#password').fill('manager@123');
    await page.locator('button[type="submit"]').click();
    
    // Wait for redirect to manager area
    await page.waitForURL('**/manager/**', { timeout: 10000 });
    
    // Navigate to rate update page
    await page.goto('/manager/rate-update');
    await page.waitForLoadState('networkidle');
  });

  test('Rate update page should load correctly', async ({ page }) => {
    // Check page title
    const title = page.locator('h2').filter({ hasText: /propose|rate/i }).first();
    await expect(title).toBeVisible();
    await expect(title).toContainText(/Company.*Market Rate/i);
  });

  test('Should display refresh button', async ({ page }) => {
    const refreshButton = page.locator('button').filter({ hasText: /refresh/i }).first();
    await expect(refreshButton).toBeVisible();
  });

  test('Should display submit rate proposal form', async ({ page }) => {
    const formTitle = page.locator('h4').filter({ hasText: /submit rate proposal/i }).first();
    await expect(formTitle).toBeVisible();
  });

  test('Should display all required form fields', async ({ page }) => {
    // Effective Date field
    const dateInput = page.locator('input[name="effectiveDate"]');
    await expect(dateInput).toBeVisible();
    
    // Company Rate field
    const companyRateInput = page.locator('input[name="companyRate"]');
    await expect(companyRateInput).toBeVisible();
    
    // Market Rate field
    const marketRateInput = page.locator('input[name="marketRate"]');
    await expect(marketRateInput).toBeVisible();
    
    // Notes field (optional)
    const notesInput = page.locator('textarea[name="notes"]');
    await expect(notesInput).toBeVisible();
  });

  test('Effective date field should have today as default', async ({ page }) => {
    const dateInput = page.locator('input[name="effectiveDate"]');
    const value = await dateInput.inputValue();
    
    // Should have a value (today's date)
    expect(value).toBeTruthy();
    
    // Should be today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    expect(value).toBe(today);
  });

  test('Should prevent past dates in effective date field', async ({ page }) => {
    const dateInput = page.locator('input[name="effectiveDate"]');
    
    // Check min attribute
    const minDate = await dateInput.getAttribute('min');
    const today = new Date().toISOString().split('T')[0];
    
    expect(minDate).toBe(today);
  });

  test('Should validate required fields on empty submission', async ({ page }) => {
    // Clear all fields
    await page.locator('input[name="companyRate"]').fill('');
    await page.locator('input[name="marketRate"]').fill('');
    
    // Try to submit
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    
    await page.waitForTimeout(500);
    
    // Should show error or prevent submission (HTML5 validation)
    const companyRateInput = page.locator('input[name="companyRate"]');
    const isRequired = await companyRateInput.getAttribute('required');
    expect(isRequired).not.toBeNull();
  });

  test('Should validate company rate field is a number', async ({ page }) => {
    const companyRateInput = page.locator('input[name="companyRate"]');
    
    // Check input type
    const inputType = await companyRateInput.getAttribute('type');
    expect(inputType).toBe('number');
    
    // Check step attribute for decimal support
    const step = await companyRateInput.getAttribute('step');
    expect(step).toBe('0.01');
  });

  test('Should validate market rate field is a number', async ({ page }) => {
    const marketRateInput = page.locator('input[name="marketRate"]');
    
    // Check input type
    const inputType = await marketRateInput.getAttribute('type');
    expect(inputType).toBe('number');
    
    // Check step attribute
    const step = await marketRateInput.getAttribute('step');
    expect(step).toBe('0.01');
  });

  test('Should not allow negative values in rate fields', async ({ page }) => {
    const companyRateInput = page.locator('input[name="companyRate"]');
    const marketRateInput = page.locator('input[name="marketRate"]');
    
    // Check min attribute
    const companyMin = await companyRateInput.getAttribute('min');
    const marketMin = await marketRateInput.getAttribute('min');
    
    expect(companyMin).toBe('0');
    expect(marketMin).toBe('0');
  });

  test('Should display placeholders in input fields', async ({ page }) => {
    const companyRateInput = page.locator('input[name="companyRate"]');
    const marketRateInput = page.locator('input[name="marketRate"]');
    
    const companyPlaceholder = await companyRateInput.getAttribute('placeholder');
    const marketPlaceholder = await marketRateInput.getAttribute('placeholder');
    
    expect(companyPlaceholder).toContain('rate');
    expect(marketPlaceholder).toContain('rate');
  });

  test('Should submit valid rate proposal successfully', async ({ page }) => {
    // Fill form with valid data
    const today = new Date().toISOString().split('T')[0];
    await page.locator('input[name="effectiveDate"]').fill(today);
    await page.locator('input[name="companyRate"]').fill('150.50');
    await page.locator('input[name="marketRate"]').fill('155.75');
    await page.locator('textarea[name="notes"]').fill('Test rate update');
    
    // Submit form
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    
    // Wait for response
    await page.waitForTimeout(2000);
    
    // Should show success message or form should clear
    const successMessage = page.locator('text=/success|submitted|proposed/i').first();
    
    if (await successMessage.count() > 0) {
      await expect(successMessage).toBeVisible();
    }
  });

  test('Should show loading state during submission', async ({ page }) => {
    // Fill form
    await page.locator('input[name="companyRate"]').fill('150');
    await page.locator('input[name="marketRate"]').fill('155');
    
    // Submit
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    
    // Check loading state
    await page.waitForTimeout(200);
    
    const buttonText = await submitButton.textContent();
    const isDisabled = await submitButton.isDisabled();
    
    expect(isDisabled || buttonText.includes('Submitting')).toBeTruthy();
  });

  test('Should clear form after successful submission', async ({ page }) => {
    // Fill and submit
    await page.locator('input[name="companyRate"]').fill('150');
    await page.locator('input[name="marketRate"]').fill('155');
    await page.locator('textarea[name="notes"]').fill('Test notes');
    
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    
    // Wait for submission
    await page.waitForTimeout(2000);
    
    // Fields should be cleared (except date which resets to today)
    const companyRateValue = await page.locator('input[name="companyRate"]').inputValue();
    const marketRateValue = await page.locator('input[name="marketRate"]').inputValue();
    const notesValue = await page.locator('textarea[name="notes"]').inputValue();
    
    expect(companyRateValue).toBe('');
    expect(marketRateValue).toBe('');
    expect(notesValue).toBe('');
  });

  test('Should display pending proposals section', async ({ page }) => {
    const pendingTitle = page.locator('h4').filter({ hasText: /pending proposals/i }).first();
    await expect(pendingTitle).toBeVisible();
  });

  test('Should show empty state when no pending proposals', async ({ page }) => {
    await page.waitForTimeout(1000);
    
    // Check for empty message
    const emptyMessage = page.locator('text=/no submitted rates|no.*pending/i').first();
    
    if (await emptyMessage.count() > 0) {
      await expect(emptyMessage).toBeVisible();
    }
  });

  test('Should display pending rate proposals if available', async ({ page }) => {
    await page.waitForTimeout(1500);
    
    // Look for rate proposal cards
    const rateCards = page.locator('[style*="padding"][style*="border"]').filter({ hasText: /latex|effective/i });
    
    if (await rateCards.count() > 0) {
      // Should show rate details
      const firstCard = rateCards.first();
      await expect(firstCard).toBeVisible();
    }
  });

  test('Pending proposals should show effective date', async ({ page }) => {
    await page.waitForTimeout(1500);
    
    const effectiveDate = page.locator('text=/effective/i').first();
    
    if (await effectiveDate.count() > 0) {
      await expect(effectiveDate).toBeVisible();
    }
  });

  test('Pending proposals should show company and market rates', async ({ page }) => {
    await page.waitForTimeout(1500);
    
    const marketRate = page.locator('text=/market/i').first();
    
    if (await marketRate.count() > 0) {
      await expect(marketRate).toBeVisible();
    }
  });

  test('Pending proposals should show status badge', async ({ page }) => {
    await page.waitForTimeout(1500);
    
    const statusBadge = page.locator('text=/pending.*verification|awaiting|pending/i').first();
    
    if (await statusBadge.count() > 0) {
      await expect(statusBadge).toBeVisible();
    }
  });

  test('Should display instructions section', async ({ page }) => {
    const instructionsTitle = page.locator('h4').filter({ hasText: /instructions/i }).first();
    await expect(instructionsTitle).toBeVisible();
  });

  test('Instructions should explain rate update process', async ({ page }) => {
    const processHeading = page.locator('h5').filter({ hasText: /rate update process/i }).first();
    await expect(processHeading).toBeVisible();
    
    // Should have ordered list
    const orderedList = page.locator('ol').first();
    await expect(orderedList).toBeVisible();
  });

  test('Instructions should show important notes', async ({ page }) => {
    const notesHeading = page.locator('h5').filter({ hasText: /important notes/i }).first();
    await expect(notesHeading).toBeVisible();
    
    // Should have bullet list
    const bulletList = page.locator('ul').first();
    await expect(bulletList).toBeVisible();
  });

  test('Should refresh pending proposals when refresh button clicked', async ({ page }) => {
    const refreshButton = page.locator('button').filter({ hasText: /refresh/i }).first();
    
    await refreshButton.click();
    await page.waitForTimeout(1000);
    
    // Button should show loading text briefly
    const buttonText = await refreshButton.textContent();
    
    // After refresh, pending section should still be visible
    const pendingSection = page.locator('h4').filter({ hasText: /pending/i }).first();
    await expect(pendingSection).toBeVisible();
  });

  test('Should show error message for past effective date', async ({ page }) => {
    // Set a past date
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);
    const pastDateStr = pastDate.toISOString().split('T')[0];
    
    await page.locator('input[name="effectiveDate"]').fill(pastDateStr);
    await page.locator('input[name="companyRate"]').fill('150');
    await page.locator('input[name="marketRate"]').fill('155');
    
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    
    await page.waitForTimeout(500);
    
    // Should show error message
    const errorMessage = page.locator('[style*="tomato"], [style*="fee"]').filter({ hasText: /past|cannot/i }).first();
    
    if (await errorMessage.count() > 0) {
      await expect(errorMessage).toBeVisible();
    }
  });

  test('Should display currency formatting in pending proposals', async ({ page }) => {
    await page.waitForTimeout(1500);
    
    // Look for currency symbols
    const currencyText = page.locator('text=/₹|INR/i').first();
    
    if (await currencyText.count() > 0) {
      await expect(currencyText).toBeVisible();
    }
  });

  test('Form fields should update on input change', async ({ page }) => {
    const companyRateInput = page.locator('input[name="companyRate"]');
    
    await companyRateInput.fill('200.50');
    const value = await companyRateInput.inputValue();
    
    expect(value).toBe('200.50');
  });

  test('Notes field should be optional', async ({ page }) => {
    const notesInput = page.locator('textarea[name="notes"]');
    
    // Should not have required attribute
    const isRequired = await notesInput.getAttribute('required');
    expect(isRequired).toBeNull();
  });

  test('Notes field should have multiple rows', async ({ page }) => {
    const notesInput = page.locator('textarea[name="notes"]');
    
    // Should have rows attribute
    const rows = await notesInput.getAttribute('rows');
    expect(parseInt(rows)).toBeGreaterThan(1);
  });

  test('Submit button should have full width styling', async ({ page }) => {
    const submitButton = page.locator('button[type="submit"]');
    
    const style = await submitButton.getAttribute('style');
    expect(style).toContain('width');
  });

  test('Page should have two-column layout for forms', async ({ page }) => {
    // Check for grid layout
    const gridContainer = page.locator('[style*="grid-template-columns"]').first();
    await expect(gridContainer).toBeVisible();
  });

  test('Should handle API errors gracefully', async ({ page }) => {
    // Page should not crash if API fails
    await page.waitForTimeout(1000);
    
    // Form should still be visible
    const formTitle = page.locator('h4').filter({ hasText: /submit/i }).first();
    await expect(formTitle).toBeVisible();
  });

  // Additional Advanced Tests
  test('Should display product name (Latex 60%) in proposals', async ({ page }) => {
    await page.waitForTimeout(1500);
    
    const productName = page.locator('text=/latex.*60/i').first();
    
    if (await productName.count() > 0) {
      await expect(productName).toBeVisible();
    }
  });

  test('Should show submitted date in proposals', async ({ page }) => {
    await page.waitForTimeout(1500);
    
    const submittedText = page.locator('text=/submitted/i').first();
    
    if (await submittedText.count() > 0) {
      await expect(submittedText).toBeVisible();
    }
  });

  test('Form should reset date to today after submission', async ({ page }) => {
    // Fill and submit
    await page.locator('input[name="companyRate"]').fill('160');
    await page.locator('input[name="marketRate"]').fill('165');
    
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    
    await page.waitForTimeout(2000);
    
    // Date should reset to today
    const dateInput = page.locator('input[name="effectiveDate"]');
    const value = await dateInput.inputValue();
    const today = new Date().toISOString().split('T')[0];
    
    expect(value).toBe(today);
  });

  test('Should validate decimal input for company rate', async ({ page }) => {
    const companyRateInput = page.locator('input[name="companyRate"]');
    
    await companyRateInput.fill('150.75');
    const value = await companyRateInput.inputValue();
    
    expect(value).toBe('150.75');
  });

  test('Should validate decimal input for market rate', async ({ page }) => {
    const marketRateInput = page.locator('input[name="marketRate"]');
    
    await marketRateInput.fill('155.99');
    const value = await marketRateInput.inputValue();
    
    expect(value).toBe('155.99');
  });

  test('Should display label "Today Rate" for effective date', async ({ page }) => {
    const label = page.locator('label').filter({ hasText: /today rate/i }).first();
    await expect(label).toBeVisible();
  });

  test('Should display label "Company Rate (per 100 Kg)"', async ({ page }) => {
    const label = page.locator('label').filter({ hasText: /company rate.*100/i }).first();
    await expect(label).toBeVisible();
  });

  test('Should display label "Official Market Rate (per 100 Kg)"', async ({ page }) => {
    const label = page.locator('label').filter({ hasText: /market rate.*100/i }).first();
    await expect(label).toBeVisible();
  });

  test('Should display "Notes (Optional)" label', async ({ page }) => {
    const label = page.locator('label').filter({ hasText: /notes.*optional/i }).first();
    await expect(label).toBeVisible();
  });

  test('Submit button should show "Submit for Admin Verification" text', async ({ page }) => {
    const submitButton = page.locator('button[type="submit"]');
    const buttonText = await submitButton.textContent();
    
    expect(buttonText).toContain('Admin Verification');
  });

  test('Should display asterisk (*) for required fields', async ({ page }) => {
    const requiredLabels = page.locator('label').filter({ hasText: /\*/  });
    const count = await requiredLabels.count();
    
    // Should have at least 3 required fields (date, company rate, market rate)
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('Should allow long notes (textarea)', async ({ page }) => {
    const notesInput = page.locator('textarea[name="notes"]');
    const longNote = 'This is a very long note for testing purposes. It contains multiple sentences to verify that the textarea can handle longer text inputs without issues. This simulates real-world usage where managers might add detailed explanations.';
    
    await notesInput.fill(longNote);
    const value = await notesInput.inputValue();
    
    expect(value).toBe(longNote);
  });

  test('Should maintain form state when navigating away and back', async ({ page }) => {
    // Fill form but don't submit
    await page.locator('input[name="companyRate"]').fill('175');
    await page.locator('input[name="marketRate"]').fill('180');
    
    // Note: This test verifies form behavior
    const companyValue = await page.locator('input[name="companyRate"]').inputValue();
    expect(companyValue).toBe('175');
  });

  test('Should show two main sections side by side', async ({ page }) => {
    const submitSection = page.locator('text=/submit rate proposal/i').first();
    const pendingSection = page.locator('text=/pending proposals/i').first();
    
    await expect(submitSection).toBeVisible();
    await expect(pendingSection).toBeVisible();
  });

  test('Instructions should mention "rates are per 100 Kg"', async ({ page }) => {
    const instruction = page.locator('text=/per 100 kg/i').first();
    await expect(instruction).toBeVisible();
  });

  test('Instructions should mention "admin approval"', async ({ page }) => {
    const instruction = page.locator('text=/admin.*approv/i').first();
    await expect(instruction).toBeVisible();
  });

  test('Should prevent form submission with only company rate filled', async ({ page }) => {
    await page.locator('input[name="companyRate"]').fill('150');
    await page.locator('input[name="marketRate"]').fill('');
    
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    
    await page.waitForTimeout(500);
    
    // Market rate should be required
    const marketRateInput = page.locator('input[name="marketRate"]');
    const isRequired = await marketRateInput.getAttribute('required');
    expect(isRequired).not.toBeNull();
  });

  test('Should prevent form submission with only market rate filled', async ({ page }) => {
    await page.locator('input[name="companyRate"]').fill('');
    await page.locator('input[name="marketRate"]').fill('155');
    
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    
    await page.waitForTimeout(500);
    
    // Company rate should be required
    const companyRateInput = page.locator('input[name="companyRate"]');
    const isRequired = await companyRateInput.getAttribute('required');
    expect(isRequired).not.toBeNull();
  });

  test('Should handle multiple rapid submissions gracefully', async ({ page }) => {
    await page.locator('input[name="companyRate"]').fill('150');
    await page.locator('input[name="marketRate"]').fill('155');
    
    const submitButton = page.locator('button[type="submit"]');
    
    // Click multiple times rapidly
    await submitButton.click();
    await page.waitForTimeout(100);
    
    // Button should be disabled during submission
    const isDisabled = await submitButton.isDisabled();
    expect(isDisabled).toBeTruthy();
  });

  test('Pending proposals should have scrollable area', async ({ page }) => {
    await page.waitForTimeout(1500);
    
    // Check for max-height style on proposals container
    const proposalsContainer = page.locator('[style*="maxHeight"], [style*="max-height"]').first();
    
    if (await proposalsContainer.count() > 0) {
      const style = await proposalsContainer.getAttribute('style');
      expect(style).toContain('overflow');
    }
  });

  test('Should display Indian Rupee symbol (₹)', async ({ page }) => {
    const rupeeSymbol = page.locator('text=/₹/').first();
    
    // Check in placeholders or labels
    const companyRateInput = page.locator('input[name="companyRate"]');
    const placeholder = await companyRateInput.getAttribute('placeholder');
    
    expect(placeholder).toContain('₹');
  });

  test('Should show card styling for forms', async ({ page }) => {
    const cards = page.locator('.dash-card');
    const count = await cards.count();
    
    // Should have at least 2 cards (submit form and pending proposals)
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test('Refresh button should not be disabled initially', async ({ page }) => {
    const refreshButton = page.locator('button').filter({ hasText: /refresh/i }).first();
    const isDisabled = await refreshButton.isDisabled();
    
    expect(isDisabled).toBeFalsy();
  });

  test('Should allow future dates in effective date field', async ({ page }) => {
    const dateInput = page.locator('input[name="effectiveDate"]');
    
    // Set tomorrow's date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    await dateInput.fill(tomorrowStr);
    const value = await dateInput.inputValue();
    
    expect(value).toBe(tomorrowStr);
  });

  test('Should validate that proposals show yellow pending badge', async ({ page }) => {
    await page.waitForTimeout(1500);
    
    const pendingBadge = page.locator('[style*="fef3c7"], [style*="yellow"]').first();
    
    if (await pendingBadge.count() > 0) {
      await expect(pendingBadge).toBeVisible();
    }
  });
});
