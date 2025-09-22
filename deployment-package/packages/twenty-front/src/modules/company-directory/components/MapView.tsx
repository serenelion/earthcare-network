import React, { useRef, useEffect, useState, useCallback } from 'react';
import styled from '@emotion/styled';
import maplibregl from 'maplibre-gl';
import type { CompanyCardProps } from './CompanyCard';
import { IconMapPin, IconBuilding, IconX, IconExternalLink } from 'twenty-ui/display';

export interface MapViewProps {
  companies: CompanyCardProps['company'][];
  center?: [number, number];
  zoom?: number;
  selectedCompanyId?: string;
  onCompanySelect?: (companyId: string) => void;
  onCompanyClaim?: (companyId: string) => void;
  showClusters?: boolean;
  className?: string;
}

const StyledContainer = styled.div`
  position: relative;
  width: 100%;
  height: 600px;
  border-radius: ${({ theme }) => theme.border.radius.lg};
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.border.color.medium};
`;

const StyledMap = styled.div`
  width: 100%;
  height: 100%;
  
  .maplibregl-popup-content {
    padding: 0;
    border-radius: ${({ theme }) => theme.border.radius.md};
    box-shadow: ${({ theme }) => theme.boxShadow.strong};
    max-width: 300px;
  }

  .maplibregl-popup-close-button {
    display: none;
  }

  .maplibregl-popup-anchor-bottom .maplibregl-popup-tip {
    border-top-color: ${({ theme }) => theme.background.primary};
  }

  .maplibregl-popup-anchor-top .maplibregl-popup-tip {
    border-bottom-color: ${({ theme }) => theme.background.primary};
  }

  .maplibregl-popup-anchor-left .maplibregl-popup-tip {
    border-right-color: ${({ theme }) => theme.background.primary};
  }

  .maplibregl-popup-anchor-right .maplibregl-popup-tip {
    border-left-color: ${({ theme }) => theme.background.primary};
  }
`;

const StyledLoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
`;

const StyledSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid ${({ theme }) => theme.border.color.light};
  border-top-color: ${({ theme }) => theme.color.blue};
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const StyledMapControls = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 5;
`;

const StyledControlButton = styled.button`
  width: 40px;
  height: 40px;
  background: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: ${({ theme }) => theme.boxShadow.light};
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.background.secondary};
  }
`;

export const MapView: React.FC<MapViewProps> = ({
  companies,
  center = [-98.5795, 39.8283], // USA center
  zoom = 4,
  selectedCompanyId,
  onCompanySelect,
  onCompanyClaim,
  showClusters = true,
  className,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markers = useRef<maplibregl.Marker[]>([]);
  const popups = useRef<maplibregl.Popup[]>([]);
  const [loading, setLoading] = useState(true);

  // Clean up function
  const cleanup = useCallback(() => {
    // Remove existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Remove existing popups
    popups.current.forEach(popup => popup.remove());
    popups.current = [];
  }, []);

  // Create popup content for a company
  const createPopupContent = useCallback((company: CompanyCardProps['company']) => {
    const container = document.createElement('div');
    
    // Format address
    const formatAddress = () => {
      if (!company.address) return null;
      const parts = [
        company.address.addressCity,
        company.address.addressState,
        company.address.addressCountry
      ].filter(Boolean);
      return parts.join(', ');
    };

    container.innerHTML = `
      <div class="popup-content" data-company-id="${company.id}">
        <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 12px;">
          <h3 style="font-size: 16px; font-weight: 600; margin: 0; color: #1f2937; line-height: 1.3;">
            ${company.name}
          </h3>
          <button class="popup-close" style="background: none; border: none; cursor: pointer; padding: 4px; border-radius: 4px; color: #9ca3af;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div style="display: flex; gap: 4px; margin-bottom: 8px; flex-wrap: wrap;">
          ${company.verified ? '<span style="font-size: 12px; padding: 2px 6px; border-radius: 4px; background: #dcfce7; color: #166534;">✓ Verified</span>' : ''}
          ${company.featured ? '<span style="font-size: 12px; padding: 2px 6px; border-radius: 4px; background: #f3e8ff; color: #7c3aed;">Featured</span>' : ''}
          ${company.pledgeSigned ? '<span style="font-size: 12px; padding: 2px 6px; border-radius: 4px; background: #dbeafe; color: #1e40af;">Pledge Signer</span>' : ''}
        </div>
        
        ${company.description ? `
          <p style="font-size: 14px; color: #6b7280; margin: 0 0 12px 0; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">
            ${company.description}
          </p>
        ` : ''}
        
        ${formatAddress() ? `
          <p style="font-size: 13px; color: #9ca3af; margin: 0 0 12px 0;">
            📍 ${formatAddress()}
          </p>
        ` : ''}
        
        <div style="display: flex; gap: 8px;">
          ${!company.claimed ? `
            <button class="claim-btn" style="padding: 8px 12px; border-radius: 4px; border: 1px solid #3b82f6; font-size: 12px; font-weight: 500; cursor: pointer; flex: 1; background: #3b82f6; color: white;">
              Claim Company
            </button>
          ` : `
            <span style="font-size: 12px; padding: 8px 12px; color: #16a34a;">✓ Claimed</span>
          `}
          <button class="view-btn" style="padding: 8px 12px; border-radius: 4px; border: 1px solid #d1d5db; font-size: 12px; font-weight: 500; cursor: pointer; flex: 1; background: transparent; color: #374151;">
            View Details
          </button>
        </div>
      </div>
    `;

    // Add event listeners
    const closeBtn = container.querySelector('.popup-close');
    const claimBtn = container.querySelector('.claim-btn');
    const viewBtn = container.querySelector('.view-btn');

    closeBtn?.addEventListener('click', () => {
      popups.current.forEach(popup => popup.remove());
    });

    claimBtn?.addEventListener('click', () => {
      onCompanyClaim?.(company.id);
    });

    viewBtn?.addEventListener('click', () => {
      onCompanySelect?.(company.id);
    });

    return container;
  }, [onCompanySelect, onCompanyClaim]);

  // Add markers for companies
  const addMarkers = useCallback(() => {
    cleanup();

    companies.forEach(company => {
      if (!company.latitude || !company.longitude) return;

      // Create marker element
      const markerElement = document.createElement('div');
      markerElement.className = 'custom-marker';
      markerElement.innerHTML = `
        <div style="
          width: 32px;
          height: 32px;
          background: ${company.verified ? '#10b981' : company.claimed ? '#3b82f6' : '#6b7280'};
          border: 2px solid white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          transition: transform 0.2s ease;
        ">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            <polyline points="3.27,6.96 12,12.01 20.73,6.96"></polyline>
            <line x1="12" y1="22.08" x2="12" y2="12"></line>
          </svg>
        </div>
      `;

      // Add hover effect
      markerElement.addEventListener('mouseenter', () => {
        markerElement.style.transform = 'scale(1.1)';
      });

      markerElement.addEventListener('mouseleave', () => {
        markerElement.style.transform = 'scale(1)';
      });

      // Create marker
      const marker = new maplibregl.Marker(markerElement)
        .setLngLat([company.longitude, company.latitude])
        .addTo(map.current!);

      // Create popup
      const popup = new maplibregl.Popup({
        offset: 25,
        closeButton: false,
        closeOnClick: false,
      }).setDOMContent(createPopupContent(company));

      // Add click listener to show popup
      markerElement.addEventListener('click', () => {
        // Close other popups
        popups.current.forEach(p => p.remove());
        
        // Show this popup
        popup.setLngLat([company.longitude!, company.latitude!]).addTo(map.current!);
        popups.current = [popup];
      });

      markers.current.push(marker);
    });
  }, [companies, cleanup, createPopupContent]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
      center: center,
      zoom: zoom,
    });

    map.current.addControl(new maplibregl.NavigationControl(), 'top-left');

    map.current.on('load', () => {
      setLoading(false);
      addMarkers();
    });

    return () => {
      cleanup();
      map.current?.remove();
    };
  }, [center, zoom, addMarkers, cleanup]);

  // Update markers when companies change
  useEffect(() => {
    if (map.current?.isStyleLoaded()) {
      addMarkers();
    }
  }, [companies, addMarkers]);

  // Handle selected company
  useEffect(() => {
    if (selectedCompanyId && map.current) {
      const company = companies.find(c => c.id === selectedCompanyId);
      if (company && company.latitude && company.longitude) {
        map.current.flyTo({
          center: [company.longitude, company.latitude],
          zoom: 12,
          duration: 1000,
        });
      }
    }
  }, [selectedCompanyId, companies]);

  const handleZoomIn = () => {
    map.current?.zoomIn();
  };

  const handleZoomOut = () => {
    map.current?.zoomOut();
  };

  const handleResetView = () => {
    map.current?.flyTo({
      center: center,
      zoom: zoom,
      duration: 1000,
    });
  };

  return (
    <StyledContainer className={className}>
      <StyledMap ref={mapContainer} />
      
      {loading && (
        <StyledLoadingOverlay>
          <StyledSpinner />
        </StyledLoadingOverlay>
      )}

      <StyledMapControls>
        <StyledControlButton onClick={handleZoomIn} title="Zoom in">
          <span style={{ fontSize: '18px', fontWeight: 'bold' }}>+</span>
        </StyledControlButton>
        <StyledControlButton onClick={handleZoomOut} title="Zoom out">
          <span style={{ fontSize: '18px', fontWeight: 'bold' }}>−</span>
        </StyledControlButton>
        <StyledControlButton onClick={handleResetView} title="Reset view">
          <IconMapPin size={16} />
        </StyledControlButton>
      </StyledMapControls>
    </StyledContainer>
  );
};