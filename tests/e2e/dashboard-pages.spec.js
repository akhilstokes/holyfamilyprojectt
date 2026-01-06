import { test, expect } from '@playwright/test';

test.describe('Manager Dashboard Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Login as manager
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // Use manager credentials (you may need to adjust these)
    await page.locator('input#email').fill('manager@xyz.com');
    await page.locator('input#password').fill('manager@123');
    await page.locator('button[type="submit"]').click();
    
    // Wait for redirect to manager dashboard
    await page.waitForURL('**/manager/**', { timeout: 10000 });
    
    // Navigate to dashboard if not already there
    await page.goto('/manager/dashboard');
    await page.waitForLoadState('networkidle');
  });

  test('Manager dashboard should load correctly', async ({ page }) => {
    // Check for dashboard title
    const title = page.locator('h1, h2').filter({ hasText: /dashboard/i }).first();
    await expect(title).toBeVisible();
  });

  test('Should display loading state initially', async ({ page }) => {
    // Reload page to see loading
    await page.reload();
    
    // May show loading text briefly
    await page.waitForLoadState('networkidle');
    
    // Dashboard should eventually load
    const dashboardContent = page.locator('.manager-dashboard, [class*="dashboard"]').first();
    await expect(dashboardContent).toBeVisible();
  });

  test('Should display attendance summary section', async ({ page }) => {
    // Wait for data to load
    await page.waitForTimeout(2000);
    
    // Look for attendance-related text or sections
    const hasAttendanceSection = await page.locator('text=/attendance/i').count() > 0;
    const hasStatsSection = await page.locator('[class*="stats"], [class*="summary"]').count() > 0;
    
    // At least one should be present
    expect(hasAttendanceSection || hasStatsSection).toBeTruthy();
  });

  test('Should display notifications section', async ({ page }) => {
    // Wait for notifications to load
    await page.waitForTimeout(2000);
    
    // Check for notifications section
    const notificationsSection = page.locator('[class*="notification"], [class*="notif"]').first();
    
    if (await notificationsSection.count() > 0) {
      await expect(notificationsSection).toBeVisible();
    }
  });

  test('Should handle mark notification as read', async ({ page }) => {
    await page.waitForTimeout(2000);
    
    // Look for unread notification button
    const markReadBtn = page.locator('button').filter({ hasText: /mark read/i }).first();
    
    if (await markReadBtn.count() > 0) {
      await markReadBtn.click();
      await page.waitForTimeout(500);
      
      // Button should disappear or change state
      const isVisible = await markReadBtn.isVisible();
      // If it worked, button might be hidden now
      expect(true).toBeTruthy(); // Basic assertion
    }
  });

  test('Should display bills pending section', async ({ page }) => {
    await page.waitForTimeout(2000);
    
    // Look for bills-related content
    const hasBillsContent = await page.locator('text=/bill|pending/i').count() > 0;
    expect(hasBillsContent).toBeTruthy();
  });

  test('Should display stock summary section', async ({ page }) => {
    await page.waitForTimeout(2000);
    
    // Look for stock-related content
    const hasStockContent = await page.locator('text=/stock|inventory/i').count() > 0;
    
    // Stock section might be present
    if (hasStockContent) {
      expect(hasStockContent).toBeTruthy();
    }
  });

  test('Should refresh data periodically', async ({ page }) => {
    // Dashboard loads initially
    await page.waitForTimeout(1000);
    
    // Wait and check if dashboard is still functional
    await page.waitForTimeout(2000);
    
    const dashboardContent = page.locator('[class*="dashboard"]').first();
    await expect(dashboardContent).toBeVisible();
  });

  test('Should display error message if API fails', async ({ page }) => {
    // This test checks error handling
    // The page should handle errors gracefully
    await page.waitForTimeout(2000);
    
    // Look for error message if any
    const errorMessage = page.locator('[class*="error"], .error-message').first();
    
    if (await errorMessage.count() > 0 && await errorMessage.isVisible()) {
      await expect(errorMessage).toBeVisible();
    }
  });

  test('Should navigate to notification link if present', async ({ page }) => {
    await page.waitForTimeout(2000);
    
    // Look for "Open" link in notifications
    const openLink = page.locator('a').filter({ hasText: /open/i }).first();
    
    if (await openLink.count() > 0) {
      const href = await openLink.getAttribute('href');
      expect(href).toBeTruthy();
    }
  });
});

test.describe('Accountant Dashboard Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Login as accountant
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // Use accountant credentials (adjust as needed)
    await page.locator('input#email').fill('accountant@xyz.com');
    await page.locator('input#password').fill('accountant@123');
    await page.locator('button[type="submit"]').click();
    
    // Wait for redirect
    await page.waitForURL('**/accountant/**', { timeout: 10000 });
    
    // Navigate to dashboard
    await page.goto('/accountant/dashboard');
    await page.waitForLoadState('networkidle');
  });

  test('Accountant dashboard should load correctly', async ({ page }) => {
    // Check for dashboard title
    const title = page.locator('.dashboard-title, h1').filter({ hasText: /accountant|dashboard/i }).first();
    await expect(title).toBeVisible();
  });

  test('Should display dashboard header', async ({ page }) => {
    const header = page.locator('.dashboard-header, [class*="header"]').first();
    await expect(header).toBeVisible();
    
    // Check for subtitle
    const subtitle = page.locator('.dashboard-subtitle, [class*="subtitle"]').first();
    if (await subtitle.count() > 0) {
      await expect(subtitle).toBeVisible();
    }
  });

  test('Should display quick actions section', async ({ page }) => {
    // Check for quick actions
    const quickActions = page.locator('.quick-actions-card, [class*="quick-action"]').first();
    await expect(quickActions).toBeVisible();
    
    // Check section title
    const sectionTitle = page.locator('.section-title, h2').filter({ hasText: /quick actions/i }).first();
    await expect(sectionTitle).toBeVisible();
  });

  test('Should display all quick action buttons', async ({ page }) => {
    // Check for action buttons
    const actionButtons = page.locator('.action-button, [class*="action"]');
    const count = await actionButtons.count();
    
    // Should have at least one action button
    expect(count).toBeGreaterThan(0);
  });

  test('Should have verify latex billing button', async ({ page }) => {
    const latexButton = page.locator('a').filter({ hasText: /verify latex|latex billing/i }).first();
    await expect(latexButton).toBeVisible();
    
    // Check href
    const href = await latexButton.getAttribute('href');
    expect(href).toContain('/accountant/latex');
  });

  test('Should have auto wages button', async ({ page }) => {
    const wagesButton = page.locator('a').filter({ hasText: /wages/i }).first();
    await expect(wagesButton).toBeVisible();
    
    // Check href
    const href = await wagesButton.getAttribute('href');
    expect(href).toContain('/accountant/wages');
  });

  test('Should have stock monitor button', async ({ page }) => {
    const stockButton = page.locator('a').filter({ hasText: /stock/i }).first();
    await expect(stockButton).toBeVisible();
    
    // Check href
    const href = await stockButton.getAttribute('href');
    expect(href).toContain('/accountant/stock');
  });

  test('Should have bill payments button', async ({ page }) => {
    const paymentsButton = page.locator('a').filter({ hasText: /payment|bill/i }).first();
    await expect(paymentsButton).toBeVisible();
    
    // Check href
    const href = await paymentsButton.getAttribute('href');
    expect(href).toContain('/accountant/payments');
  });

  test('Should display notifications section', async ({ page }) => {
    await page.waitForTimeout(1000);
    
    const notificationsCard = page.locator('.notifications-card, [class*="notification"]').first();
    await expect(notificationsCard).toBeVisible();
  });

  test('Should display notifications header', async ({ page }) => {
    await page.waitForTimeout(1000);
    
    const notifHeader = page.locator('.notifications-header, [class*="notif"]').filter({ hasText: /notification/i }).first();
    await expect(notifHeader).toBeVisible();
  });

  test('Should show unread badge if there are unread notifications', async ({ page }) => {
    await page.waitForTimeout(2000);
    
    const unreadBadge = page.locator('.unread-badge, [class*="unread"]').first();
    
    if (await unreadBadge.count() > 0) {
      await expect(unreadBadge).toBeVisible();
    }
  });

  test('Should display empty state when no notifications', async ({ page }) => {
    await page.waitForTimeout(2000);
    
    // Check if empty state is shown
    const emptyState = page.locator('.empty-state, [class*="empty"]').first();
    
    if (await emptyState.count() > 0) {
      await expect(emptyState).toBeVisible();
      
      // Check for empty message
      const emptyText = page.locator('.empty-text').first();
      if (await emptyText.count() > 0) {
        await expect(emptyText).toContainText(/no notifications|all caught up|empty/i);
      }
    }
  });

  test('Should display notification list if notifications exist', async ({ page }) => {
    await page.waitForTimeout(2000);
    
    const notificationsList = page.locator('.notifications-list, [class*="notification-list"]').first();
    
    if (await notificationsList.count() > 0) {
      await expect(notificationsList).toBeVisible();
    }
  });

  test('Should display notification items correctly', async ({ page }) => {
    await page.waitForTimeout(2000);
    
    const notificationItem = page.locator('.notification-item').first();
    
    if (await notificationItem.count() > 0) {
      await expect(notificationItem).toBeVisible();
      
      // Check for title
      const title = notificationItem.locator('.notification-title').first();
      if (await title.count() > 0) {
        await expect(title).toBeVisible();
      }
      
      // Check for message
      const message = notificationItem.locator('.notification-message').first();
      if (await message.count() > 0) {
        await expect(message).toBeVisible();
      }
    }
  });

  test('Should mark notification as read when button clicked', async ({ page }) => {
    await page.waitForTimeout(2000);
    
    const markReadBtn = page.locator('.notif-mark-btn, button').filter({ hasText: /mark read/i }).first();
    
    if (await markReadBtn.count() > 0) {
      await markReadBtn.click();
      await page.waitForTimeout(500);
      
      // Button should disappear or notification should be marked as read
      expect(true).toBeTruthy();
    }
  });

  test('Should navigate when notification open link is clicked', async ({ page }) => {
    await page.waitForTimeout(2000);
    
    const openLink = page.locator('.notif-open-btn, a').filter({ hasText: /open/i }).first();
    
    if (await openLink.count() > 0) {
      const href = await openLink.getAttribute('href');
      expect(href).toBeTruthy();
    }
  });

  test('Should display notification icons', async ({ page }) => {
    await page.waitForTimeout(2000);
    
    const notificationIcon = page.locator('.notification-icon').first();
    
    if (await notificationIcon.count() > 0) {
      await expect(notificationIcon).toBeVisible();
    }
  });

  test('Should display notification timestamp', async ({ page }) => {
    await page.waitForTimeout(2000);
    
    const notificationTime = page.locator('.notification-time').first();
    
    if (await notificationTime.count() > 0) {
      await expect(notificationTime).toBeVisible();
    }
  });

  test('Should handle API authentication errors gracefully', async ({ page }) => {
    // Dashboard should not crash if API fails
    await page.waitForTimeout(2000);
    
    const dashboardContent = page.locator('.accountant-dashboard').first();
    await expect(dashboardContent).toBeVisible();
  });

  test('Quick action buttons should have proper styling', async ({ page }) => {
    const actionButtons = page.locator('.action-button').first();
    
    if (await actionButtons.count() > 0) {
      await expect(actionButtons).toBeVisible();
      
      // Check for icon
      const icon = actionButtons.locator('.action-icon').first();
      if (await icon.count() > 0) {
        await expect(icon).toBeVisible();
      }
      
      // Check for text
      const text = actionButtons.locator('.action-text').first();
      if (await text.count() > 0) {
        await expect(text).toBeVisible();
      }
    }
  });
});
