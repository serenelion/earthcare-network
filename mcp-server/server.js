#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
    CallToolRequestSchema,
    ErrorCode,
    ListToolsRequestSchema,
    McpError,
} from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';
import { chromium } from 'playwright';

class EarthCareTestServer {
  constructor() {
    this.server = new Server(
      {
        name: 'earthcare-test-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    
    // Error handling
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'test_crm_health',
          description: 'Test CRM application health and basic functionality',
          inputSchema: {
            type: 'object',
            properties: {
              url: {
                type: 'string',
                description: 'CRM URL to test',
                default: 'https://crm.app.earthcare.network'
              }
            }
          }
        },
        {
          name: 'test_directory_health',
          description: 'Test directory application health and features',
          inputSchema: {
            type: 'object',
            properties: {
              url: {
                type: 'string',
                description: 'Directory URL to test',
                default: 'https://app.earthcare.network'
              }
            }
          }
        },
        {
          name: 'test_workspace_subdomain',
          description: 'Test workspace subdomain SSL and routing',
          inputSchema: {
            type: 'object',
            properties: {
              url: {
                type: 'string',
                description: 'Workspace URL to test',
                default: 'https://app.crm.app.earthcare.network'
              }
            }
          }
        },
        {
          name: 'test_full_workflow',
          description: 'Run comprehensive end-to-end tests',
          inputSchema: {
            type: 'object',
            properties: {
              baseUrl: {
                type: 'string',
                description: 'Base URL for testing',
                default: 'https://crm.app.earthcare.network'
              },
              testCompany: {
                type: 'object',
                description: 'Test company data',
                properties: {
                  name: { type: 'string', default: 'Test Regenerative Farm' },
                  email: { type: 'string', default: 'test@regenerativefarm.com' },
                  address: { type: 'string', default: '123 Green Valley Rd, Austin, TX' }
                }
              }
            }
          }
        },
        {
          name: 'test_api_endpoints',
          description: 'Test all API endpoints for functionality',
          inputSchema: {
            type: 'object',
            properties: {
              apiBase: {
                type: 'string',
                description: 'API base URL',
                default: 'https://crm.app.earthcare.network/graphql'
              }
            }
          }
        }
      ]
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'test_crm_health':
            return await this.testCrmHealth(args.url);
          case 'test_directory_health':
            return await this.testDirectoryHealth(args.url);
          case 'test_workspace_subdomain':
            return await this.testWorkspaceSubdomain(args.url);
          case 'test_full_workflow':
            return await this.testFullWorkflow(args.baseUrl, args.testCompany);
          case 'test_api_endpoints':
            return await this.testApiEndpoints(args.apiBase);
          default:
            throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
        }
      } catch (error) {
        throw new McpError(ErrorCode.InternalError, `Tool execution failed: ${error.message}`);
      }
    });
  }

  async testCrmHealth(url = 'https://crm.app.earthcare.network') {
    const results = {
      url,
      timestamp: new Date().toISOString(),
      tests: []
    };

    try {
      // Test HTTP response
      const response = await axios.get(url, { timeout: 10000 });
      results.tests.push({
        name: 'HTTP Response',
        status: response.status === 200 ? 'PASS' : 'FAIL',
        details: `Status: ${response.status}`
      });

      // Test SSL certificate
      const sslTest = await axios.get(url, { 
        timeout: 10000,
        validateStatus: () => true,
        httpsAgent: new (await import('https')).Agent({ rejectUnauthorized: true })
      });
      results.tests.push({
        name: 'SSL Certificate',
        status: sslTest.status === 200 ? 'PASS' : 'FAIL',
        details: 'Valid SSL certificate'
      });

      // Test content
      const hasTitle = response.data.includes('Twenty') || response.data.includes('EarthCare');
      results.tests.push({
        name: 'Content Check',
        status: hasTitle ? 'PASS' : 'FAIL',
        details: hasTitle ? 'Page contains expected content' : 'Missing expected content'
      });

    } catch (error) {
      results.tests.push({
        name: 'Connection Test',
        status: 'FAIL',
        details: error.message
      });
    }

    return {
      content: [
        {
          type: 'text',
          text: `CRM Health Check Results:\n${JSON.stringify(results, null, 2)}`
        }
      ]
    };
  }

  async testDirectoryHealth(url = 'https://app.earthcare.network') {
    const results = {
      url,
      timestamp: new Date().toISOString(),
      tests: []
    };

    try {
      const response = await axios.get(url, { timeout: 10000 });
      
      results.tests.push({
        name: 'HTTP Response',
        status: response.status === 200 ? 'PASS' : 'FAIL',
        details: `Status: ${response.status}`
      });

      // Test for enhanced features
      const hasMapLibre = response.data.includes('maplibre-gl');
      const hasAddCompany = response.data.includes('Add Company') || response.data.includes('showAddCompanyModal');
      const hasViewToggle = response.data.includes('showMapView') || response.data.includes('view-toggle');

      results.tests.push({
        name: 'Map Integration',
        status: hasMapLibre ? 'PASS' : 'FAIL',
        details: hasMapLibre ? 'MapLibre GL JS detected' : 'Map functionality missing'
      });

      results.tests.push({
        name: 'Add Company Feature',
        status: hasAddCompany ? 'PASS' : 'FAIL',
        details: hasAddCompany ? 'Add company functionality detected' : 'Add company feature missing'
      });

      results.tests.push({
        name: 'View Toggle',
        status: hasViewToggle ? 'PASS' : 'FAIL',
        details: hasViewToggle ? 'Map/List view toggle detected' : 'View toggle missing'
      });

    } catch (error) {
      results.tests.push({
        name: 'Connection Test',
        status: 'FAIL',
        details: error.message
      });
    }

    return {
      content: [
        {
          type: 'text',
          text: `Directory Health Check Results:\n${JSON.stringify(results, null, 2)}`
        }
      ]
    };
  }

  async testWorkspaceSubdomain(url = 'https://app.crm.app.earthcare.network') {
    const results = {
      url,
      timestamp: new Date().toISOString(),
      tests: []
    };

    try {
      const response = await axios.get(url, { 
        timeout: 10000,
        validateStatus: () => true
      });

      results.tests.push({
        name: 'Subdomain Accessibility',
        status: response.status === 200 ? 'PASS' : 'FAIL',
        details: `Status: ${response.status}`
      });

      // Test SSL specifically
      try {
        await axios.get(url, { 
          timeout: 10000,
          httpsAgent: new (await import('https')).Agent({ rejectUnauthorized: true })
        });
        results.tests.push({
          name: 'SSL Certificate',
          status: 'PASS',
          details: 'Valid SSL certificate for workspace subdomain'
        });
      } catch (sslError) {
        results.tests.push({
          name: 'SSL Certificate',
          status: 'FAIL',
          details: `SSL error: ${sslError.message}`
        });
      }

    } catch (error) {
      results.tests.push({
        name: 'Connection Test',
        status: 'FAIL',
        details: error.message
      });
    }

    return {
      content: [
        {
          type: 'text',
          text: `Workspace Subdomain Test Results:\n${JSON.stringify(results, null, 2)}`
        }
      ]
    };
  }

  async testFullWorkflow(baseUrl = 'https://crm.app.earthcare.network', testCompany = {}) {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    const results = {
      baseUrl,
      timestamp: new Date().toISOString(),
      tests: []
    };

    try {
      // Test CRM login page
      await page.goto(baseUrl);
      await page.waitForLoadState('networkidle');
      
      const title = await page.title();
      results.tests.push({
        name: 'CRM Page Load',
        status: title.includes('Twenty') || title.includes('EarthCare') ? 'PASS' : 'FAIL',
        details: `Page title: ${title}`
      });

      // Test directory page
      await page.goto('https://app.earthcare.network');
      await page.waitForLoadState('networkidle');
      
      // Check for enhanced features
      const hasMapButton = await page.locator('[onclick*="showMapView"]').count() > 0;
      const hasAddButton = await page.locator('[onclick*="showAddCompanyModal"]').count() > 0;
      
      results.tests.push({
        name: 'Directory Enhanced Features',
        status: hasMapButton && hasAddButton ? 'PASS' : 'FAIL',
        details: `Map button: ${hasMapButton}, Add button: ${hasAddButton}`
      });

      // Test responsiveness
      await page.setViewportSize({ width: 375, height: 667 }); // Mobile
      await page.waitForTimeout(1000);
      const isMobileResponsive = await page.locator('.container').isVisible();
      
      results.tests.push({
        name: 'Mobile Responsiveness',
        status: isMobileResponsive ? 'PASS' : 'FAIL',
        details: 'Mobile layout verification'
      });

    } catch (error) {
      results.tests.push({
        name: 'Browser Test',
        status: 'FAIL',
        details: error.message
      });
    } finally {
      await browser.close();
    }

    return {
      content: [
        {
          type: 'text',
          text: `Full Workflow Test Results:\n${JSON.stringify(results, null, 2)}`
        }
      ]
    };
  }

  async testApiEndpoints(apiBase = 'https://crm.app.earthcare.network/graphql') {
    const results = {
      apiBase,
      timestamp: new Date().toISOString(),
      tests: []
    };

    try {
      // Test GraphQL endpoint
      const introspectionQuery = {
        query: `
          query IntrospectionQuery {
            __schema {
              queryType {
                name
              }
              mutationType {
                name
              }
            }
          }
        `
      };

      const response = await axios.post(apiBase, introspectionQuery, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000,
        validateStatus: () => true
      });

      results.tests.push({
        name: 'GraphQL Endpoint',
        status: response.status === 200 ? 'PASS' : 'FAIL',
        details: `Status: ${response.status}, Has schema: ${!!response.data?.data?.__schema}`
      });

      // Test health endpoint if available
      try {
        const healthResponse = await axios.get(`${apiBase.replace('/graphql', '')}/health`, {
          timeout: 5000,
          validateStatus: () => true
        });
        
        results.tests.push({
          name: 'Health Endpoint',
          status: healthResponse.status === 200 ? 'PASS' : 'FAIL',
          details: `Status: ${healthResponse.status}`
        });
      } catch (error) {
        results.tests.push({
          name: 'Health Endpoint',
          status: 'SKIP',
          details: 'Health endpoint not available'
        });
      }

    } catch (error) {
      results.tests.push({
        name: 'API Test',
        status: 'FAIL',
        details: error.message
      });
    }

    return {
      content: [
        {
          type: 'text',
          text: `API Endpoints Test Results:\n${JSON.stringify(results, null, 2)}`
        }
      ]
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('EarthCare MCP Server running on stdio');
  }
}

const server = new EarthCareTestServer();
server.run().catch(console.error);