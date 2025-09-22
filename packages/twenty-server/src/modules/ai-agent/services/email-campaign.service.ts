import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { CompanyWorkspaceEntity } from '../../company/standard-objects/company.workspace-entity';
import { EmailCampaignWorkspaceEntity } from '../standard-objects/email-campaign.workspace-entity';
import { LeadProspectWorkspaceEntity } from '../standard-objects/lead-prospect.workspace-entity';

export interface CampaignMetrics {
  emailsSent: number;
  emailsOpened: number;
  emailsClicked: number;
  emailsReplied: number;
  companiesClaimed: number;
  trialSignups: number;
  conversionRate: number;
}

export interface EmailTemplate {
  subject: string;
  htmlBody: string;
  textBody: string;
  variables: Record<string, any>;
}

export interface CampaignResult {
  success: boolean;
  campaignId?: string;
  emailsSent: number;
  errors: string[];
}

@Injectable()
export class EmailCampaignService {
  private readonly logger = new Logger(EmailCampaignService.name);

  constructor(
    @InjectRepository(EmailCampaignWorkspaceEntity)
    private readonly emailCampaignRepository: Repository<EmailCampaignWorkspaceEntity>,
    @InjectRepository(LeadProspectWorkspaceEntity)
    private readonly leadProspectRepository: Repository<LeadProspectWorkspaceEntity>,
    @InjectRepository(CompanyWorkspaceEntity)
    private readonly companyRepository: Repository<CompanyWorkspaceEntity>,
  ) {}

  async createCampaign(
    name: string,
    description: string,
    emailTemplate: EmailTemplate,
    companyIds?: string[],
  ): Promise<EmailCampaignWorkspaceEntity> {
    this.logger.log(`Creating email campaign: ${name}`);

    const campaign = this.emailCampaignRepository.create({
      name,
      description,
      status: 'draft',
      emailTemplate: JSON.stringify(emailTemplate),
      targetCompanies: companyIds?.join(',') || '',
      emailsSent: 0,
      emailsOpened: 0,
      emailsClicked: 0,
      emailsReplied: 0,
      companiesClaimed: 0,
      trialSignups: 0,
    });

    return this.emailCampaignRepository.save(campaign);
  }

  async executeCampaign(campaignId: string): Promise<CampaignResult> {
    this.logger.log(`Executing email campaign: ${campaignId}`);

    try {
      const campaign = await this.emailCampaignRepository.findOne({
        where: { id: campaignId },
      });

      if (!campaign) {
        throw new Error(`Campaign not found: ${campaignId}`);
      }

      if (campaign.status !== 'draft') {
        throw new Error(`Campaign ${campaignId} is not in draft status`);
      }

      // Get target leads based on campaign settings
      const targetLeads = await this.getTargetLeads(campaign);

      // Parse email template
      const emailTemplate = JSON.parse(campaign.emailTemplate);

      // Send emails to all target leads
      const results = await this.sendBulkEmails(
        targetLeads,
        emailTemplate,
        campaign,
      );

      // Update campaign status and metrics
      await this.emailCampaignRepository.update(campaignId, {
        status: 'active',
        emailsSent: results.successCount,
        executedAt: new Date(),
      });

      return {
        success: true,
        campaignId,
        emailsSent: results.successCount,
        errors: results.errors,
      };
    } catch (error) {
      this.logger.error(`Error executing campaign ${campaignId}:`, error);

      // Update campaign status to failed
      await this.emailCampaignRepository.update(campaignId, {
        status: 'failed',
      });

      return {
        success: false,
        emailsSent: 0,
        errors: [error.message],
      };
    }
  }

  private async getTargetLeads(
    campaign: EmailCampaignWorkspaceEntity,
  ): Promise<LeadProspectWorkspaceEntity[]> {
    const query = this.leadProspectRepository.createQueryBuilder('lead');

    // Filter by target companies if specified
    if (campaign.targetCompanies) {
      const companyIds = campaign.targetCompanies.split(',');

      query.andWhere('lead.companyId IN (:...companyIds)', { companyIds });
    }

    // Only target leads that haven't been contacted in this campaign
    query.andWhere(
      'lead.lastContactedCampaignId != :campaignId OR lead.lastContactedCampaignId IS NULL',
      {
        campaignId: campaign.id,
      },
    );

    // Prioritize high-score leads
    query.orderBy('lead.aiScore', 'DESC');

    return query.getMany();
  }

  private async sendBulkEmails(
    leads: LeadProspectWorkspaceEntity[],
    emailTemplate: EmailTemplate,
    campaign: EmailCampaignWorkspaceEntity,
  ): Promise<{ successCount: number; errors: string[] }> {
    const results = {
      successCount: 0,
      errors: [],
    };

    for (const lead of leads) {
      try {
        // Personalize email content
        const personalizedEmail = await this.personalizeEmail(
          emailTemplate,
          lead,
        );

        // Send email (simulated - replace with real email service)
        const emailSent = await this.sendEmail(lead.email, personalizedEmail);

        if (emailSent) {
          results.successCount++;

          // Update lead with campaign tracking
          await this.leadProspectRepository.update(lead.id, {
            lastContactedAt: new Date(),
            lastContactedCampaignId: campaign.id,
            contactCount: (lead.contactCount || 0) + 1,
          });

          this.logger.log(`Email sent to ${lead.email}`);
        }
      } catch (error) {
        results.errors.push(
          `Failed to send email to ${lead.email}: ${error.message}`,
        );
        this.logger.error(`Error sending email to ${lead.email}:`, error);
      }
    }

    return results;
  }

  private async personalizeEmail(
    template: EmailTemplate,
    lead: LeadProspectWorkspaceEntity,
  ): Promise<EmailTemplate> {
    // Get company information for personalization
    const company = await this.companyRepository.findOne({
      where: { id: lead.companyId },
    });

    const variables = {
      firstName: lead.firstName,
      lastName: lead.lastName,
      fullName: `${lead.firstName} ${lead.lastName}`,
      jobTitle: lead.jobTitle,
      companyName: company?.name || 'your company',
      email: lead.email,
      claimUrl: this.generateClaimUrl(lead.companyId),
      trialUrl: this.generateTrialUrl(),
      ...template.variables,
    };

    return {
      subject: this.replaceVariables(template.subject, variables),
      htmlBody: this.replaceVariables(template.htmlBody, variables),
      textBody: this.replaceVariables(template.textBody, variables),
      variables,
    };
  }

  private replaceVariables(
    text: string,
    variables: Record<string, any>,
  ): string {
    let result = text;

    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');

      result = result.replace(regex, String(value || ''));
    }

    return result;
  }

  private async sendEmail(
    to: string,
    template: EmailTemplate,
  ): Promise<boolean> {
    // Simulate email sending
    // In production, integrate with real email service like SendGrid, Mailgun, or AWS SES
    this.logger.log(`Simulating email send to: ${to}`);
    this.logger.log(`Subject: ${template.subject}`);

    // Simulate random success/failure for realistic testing
    const success = Math.random() > 0.1; // 90% success rate

    if (!success) {
      throw new Error('Simulated email delivery failure');
    }

    return true;
  }

  private generateClaimUrl(companyId: string): string {
    // Generate URL for business claiming on the directory
    const baseUrl =
      process.env.DIRECTORY_BASE_URL || 'https://app.earthcare.network';

    return `${baseUrl}/claim/${companyId}`;
  }

  private generateTrialUrl(): string {
    // Generate URL for Build Pro trial signup
    const baseUrl =
      process.env.SPATIAL_NETWORK_BASE_URL || 'https://spatial.network';

    return `${baseUrl}/build-pro/trial?utm_source=earthcare&utm_medium=email&utm_campaign=business_claim`;
  }

  async updateCampaignMetrics(
    campaignId: string,
    type: 'opened' | 'clicked' | 'replied' | 'claimed' | 'trial_signup',
  ): Promise<void> {
    const campaign = await this.emailCampaignRepository.findOne({
      where: { id: campaignId },
    });

    if (!campaign) {
      this.logger.warn(`Campaign not found for metrics update: ${campaignId}`);

      return;
    }

    const updates: Partial<EmailCampaignWorkspaceEntity> = {};

    switch (type) {
      case 'opened':
        updates.emailsOpened = (campaign.emailsOpened || 0) + 1;
        break;
      case 'clicked':
        updates.emailsClicked = (campaign.emailsClicked || 0) + 1;
        break;
      case 'replied':
        updates.emailsReplied = (campaign.emailsReplied || 0) + 1;
        break;
      case 'claimed':
        updates.companiesClaimed = (campaign.companiesClaimed || 0) + 1;
        break;
      case 'trial_signup':
        updates.trialSignups = (campaign.trialSignups || 0) + 1;
        break;
    }

    await this.emailCampaignRepository.update(campaignId, updates);
    this.logger.log(`Updated campaign ${campaignId} metrics: ${type}`);
  }

  async getCampaignMetrics(campaignId: string): Promise<CampaignMetrics> {
    const campaign = await this.emailCampaignRepository.findOne({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new Error(`Campaign not found: ${campaignId}`);
    }

    const conversionRate =
      campaign.emailsSent > 0
        ? ((campaign.companiesClaimed || 0) / campaign.emailsSent) * 100
        : 0;

    return {
      emailsSent: campaign.emailsSent || 0,
      emailsOpened: campaign.emailsOpened || 0,
      emailsClicked: campaign.emailsClicked || 0,
      emailsReplied: campaign.emailsReplied || 0,
      companiesClaimed: campaign.companiesClaimed || 0,
      trialSignups: campaign.trialSignups || 0,
      conversionRate: Math.round(conversionRate * 100) / 100,
    };
  }

  async getCampaigns(status?: string): Promise<EmailCampaignWorkspaceEntity[]> {
    const query = this.emailCampaignRepository.createQueryBuilder('campaign');

    if (status) {
      query.where('campaign.status = :status', { status });
    }

    query.orderBy('campaign.createdAt', 'DESC');

    return query.getMany();
  }

  async pauseCampaign(campaignId: string): Promise<void> {
    await this.emailCampaignRepository.update(campaignId, {
      status: 'paused',
    });
    this.logger.log(`Campaign paused: ${campaignId}`);
  }

  async resumeCampaign(campaignId: string): Promise<void> {
    await this.emailCampaignRepository.update(campaignId, {
      status: 'active',
    });
    this.logger.log(`Campaign resumed: ${campaignId}`);
  }

  async getDefaultBusinessClaimTemplate(): Promise<EmailTemplate> {
    return {
      subject: 'Claim Your {{companyName}} Profile on EarthCare Network',
      htmlBody: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #059669, #10b981); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">🌍 EarthCare Network</h1>
            <p style="color: #e6fffa; margin: 5px 0 0 0;">Building a Sustainable Future Together</p>
          </div>
          
          <div style="padding: 30px 20px;">
            <p>Hi {{firstName}},</p>
            
            <p>We've listed <strong>{{companyName}}</strong> in our EarthCare Network directory of sustainability-focused businesses, and we'd love for you to claim and manage your profile!</p>
            
            <div style="background: #f0fdf4; border-left: 4px solid #059669; padding: 20px; margin: 20px 0;">
              <h3 style="color: #059669; margin: 0 0 10px 0;">Why claim your profile?</h3>
              <ul style="margin: 0; padding-left: 20px;">
                <li>Showcase your sustainability initiatives</li>
                <li>Connect with eco-conscious customers</li>
                <li>Join a growing network of green businesses</li>
                <li>Get access to EarthCare Pledge certification</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{claimUrl}}" style="background: #059669; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                Claim Your Profile
              </a>
            </div>
            
            <p>After claiming your profile, you'll also get a special invitation to try our <strong>Build Pro</strong> platform with a free 1-month trial - perfect for managing your sustainability projects and impact tracking.</p>
            
            <p>Questions? Just reply to this email.</p>
            
            <p>Best regards,<br>The EarthCare Network Team</p>
          </div>
          
          <div style="background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280;">
            <p>EarthCare Network | Building a sustainable future, one business at a time</p>
            <p>If you don't want to receive these emails, <a href="#">unsubscribe here</a></p>
          </div>
        </div>
      `,
      textBody: `
Hi {{firstName}},

We've listed {{companyName}} in our EarthCare Network directory of sustainability-focused businesses, and we'd love for you to claim and manage your profile!

Why claim your profile?
• Showcase your sustainability initiatives
• Connect with eco-conscious customers  
• Join a growing network of green businesses
• Get access to EarthCare Pledge certification

Claim your profile here: {{claimUrl}}

After claiming your profile, you'll also get a special invitation to try our Build Pro platform with a free 1-month trial - perfect for managing your sustainability projects and impact tracking.

Questions? Just reply to this email.

Best regards,
The EarthCare Network Team

---
EarthCare Network | Building a sustainable future, one business at a time
      `,
      variables: {},
    };
  }
}
