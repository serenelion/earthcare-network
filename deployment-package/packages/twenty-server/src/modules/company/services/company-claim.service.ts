import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';

import { CompanyWorkspaceEntity } from '../company/standard-objects/company.workspace-entity';

export interface ClaimBusinessRequest {
  companyId: string;
  claimerEmail: string;
  claimerName: string;
  claimerPosition?: string;
  claimerPhone?: string;
}

export interface ClaimVerificationResult {
  success: boolean;
  message: string;
  redirectUrl?: string;
  trialUrl?: string;
  company?: any;
}

@Injectable()
export class CompanyClaimService {
  private readonly logger = new Logger(CompanyClaimService.name);

  constructor(
    @InjectRepository(CompanyWorkspaceEntity)
    private readonly companyRepository: Repository<CompanyWorkspaceEntity>,
  ) {}

  async initiateCompanyClaim(request: ClaimBusinessRequest): Promise<{
    success: boolean;
    message: string;
    tokenId?: string;
  }> {
    this.logger.log(`Initiating claim for company ${request.companyId} by ${request.claimerEmail}`);

    try {
      const company = await this.companyRepository.findOne({
        where: { id: request.companyId },
      });

      if (!company) {
        return { success: false, message: 'Company not found' };
      }

      if (company.claimed) {
        return { success: false, message: 'This company has already been claimed' };
      }

      const token = crypto.randomBytes(32).toString('hex');
      await this.sendClaimVerificationEmail(company, request, token);

      return {
        success: true,
        message: 'Verification email sent. Please check your inbox and click the verification link.',
        tokenId: crypto.randomUUID(),
      };
    } catch (error) {
      this.logger.error(`Error initiating claim:`, error);
      return { success: false, message: 'An error occurred. Please try again.' };
    }
  }

  async verifyAndCompleteClaim(token: string): Promise<ClaimVerificationResult> {
    this.logger.log(`Verifying claim token: ${token}`);

    try {
      // In production, validate token from database
      // For now, simulate successful verification
      
      // Mock company data
      const companyId = 'mock-company-id';
      const claimerEmail = 'user@example.com';
      
      const company = await this.companyRepository.findOne({
        where: { id: companyId },
      });

      if (!company || company.claimed) {
        return { success: false, message: 'Invalid token or company already claimed' };
      }

      // Mark company as claimed
      await this.companyRepository.update(companyId, {
        claimed: true,
        claimedBy: claimerEmail,
        claimedDate: new Date(),
        buildProTrialStarted: true,
        buildProTrialDate: new Date(),
      });

      // Create Build Pro trial URL
      const trialUrl = this.createSpatialNetworkTrialUrl(company.name, claimerEmail);

      return {
        success: true,
        message: `Congratulations! You have successfully claimed ${company.name}. Your Build Pro trial is ready.`,
        redirectUrl: `/companies/${company.id}/claimed`,
        trialUrl,
        company: { id: company.id, name: company.name, description: company.description },
      };
    } catch (error) {
      this.logger.error(`Error verifying claim:`, error);
      return { success: false, message: 'Verification failed. Please try again.' };
    }
  }

  async getCompanyClaimStatus(companyId: string): Promise<{
    claimed: boolean;
    claimedBy?: string;
    claimedDate?: Date;
    canClaim: boolean;
  }> {
    const company = await this.companyRepository.findOne({
      where: { id: companyId },
    });

    if (!company) {
      return { claimed: false, canClaim: false };
    }

    return {
      claimed: company.claimed,
      claimedBy: company.claimedBy || undefined,
      claimedDate: company.claimedDate || undefined,
      canClaim: !company.claimed,
    };
  }

  private async sendClaimVerificationEmail(
    company: CompanyWorkspaceEntity,
    request: ClaimBusinessRequest,
    token: string,
  ): Promise<void> {
    this.logger.log(`Sending claim verification email to ${request.claimerEmail}`);

    const verificationUrl = `${process.env.DIRECTORY_BASE_URL || 'https://app.earthcare.network'}/verify-claim?token=${token}`;
    
    // In production, integrate with email service
    const emailContent = {
      to: request.claimerEmail,
      subject: `Verify Your Claim for ${company.name} - EarthCare Network`,
      html: this.buildVerificationEmailHtml(company, request, verificationUrl),
    };

    this.logger.log(`Mock email sent: ${emailContent.subject}`);
  }

  private buildVerificationEmailHtml(
    company: CompanyWorkspaceEntity,
    request: ClaimBusinessRequest,
    verificationUrl: string,
  ): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #059669, #10b981); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">🌍 EarthCare Network</h1>
          <p style="color: #e6fffa; margin: 10px 0 0 0;">Verify Your Business Claim</p>
        </div>
        
        <div style="padding: 40px 30px;">
          <h2 style="color: #1f2937;">Hello ${request.claimerName},</h2>
          <p>Thank you for claiming <strong>${company.name}</strong> on the EarthCare Network directory!</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background: #059669; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Verify & Claim Business
            </a>
          </div>
          
          <div style="background: #f0fdf4; border-left: 4px solid #059669; padding: 20px; margin: 30px 0;">
            <h3 style="color: #059669;">🚀 What happens next?</h3>
            <ul>
              <li>Your business will be marked as verified</li>
              <li>You'll get access to manage your profile</li>
              <li>Free 1-month trial of Build Pro platform</li>
              <li>Connect with the Spatial Network community</li>
            </ul>
          </div>
          
          <p style="color: #6b7280; font-size: 14px;">This link expires in 24 hours.</p>
        </div>
      </div>
    `;
  }

  private createSpatialNetworkTrialUrl(companyName: string, email: string): string {
    const baseUrl = process.env.SPATIAL_NETWORK_API_URL || 'https://spatial.network';
    const params = new URLSearchParams({
      utm_source: 'earthcare',
      utm_medium: 'business_claim',
      utm_campaign: 'build_pro_trial',
      company: companyName,
      email: email,
    });
    
    return `${baseUrl}/build-pro/trial?${params.toString()}`;
  }

  async getClaimAnalytics(): Promise<{
    totalClaims: number;
    recentClaims: number;
    trialSignups: number;
    conversionRate: number;
  }> {
    try {
      const totalClaimed = await this.companyRepository.count({ where: { claimed: true } });
      
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentClaimed = await this.companyRepository.count({
        where: { claimed: true, claimedDate: { $gte: thirtyDaysAgo } as any },
      });

      const trialSignups = await this.companyRepository.count({
        where: { buildProTrialStarted: true },
      });

      const conversionRate = totalClaimed > 0 ? (trialSignups / totalClaimed) * 100 : 0;

      return {
        totalClaims: totalClaimed,
        recentClaims: recentClaimed,
        trialSignups,
        conversionRate: Math.round(conversionRate * 100) / 100,
      };
    } catch (error) {
      this.logger.error('Error getting claim analytics:', error);
      return { totalClaims: 0, recentClaims: 0, trialSignups: 0, conversionRate: 0 };
    }
  }
}