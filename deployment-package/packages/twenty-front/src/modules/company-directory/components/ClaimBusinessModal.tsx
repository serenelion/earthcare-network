import React, { useState } from 'react';
import styled from '@emotion/styled';
import { Modal } from '@/ui/layout/modal/components/Modal';
import { Button } from 'twenty-ui/input';
import { H2Title } from 'twenty-ui/display';

const StyledModalContent = styled.div`
  padding: ${({ theme }) => theme.spacing(6)};
  max-width: 500px;
  width: 100%;
`;

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
`;

const StyledInput = styled.input`
  padding: ${({ theme }) => theme.spacing(2)};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  font-size: ${({ theme }) => theme.font.size.md};
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.color.blue};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.color.blue}20;
  }
`;

const StyledTextarea = styled.textarea`
  padding: ${({ theme }) => theme.spacing(2)};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  font-size: ${({ theme }) => theme.font.size.md};
  min-height: 100px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.color.blue};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.color.blue}20;
  }
`;

const StyledLabel = styled.label`
  font-weight: ${({ theme }) => theme.font.weight.medium};
  margin-bottom: ${({ theme }) => theme.spacing(1)};
  display: block;
`;

const StyledButtonContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: flex-end;
  margin-top: ${({ theme }) => theme.spacing(4)};
`;

const StyledSuccessMessage = styled.div`
  background: #f0fdf4;
  border: 1px solid #059669;
  border-radius: ${({ theme }) => theme.border.radius.md};
  padding: ${({ theme }) => theme.spacing(4)};
  text-align: center;
`;

const StyledErrorMessage = styled.div`
  background: #fef2f2;
  border: 1px solid #dc2626;
  border-radius: ${({ theme }) => theme.border.radius.md};
  padding: ${({ theme }) => theme.spacing(4)};
  text-align: center;
  color: #dc2626;
`;

interface ClaimBusinessModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
  companyName: string;
}

interface ClaimFormData {
  claimerEmail: string;
  claimerName: string;
  claimerPosition: string;
  claimerPhone: string;
  message: string;
}

export const ClaimBusinessModal: React.FC<ClaimBusinessModalProps> = ({
  isOpen,
  onClose,
  companyId,
  companyName,
}) => {
  const [formData, setFormData] = useState<ClaimFormData>({
    claimerEmail: '',
    claimerName: '',
    claimerPosition: '',
    claimerPhone: '',
    message: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (field: keyof ClaimFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.claimerEmail || !formData.claimerName) {
      setErrorMessage('Email and name are required fields.');
      setSubmitStatus('error');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // In production, this would make an API call to the GraphQL endpoint
      const response = await fetch('/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            mutation InitiateCompanyClaim($request: ClaimBusinessRequestInput!) {
              initiateCompanyClaim(request: $request) {
                success
                message
                tokenId
              }
            }
          `,
          variables: {
            request: {
              companyId,
              ...formData,
            },
          },
        }),
      });

      const data = await response.json();
      
      if (data.data?.initiateCompanyClaim?.success) {
        setSubmitStatus('success');
      } else {
        setErrorMessage(data.data?.initiateCompanyClaim?.message || 'Failed to submit claim request');
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Error submitting claim:', error);
      setErrorMessage('An error occurred while submitting your claim. Please try again.');
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      claimerEmail: '',
      claimerName: '',
      claimerPosition: '',
      claimerPhone: '',
      message: '',
    });
    setSubmitStatus('idle');
    setErrorMessage('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <StyledModalContent>
        <H2Title title={`Claim ${companyName}`} />
        
        {submitStatus === 'success' ? (
          <StyledSuccessMessage>
            <h3>🎉 Claim Request Submitted!</h3>
            <p>
              We've sent a verification email to <strong>{formData.claimerEmail}</strong>.
              Please check your inbox and click the verification link to complete your claim.
            </p>
            <p style={{ marginTop: '16px', fontSize: '14px', color: '#059669' }}>
              After verification, you'll receive access to a free 1-month Build Pro trial!
            </p>
            <Button onClick={handleClose} style={{ marginTop: '16px' }}>
              Got it!
            </Button>
          </StyledSuccessMessage>
        ) : submitStatus === 'error' ? (
          <StyledErrorMessage>
            <h3>❌ Error</h3>
            <p>{errorMessage}</p>
            <Button onClick={() => setSubmitStatus('idle')} style={{ marginTop: '16px' }}>
              Try Again
            </Button>
          </StyledErrorMessage>
        ) : (
          <StyledForm onSubmit={handleSubmit}>
            <div>
              <StyledLabel htmlFor="claimerEmail">Email Address *</StyledLabel>
              <StyledInput
                id="claimerEmail"
                type="email"
                required
                placeholder="your.email@company.com"
                value={formData.claimerEmail}
                onChange={(e) => handleInputChange('claimerEmail', e.target.value)}
              />
            </div>

            <div>
              <StyledLabel htmlFor="claimerName">Full Name *</StyledLabel>
              <StyledInput
                id="claimerName"
                type="text"
                required
                placeholder="John Doe"
                value={formData.claimerName}
                onChange={(e) => handleInputChange('claimerName', e.target.value)}
              />
            </div>

            <div>
              <StyledLabel htmlFor="claimerPosition">Position/Role</StyledLabel>
              <StyledInput
                id="claimerPosition"
                type="text"
                placeholder="CEO, Owner, Manager, etc."
                value={formData.claimerPosition}
                onChange={(e) => handleInputChange('claimerPosition', e.target.value)}
              />
            </div>

            <div>
              <StyledLabel htmlFor="claimerPhone">Phone Number</StyledLabel>
              <StyledInput
                id="claimerPhone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={formData.claimerPhone}
                onChange={(e) => handleInputChange('claimerPhone', e.target.value)}
              />
            </div>

            <div>
              <StyledLabel htmlFor="message">Additional Message (Optional)</StyledLabel>
              <StyledTextarea
                id="message"
                placeholder="Tell us more about your role at this company or any additional verification information..."
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
              />
            </div>

            <StyledButtonContainer>
              <Button
                variant="secondary"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Claim Request'}
              </Button>
            </StyledButtonContainer>
          </StyledForm>
        )}
      </StyledModalContent>
    </Modal>
  );
};