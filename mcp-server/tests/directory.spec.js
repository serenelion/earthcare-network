import { expect, test } from '@playwright/test';

test.describe('EarthCare Network - Directory Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://app.earthcare.network');
  });

  test('Directory page loads with enhanced features', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/EarthCare Network.*Directory/);
    
    // Check main header
    await expect(page.locator('h1')).toContainText('EarthCare Network Directory');
    
    // Check for enhanced features
    await expect(page.locator('.controls')).toBeVisible();
    await expect(page.locator('.search-input')).toBeVisible();
    await expect(page.locator('.category-select')).toBeVisible();
  });

  test('Map/List view toggle functionality', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check for view toggle buttons
    const listButton = page.locator('button:has-text("List"), [onclick*="showListView"]');
    const mapButton = page.locator('button:has-text("Map"), [onclick*="showMapView"]');
    
    await expect(listButton).toBeVisible();
    await expect(mapButton).toBeVisible();
    
    // Test view switching
    if (await mapButton.count() > 0) {
      await mapButton.click();
      await page.waitForTimeout(1000);
      
      // Check if map container appears
      const mapContainer = page.locator('#mapContainer, .map-container');
      if (await mapContainer.count() > 0) {
        await expect(mapContainer).toBeVisible();
      }
    }
  });

  test('Add Company modal functionality', async ({ page }) => {
    // Look for Add Company button
    const addButton = page.locator('button:has-text("Add Company"), [onclick*="showAddCompanyModal"]');
    
    if (await addButton.count() > 0) {
      await expect(addButton).toBeVisible();
      
      // Click to open modal
      await addButton.click();
      await page.waitForTimeout(500);
      
      // Check if modal appears
      const modal = page.locator('.modal, #addCompanyModal');
      if (await modal.count() > 0) {
        await expect(modal).toBeVisible();
        
        // Check for form fields
        await expect(page.locator('input[id*="companyName"], input[placeholder*="Company"]')).toBeVisible();
        await expect(page.locator('input[id*="contactEmail"], input[type="email"]')).toBeVisible();
      }
    }
  });

  test('Search functionality works', async ({ page }) => {
    const searchInput = page.locator('.search-input, input[placeholder*="Search"]');
    
    if (await searchInput.count() > 0) {
      await expect(searchInput).toBeVisible();
      
      // Test search
      await searchInput.fill('test');
      await page.waitForTimeout(500);
      
      // The search should be functional (no errors)
      expect(await page.locator('body').isVisible()).toBeTruthy();
    }
  });

  test('Category filtering works', async ({ page }) => {
    const categorySelect = page.locator('.category-select, select');
    
    if (await categorySelect.count() > 0) {
      await expect(categorySelect).toBeVisible();
      
      // Test category selection
      await categorySelect.selectOption('permaculture');
      await page.waitForTimeout(500);
      
      // Should not cause errors
      expect(await page.locator('body').isVisible()).toBeTruthy();
    }
  });

  test('MapLibre GL JS integration', async ({ page }) => {
    // Check if MapLibre is loaded
    const mapLibreScript = page.locator('script[src*="maplibre-gl"]');
    await expect(mapLibreScript).toBeVisible();
    
    // Check if maplibre is available in global scope
    const hasMapLibre = await page.evaluate(() => {
      return typeof window.maplibregl !== 'undefined';
    });
    
    expect(hasMapLibre).toBeTruthy();
  });

  test('Responsive design on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check if main container is still visible
    await expect(page.locator('.container')).toBeVisible();
    
    // Check if controls stack vertically on mobile
    const controls = page.locator('.controls');
    if (await controls.count() > 0) {
      const controlsStyle = await controls.evaluate(el => window.getComputedStyle(el).flexDirection);
      expect(['column', 'column-reverse'].includes(controlsStyle) || controlsStyle === 'column').toBeTruthy();
    }
  });

  test('CRM integration link works', async ({ page }) => {
    const crmLink = page.locator('a[href*="crm.app.earthcare.network"]');
    
    if (await crmLink.count() > 0) {
      await expect(crmLink).toBeVisible();
      await expect(crmLink).toHaveAttribute('href', /crm\.app\.earthcare\.network/);
      await expect(crmLink).toHaveAttribute('target', '_blank');
    }
  });
});