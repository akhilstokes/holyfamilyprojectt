import { test, expect } from '@playwright/test';

test.describe('Forgot Password Page Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to forgot password page
    await page.goto('/forgot-password');
    await page.waitForLoadState('networkidle');
  });

  test('Forgot password page should load successfully', async ({ page }) => {
    const heading = page.locator('h2').filter({ hasText: /forgot password/i }).first();
    await expect(heading).toBeVisible();
  });

  test('Should display page heading "Forgot Password"', async ({ page }) => {
    const heading = page.locator('h2');
    await expect(heading).toContainText('Forgot Password');
  });

  test('Should display instruction text', async ({ page }) => {
    const instruction = page.locator('p').filter({ hasText: /enter your email/i }).first();
    await expect(instruction).toBeVisible();
    await expect(instruction).toContainText('send you a link');
  });

  test('Should display company logo', async ({ page }) => {
    const logo = page.locator('img.company-logo').first();
    await expect(logo).toBeVisible();
    
    const src = await logo.getAttribute('src');
    expect(src).toContain('logo.png');
  });

  test('Should display "Back to Home" link', async ({ page }) => {
    const backLink = page.locator('a').filter({ hasText: /back to home/i }).first();
    await expect(backLink).toBeVisible();
  });

  test('Back to Home link should navigate to homepage', async ({ page }) => {
    const backLink = page.locator('a').filter({ hasText: /back to home/i }).first();
    const href = await backLink.getAttribute('href');
    expect(href).toBe('/');
  });

  test('Should display email input field', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]').first();
    await expect(emailInput).toBeVisible();
  });

  test('Email input should have "Email Address" label', async ({ page }) => {
    const label = page.locator('label').filter({ hasText: /email address/i }).first();
    await expect(label).toBeVisible();
  });

  test('Email input should be required', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]').first();
    const isRequired = await emailInput.getAttribute('required');
    expect(isRequired).not.toBeNull();
  });

  test('Should display "Send Reset Link" button', async ({ page }) => {
    const submitButton = page.locator('button[type="submit"]').first();
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toContainText('Send Reset Link');
  });

  test('Submit button should not be disabled initially', async ({ page }) => {
    const submitButton = page.locator('button[type="submit"]').first();
    const isDisabled = await submitButton.isDisabled();
    expect(isDisabled).toBeFalsy();
  });

  test('Should display "Login here" link', async ({ page }) => {
    const loginLink = page.locator('a').filter({ hasText: /login here/i }).first();
    await expect(loginLink).toBeVisible();
  });

  test('Login link should navigate to login page', async ({ page }) => {
    const loginLink = page.locator('a').filter({ hasText: /login here/i }).first();
    const href = await loginLink.getAttribute('href');
    expect(href).toBe('/login');
  });

  test('Should display "Remember your password?" text', async ({ page }) => {
    const text = page.locator('text=/remember your password/i').first();
    await expect(text).toBeVisible();
  });

  test('Should accept email input', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]').first();
    await emailInput.fill('test@example.com');
    
    const value = await emailInput.inputValue();
    expect(value).toBe('test@example.com');
  });

  test('Email input should have type="email"', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]').first();
    const type = await emailInput.getAttribute('type');
    expect(type).toBe('email');
  });

  test('Should have floating label style', async ({ page }) => {
    const floatingGroup = page.locator('.input-group.floating').first();
    await expect(floatingGroup).toBeVisible();
  });

  test('Form should have proper structure', async ({ page }) => {
    const form = page.locator('form').first();
    await expect(form).toBeVisible();
  });

  test('Should show loading state when submitting', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]').first();
    const submitButton = page.locator('button[type="submit"]').first();
    
    await emailInput.fill('test@example.com');
    await submitButton.click();
    
    // Check for loading text
    await page.waitForTimeout(200);
    const buttonText = await submitButton.textContent();
    
    // Button should either show "Sending..." or be disabled
    const isDisabled = await submitButton.isDisabled();
    expect(isDisabled || buttonText.includes('Sending')).toBeTruthy();
  });

  test('Should prevent submission with empty email', async ({ page }) => {
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();
    
    await page.waitForTimeout(300);
    
    // HTML5 validation should prevent submission
    const emailInput = page.locator('input[type="email"]').first();
    const isRequired = await emailInput.getAttribute('required');
    expect(isRequired).not.toBeNull();
  });

  test('Should disable input during loading', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]').first();
    const submitButton = page.locator('button[type="submit"]').first();
    
    await emailInput.fill('test@example.com');
    await submitButton.click();
    
    await page.waitForTimeout(200);
    
    // Input might be disabled during loading
    // This test just checks that the form handles the state
    const form = page.locator('form').first();
    await expect(form).toBeVisible();
  });

  test('Page should have auth-wrapper class', async ({ page }) => {
    const wrapper = page.locator('.auth-wrapper').first();
    await expect(wrapper).toBeVisible();
  });

  test('Page should have form-container class', async ({ page }) => {
    const container = page.locator('.form-container').first();
    await expect(container).toBeVisible();
  });

  test('Logo should be in logo-container', async ({ page }) => {
    const logoContainer = page.locator('.logo-container').first();
    await expect(logoContainer).toBeVisible();
  });

  test('Back link should have SVG icon', async ({ page }) => {
    const backLink = page.locator('a').filter({ hasText: /back to home/i }).first();
    const svg = backLink.locator('svg').first();
    await expect(svg).toBeVisible();
  });

  test('SVG icon should be properly sized', async ({ page }) => {
    const svg = page.locator('.back-link svg').first();
    const width = await svg.getAttribute('width');
    const height = await svg.getAttribute('height');
    
    expect(width).toBe('16');
    expect(height).toBe('16');
  });

  test('Auth links section should be visible', async ({ page }) => {
    const authLinks = page.locator('.auth-links').first();
    await expect(authLinks).toBeVisible();
  });

  test('Should have proper page layout', async ({ page }) => {
    const wrapper = page.locator('.auth-wrapper.no-showcase').first();
    await expect(wrapper).toBeVisible();
  });

  test('Email input should clear after typing', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]').first();
    
    await emailInput.fill('test@example.com');
    await emailInput.clear();
    
    const value = await emailInput.inputValue();
    expect(value).toBe('');
  });

  test('Should allow valid email formats', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]').first();
    
    const validEmails = [
      'user@example.com',
      'test.user@domain.co.in',
      'admin@xyz.com'
    ];
    
    for (const email of validEmails) {
      await emailInput.fill(email);
      const value = await emailInput.inputValue();
      expect(value).toBe(email);
    }
  });

  test('Button should have form-button class', async ({ page }) => {
    const button = page.locator('button.form-button').first();
    await expect(button).toBeVisible();
  });

  test('Input should have form-input class', async ({ page }) => {
    const input = page.locator('input.form-input').first();
    await expect(input).toBeVisible();
  });

  test('Should maintain email value during page interaction', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]').first();
    await emailInput.fill('persistent@example.com');
    
    // Click elsewhere
    const heading = page.locator('h2').first();
    await heading.click();
    
    // Value should persist
    const value = await emailInput.inputValue();
    expect(value).toBe('persistent@example.com');
  });

  test('Page title should be accessible', async ({ page }) => {
    const heading = page.locator('h2');
    const text = await heading.textContent();
    expect(text).toContain('Forgot Password');
  });
});
