import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';

import { CompanyWorkspaceEntity } from '../standard-objects/company.workspace-entity';

export interface BuildProTrialRequest {
  companyId: string;
  userEmail: string;
  userName: string;
  companyName: string;
  source: 'earthcare_claim' | 'earthcare_directory' | 'manual';
  sustainabilityScore?: number;
  pledgeSigned?: boolean;
}

export interface TrialCreationResult {
  success: boolean;
  trialId?: string;
  trialUrl?: string;
  expiresAt?: Date;
  message: string;
}

export interface SpatialNetworkApiResponse {
  success: boolean;
  data?: {
    trial_id: string;
    trial_url: string;
    expires_at: string;
    user_id: string;
    workspace_id: string;
  };
  error?: string;
}

@Injectable()
export class SpatialNetworkIntegrationService {
  private readonly logger = new Logger(SpatialNetworkIntegrationService.name);
  private readonly apiBaseUrl: string;
  private readonly apiKey: string;

  constructor(
    @InjectRepository(CompanyWorkspaceEntity)
    private readonly companyRepository: Repository<CompanyWorkspaceEntity>,
  ) {
    this.apiBaseUrl = process.env.SPATIAL_NETWORK_API_URL || 'https://api.thespatialnetwork.net';
    this.apiKey = process.env.SPATIAL_NETWORK_API_KEY || '';
  }

  async createBuildProTrial(request: BuildProTrialRequest): Promise<TrialCreationResult> {
    this.logger.log(`Creating Build Pro trial for company ${request.companyId} - ${request.companyName}`);

    try {
      // Check if company already has an active trial
      const company = await this.companyRepository.findOne({
        where: { id: request.companyId },
      });

      if (!company) {
        return {
          success: false,
          message: 'Company not found',
        };
      }

      if (company.buildProTrialStarted && this.isTrialStillActive(company.buildProTrialDate)) {
        return {
          success: false,
          message: 'Company already has an active Build Pro trial',
        };
      }

      // Create trial via Spatial Network API
      const spatialResponse = await this.callSpatialNetworkAPI(request);

      if (!spatialResponse.success) {
        return {
          success: false,
          message: spatialResponse.error || 'Failed to create trial with Spatial Network',
        };
      }

      // Update company record with trial information
      await this.companyRepository.update(request.companyId, {
        buildProTrialStarted: true,
        buildProTrialDate: new Date(),
      });

      this.logger.log(`Successfully created Build Pro trial for ${request.companyName}`);

      return {
        success: true,
        trialId: spatialResponse.data?.trial_id,
        trialUrl: spatialResponse.data?.trial_url,
        expiresAt: spatialResponse.data?.expires_at ? new Date(spatialResponse.data.expires_at) : undefined,
        message: 'Build Pro trial created successfully',
      };
    } catch (error) {
      this.logger.error(`Error creating Build Pro trial for company ${request.companyId}:`, error);
      return {
        success: false,
        message: 'An error occurred while creating your trial. Please try again or contact support.',
      };
    }
  }

  async getBuildProTrialStatus(companyId: string): Promise<{
    hasActiveTrial: boolean;
    trialStartDate?: Date;
    trialExpiresAt?: Date;
    trialUrl?: string;
  }> {
    const company = await this.companyRepository.findOne({
      where: { id: companyId },
    });

    if (!company || !company.buildProTrialStarted) {
      return { hasActiveTrial: false };
    }

    const isActive = this.isTrialStillActive(company.buildProTrialDate);
    const expiresAt = company.buildProTrialDate 
      ? new Date(company.buildProTrialDate.getTime() + 30 * 24 * 60 * 60 * 1000) 
      : undefined;

    return {
      hasActiveTrial: isActive,
      trialStartDate: company.buildProTrialDate || undefined,
      trialExpiresAt: expiresAt,
      trialUrl: isActive ? this.generateTrialUrl(company.name, companyId) : undefined,
    };
  }

  private async callSpatialNetworkAPI(request: BuildProTrialRequest): Promise<SpatialNetworkApiResponse> {
    try {
      // In production, make actual HTTP request to Spatial Network API
      // For now, simulate the API call
      
      const payload = {
        email: request.userEmail,
        name: request.userName,
        company_name: request.companyName,
        company_id: request.companyId,
        plan: 'build_pro',
        trial_duration_days: 30,
        source: request.source,
        metadata: {
          earthcare_integration: true,
          sustainability_score: request.sustainabilityScore || 0,
          pledge_signed: request.pledgeSigned || false,
          utm_source: 'earthcare',
          utm_medium: 'business_claim',
          utm_campaign: 'build_pro_trial',
        },
      };

      // Simulate API call with mock response
      const mockResponse: SpatialNetworkApiResponse = {
        success: true,
        data: {
          trial_id: crypto.randomUUID(),
          trial_url: `${this.apiBaseUrl}/build-pro/trial?token=${crypto.randomBytes(16).toString('hex')}`,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          user_id: crypto.randomUUID(),
          workspace_id: crypto.randomUUID(),
        },
      };

      this.logger.log(`Mock Spatial Network API call for ${request.companyName}: ${JSON.stringify(payload)}`);
      return mockResponse;

      // Production implementation would look like:
      /*
      const response = await fetch(`${this.apiBaseUrl}/v1/trials/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Source': 'earthcare-network',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      return data;
      */
    } catch (error) {
      this.logger.error('Error calling Spatial Network API:', error);
      return {
        success: false,
        error: 'Failed to communicate with Spatial Network API',
      };
    }
  }

  private isTrialStillActive(trialStartDate: Date | null): boolean {
    if (!trialStartDate) return false;
    
    const now = new Date();
    const thirtyDaysLater = new Date(trialStartDate.getTime() + 30 * 24 * 60 * 60 * 1000);
    return now < thirtyDaysLater;
  }

  private generateTrialUrl(companyName: string, companyId: string): string {
    const params = new URLSearchParams({
      utm_source: 'earthcare',
      utm_medium: 'directory',
      utm_campaign: 'build_pro_trial',
      company: companyName,
      company_id: companyId,
    });
    
    return `${this.apiBaseUrl}/build-pro/trial?${params.toString()}`;
  }

  async getTrialAnalytics(): Promise<{
    totalTrialsCreated: number;
    activeTrials: number;
    expiredTrials: number;
    conversionRate: number; // trials to full subscriptions
  }> {
    try {
      const totalTrials = await this.companyRepository.count({
        where: { buildProTrialStarted: true },
      });

      // Count active trials (started within last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const activeTrials = await this.companyRepository.count({
        where: {
          buildProTrialStarted: true,
          buildProTrialDate: { $gte: thirtyDaysAgo } as any,
        },
      });

      const expiredTrials = totalTrials - activeTrials;

      // Mock conversion rate calculation
      // In production, this would integrate with Spatial Network API to get actual conversion data
      const mockConversionRate = totalTrials > 0 ? (totalTrials * 0.15) : 0; // Assume 15% conversion rate

      return {
        totalTrialsCreated: totalTrials,
        activeTrials,
        expiredTrials,
        conversionRate: Math.round(mockConversionRate * 100) / 100,
      };
    } catch (error) {
      this.logger.error('Error getting trial analytics:', error);
      return {
        totalTrialsCreated: 0,
        activeTrials: 0,
        expiredTrials: 0,
        conversionRate: 0,
      };
    }
  }

  // Helper method for webhook handling from Spatial Network
  async handleSpatialNetworkWebhook(eventType: string, payload: any): Promise<{ success: boolean; message: string }> {
    this.logger.log(`Received Spatial Network webhook: ${eventType}`);

    try {
      switch (eventType) {
        case 'trial.expired':
          // Handle trial expiration
          if (payload.company_id) {
            await this.companyRepository.update(payload.company_id, {
              // Could add a field for trial status if needed
            });
          }
          break;

        case 'trial.converted':
          // Handle trial to paid conversion
          if (payload.company_id) {
            await this.companyRepository.update(payload.company_id, {
              // Could add fields for subscription status
            });
          }
          break;

        case 'user.activated':
          // Handle user activation in Build Pro
          break;

        default:
          this.logger.warn(`Unhandled webhook event type: ${eventType}`);
      }

      return { success: true, message: 'Webhook processed successfully' };
    } catch (error) {
      this.logger.error(`Error processing webhook ${eventType}:`, error);
      return { success: false, message: 'Failed to process webhook' };
    }
  }
}