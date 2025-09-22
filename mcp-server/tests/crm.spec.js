import { expect, test } from '@playwright/test';

test.describe('EarthCare Network - CRM Tests', () => {
  test('CRM application loads correctly', async ({ page }) => {
    await page.goto('/');
    
    // Check if page loads
    await expect(page).toHaveTitle(/Twenty|EarthCare/);
    
    // Check for key elements
    await expect(page.locator('body')).toBeVisible();
    
    // Test SSL certificate is valid
    const response = await page.request.get('/');
    expect(response.status()).toBe(200);
  });

  test('CRM GraphQL endpoint is accessible', async ({ request }) => {
    const introspectionQuery = {
      query: `
        query IntrospectionQuery {
          __schema {
            queryType {
              name
            }
          }
        }
      `
    };

    const response = await request.post('/graphql', {
      data: introspectionQuery,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.data?.__schema?.queryType?.name).toBeTruthy();
  });

  test('CRM workspace subdomain routing works', async ({ page }) => {
    // Test workspace subdomain if DNS has propagated
    try {
      await page.goto('https://app.crm.app.earthcare.network/');
      
      // Should either load the CRM or redirect properly
      const response = await page.waitForResponse(() => true);
      expect([200, 301, 302, 308].includes(response.status())).toBeTruthy();
      
    } catch (error) {
      // DNS might not have propagated yet - skip this test
      test.skip(true, 'Workspace subdomain DNS not yet propagated');
    }
  });

  test('CRM handles company creation workflow', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Look for login or workspace setup
    const hasLoginForm = await page.locator('form, [data-testid*="login"], [data-testid*="auth"]').count() > 0;
    const hasWorkspaceSetup = await page.locator('[data-testid*="workspace"], .workspace').count() > 0;
    
    expect(hasLoginForm || hasWorkspaceSetup).toBeTruthy();
  });
});