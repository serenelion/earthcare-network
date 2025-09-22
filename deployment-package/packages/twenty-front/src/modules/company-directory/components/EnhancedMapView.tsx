import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import styled from '@emotion/styled';
import maplibregl from 'maplibre-gl';
import type { CompanyCardProps } from './CompanyCard';
import { 
  IconMapPin, 
  IconBuilding, 
  IconX, 
  IconExternalLink,
  IconFilter,
  IconCurrentLocation,
  IconZoomIn,
  IconZoomOut,
  IconLayers
} from 'twenty-ui/display';

export interface EnhancedMapViewProps {
  companies: CompanyCardProps['company'][];
  center?: [number, number];
  zoom?: number;
  selectedCompanyId?: string;
  onCompanySelect?: (companyId: string) => void;
  onCompanyClaim?: (companyId: string) => void;
  onAreaChange?: (bounds: maplibregl.LngLatBounds) => void;
  showClusters?: boolean;
  clustering?: ClusteringConfig;
  layers?: MapLayerConfig;
  searchQuery?: string;
  filters?: SustainabilityFilters;
  className?: string;
}

interface ClusteringConfig {
  enabled: boolean;
  maxZoom: number;
  radius: number;
  maxClusterSize: number;
}

interface MapLayerConfig {
  businesses: boolean;
  sustainabilityHeatmap: boolean;
  renewableInfrastructure: boolean;
  organicFarms: boolean;
  transportHubs: boolean;
}

interface SustainabilityFilters {
  categories: string[];
  certifications: string[];
  impactLevel: 'all' | 'high' | 'medium' | 'low';
  verified: boolean;
  distance: number; // km
}

const StyledContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100vh;
  border-radius: ${({ theme }) => theme.border.radius.lg};
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  
  @media (max-width: 768px) {
    height: 60vh;
    border-radius: 0;
    border: none;
  }
`;

const StyledMap = styled.div`
  width: 100%;
  height: 100%;
  
  .maplibregl-popup-content {
    padding: 0;
    border-radius: ${({ theme }) => theme.border.radius.md};
    box-shadow: ${({ theme }) => theme.boxShadow.strong};
    max-width: 320px;
    background: ${({ theme }) => theme.background.primary};
  }

  .maplibregl-popup-close-button {
    display: none;
  }

  .maplibregl-ctrl-group {
    border-radius: ${({ theme }) => theme.border.radius.md};
    box-shadow: ${({ theme }) => theme.boxShadow.light};
  }

  .maplibregl-ctrl button {
    background: ${({ theme }) => theme.background.primary};
    border: 1px solid ${({ theme }) => theme.border.color.medium};
  }

  // Custom cluster styles
  .cluster-marker {
    border: 3px solid white;
    border-radius: 50%;
    cursor: pointer;
    transition: transform 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  }

  .cluster-marker:hover {
    transform: scale(1.1);
  }

  .cluster-small {
    width: 40px;
    height: 40px;
    background: ${({ theme }) => theme.color.blue};
    color: white;
    font-size: 12px;
  }

  .cluster-medium {
    width: 50px;
    height: 50px;
    background: ${({ theme }) => theme.color.orange};
    color: white;
    font-size: 14px;
  }

  .cluster-large {
    width: 60px;
    height: 60px;
    background: ${({ theme }) => theme.color.red};
    color: white;
    font-size: 16px;
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
  
  @media (max-width: 768px) {
    top: 12px;
    right: 12px;
    gap: 6px;
  }
`;

const StyledControlButton = styled.button<{ $active?: boolean }>`
  width: 44px;
  height: 44px;
  background: ${({ theme, $active }) => 
    $active ? theme.color.blue : theme.background.primary};
  color: ${({ theme, $active }) => 
    $active ? 'white' : theme.font.color.primary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: ${({ theme }) => theme.boxShadow.light};
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme, $active }) => 
      $active ? theme.color.blue70 : theme.background.secondary};
    transform: translateY(-1px);
    box-shadow: ${({ theme }) => theme.boxShadow.strong};
  }

  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
  }
`;

const StyledLayerPanel = styled.div<{ $open: boolean }>`
  position: absolute;
  top: 16px;
  right: 72px;
  background: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  box-shadow: ${({ theme }) => theme.boxShadow.strong};
  padding: 16px;
  min-width: 220px;
  z-index: 6;
  opacity: ${({ $open }) => $open ? 1 : 0};
  visibility: ${({ $open }) => $open ? 'visible' : 'hidden'};
  transform: ${({ $open }) => $open ? 'translateX(0)' : 'translateX(20px)'};
  transition: all 0.2s ease;

  @media (max-width: 768px) {
    right: 58px;
    min-width: 200px;
    padding: 12px;
  }
`;

const StyledLayerItem = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  cursor: pointer;
  font-size: ${({ theme }) => theme.font.size.sm};
  
  input[type=\"checkbox\"] {
    margin: 0;
  }

  &:hover {
    color: ${({ theme }) => theme.color.blue};
  }
`;

const StyledBusinessCounter = styled.div`
  position: absolute;
  bottom: 16px;
  left: 16px;
  background: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  padding: 8px 12px;
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  box-shadow: ${({ theme }) => theme.boxShadow.light};
  z-index: 5;

  @media (max-width: 768px) {
    bottom: 12px;
    left: 12px;
    font-size: ${({ theme }) => theme.font.size.xs};
    padding: 6px 10px;
  }
`;

const StyledLoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  backdrop-filter: blur(2px);
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

export const EnhancedMapView: React.FC<EnhancedMapViewProps> = ({
  companies,
  center = [-98.5795, 39.8283],
  zoom = 4,
  selectedCompanyId,
  onCompanySelect,
  onCompanyClaim,
  onAreaChange,
  showClusters = true,
  clustering = { enabled: true, maxZoom: 14, radius: 50, maxClusterSize: 100 },
  layers = { 
    businesses: true, 
    sustainabilityHeatmap: false, 
    renewableInfrastructure: false,
    organicFarms: false,
    transportHubs: false
  },
  searchQuery = '',
  filters,
  className,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markers = useRef<maplibregl.Marker[]>([]);
  const clusters = useRef<any[]>([]);
  const popups = useRef<maplibregl.Popup[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [layerPanelOpen, setLayerPanelOpen] = useState(false);
  const [activeLayers, setActiveLayers] = useState(layers);
  const [currentBounds, setCurrentBounds] = useState<maplibregl.LngLatBounds | null>(null);

  // Filter companies based on current filters and search
  const filteredCompanies = useMemo(() => {
    let filtered = companies;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(company =>
        company.name.toLowerCase().includes(query) ||
        company.description?.toLowerCase().includes(query) ||
        company.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Sustainability filters
    if (filters) {
      if (filters.categories.length > 0 && !filters.categories.includes('all')) {
        filtered = filtered.filter(company => 
          filters.categories.includes(company.category || '')
        );
      }

      if (filters.verified) {
        filtered = filtered.filter(company => company.verified);
      }

      // Add more filter logic as needed
    }

    return filtered;
  }, [companies, searchQuery, filters]);

  // Clean up function
  const cleanup = useCallback(() => {
    markers.current.forEach(marker => marker.remove());
    markers.current = [];
    
    clusters.current.forEach(cluster => cluster.remove());
    clusters.current = [];
    
    popups.current.forEach(popup => popup.remove());
    popups.current = [];
  }, []);

  // Create enhanced popup content with sustainability focus
  const createEnhancedPopupContent = useCallback((company: CompanyCardProps['company']) => {
    const container = document.createElement('div');
    
    const formatAddress = () => {
      if (!company.address) return null;
      const parts = [
        company.address.addressCity,
        company.address.addressState,
        company.address.addressCountry
      ].filter(Boolean);
      return parts.join(', ');
    };

    const getSustainabilityBadges = () => {
      const badges = [];
      if (company.verified) badges.push('✓ Verified');
      if (company.featured) badges.push('⭐ Featured');
      if (company.pledgeSigned) badges.push('🌱 Climate Pledge');
      // Add more sustainability badges
      return badges;
    };

    container.innerHTML = `
      <div class=\"enhanced-popup-content\" data-company-id=\"${company.id}\">
        <div style=\"position: relative; padding: 16px;\">
          <button class=\"popup-close\" style=\"position: absolute; top: 8px; right: 8px; background: none; border: none; cursor: pointer; padding: 4px; border-radius: 4px; color: #9ca3af;\">
            <svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\">
              <line x1=\"18\" y1=\"6\" x2=\"6\" y2=\"18\"></line>
              <line x1=\"6\" y1=\"6\" x2=\"18\" y2=\"18\"></line>
            </svg>
          </button>
          
          <div style=\"margin-bottom: 12px;\">
            <h3 style=\"font-size: 16px; font-weight: 600; margin: 0 20px 8px 0; color: #1f2937; line-height: 1.3;\">
              ${company.name}
            </h3>
            <div style=\"display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: 8px;\">
              ${getSustainabilityBadges().map(badge => 
                `<span style=\"font-size: 11px; padding: 2px 6px; border-radius: 12px; background: #dcfce7; color: #166534;\">${badge}</span>`
              ).join('')}
            </div>
          </div>
          
          ${company.description ? `
            <p style=\"font-size: 14px; color: #6b7280; margin: 0 0 12px 0; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;\">
              ${company.description}
            </p>
          ` : ''}
          
          ${formatAddress() ? `
            <p style=\"font-size: 13px; color: #9ca3af; margin: 0 0 12px 0; display: flex; align-items: center; gap: 4px;\">
              📍 ${formatAddress()}
            </p>
          ` : ''}
          
          <!-- Sustainability Score -->
          <div style=\"margin-bottom: 12px;\">
            <div style=\"display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;\">
              <span style=\"font-size: 12px; color: #6b7280;\">Sustainability Score</span>
              <span style=\"font-size: 12px; font-weight: 600; color: #059669;\">85/100</span>
            </div>
            <div style=\"width: 100%; height: 4px; background: #e5e7eb; border-radius: 2px; overflow: hidden;\">
              <div style=\"width: 85%; height: 100%; background: linear-gradient(90deg, #10b981, #059669);\"></div>
            </div>
          </div>
          
          <div style=\"display: flex; gap: 8px;\">
            ${!company.claimed ? `
              <button class=\"claim-btn\" style=\"padding: 8px 12px; border-radius: 6px; border: none; font-size: 12px; font-weight: 500; cursor: pointer; flex: 1; background: #059669; color: white; transition: background 0.2s;\">
                Claim Business
              </button>
            ` : `
              <span style=\"font-size: 12px; padding: 8px 12px; color: #059669; background: #dcfce7; border-radius: 6px; flex: 1; text-align: center;\">✓ Claimed</span>
            `}
            <button class=\"view-btn\" style=\"padding: 8px 12px; border-radius: 6px; border: 1px solid #d1d5db; font-size: 12px; font-weight: 500; cursor: pointer; flex: 1; background: transparent; color: #374151; transition: all 0.2s;\">
              View Details
            </button>
          </div>
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

  // Create sustainability-focused marker
  const createSustainabilityMarker = useCallback((company: CompanyCardProps['company']) => {
    const markerElement = document.createElement('div');
    markerElement.className = 'sustainability-marker';
    
    // Determine marker color based on sustainability criteria
    const getMarkerColor = () => {
      if (company.verified && company.pledgeSigned) return '#059669'; // Green for highly sustainable
      if (company.verified) return '#3b82f6'; // Blue for verified
      if (company.claimed) return '#f59e0b'; // Orange for claimed
      return '#6b7280'; // Gray for unclaimed
    };

    // Get appropriate icon based on category
    const getMarkerIcon = () => {
      const iconMap: Record<string, string> = {
        'renewable-energy': '⚡',
        'organic-food': '🌱',
        'permaculture': '🌿',
        'eco-building': '🏗️',
        'water-systems': '💧',
        'zero-waste': '♻️',
        'community-gardens': '🌻',
        'alt-education': '📚',
      };
      return iconMap[company.category || ''] || '🏢';
    };

    markerElement.innerHTML = `
      <div style=\"
        width: 36px;
        height: 36px;
        background: ${getMarkerColor()};
        border: 3px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(0,0,0,0.25);
        transition: all 0.2s ease;
        font-size: 16px;
      \">
        ${getMarkerIcon()}
      </div>
    `;

    // Add interaction effects
    markerElement.addEventListener('mouseenter', () => {
      markerElement.style.transform = 'scale(1.15)';
      markerElement.style.zIndex = '1000';
    });

    markerElement.addEventListener('mouseleave', () => {
      markerElement.style.transform = 'scale(1)';
      markerElement.style.zIndex = '1';
    });

    return markerElement;
  }, []);

  // Enhanced marker management with clustering
  const addEnhancedMarkers = useCallback(() => {
    cleanup();

    if (!map.current) return;

    // Simple clustering logic (in production, use a proper clustering library)
    const addedMarkers = new Set();
    
    filteredCompanies.forEach(company => {
      if (!company.latitude || !company.longitude) return;
      
      const key = `${company.latitude.toFixed(4)}_${company.longitude.toFixed(4)}`;
      if (addedMarkers.has(key) && showClusters) return;
      addedMarkers.add(key);

      const markerElement = createSustainabilityMarker(company);
      
      const marker = new maplibregl.Marker(markerElement)
        .setLngLat([company.longitude, company.latitude])
        .addTo(map.current!);

      // Create enhanced popup
      const popup = new maplibregl.Popup({
        offset: 25,
        closeButton: false,
        closeOnClick: false,
        className: 'sustainability-popup'
      }).setDOMContent(createEnhancedPopupContent(company));

      // Add click listener
      markerElement.addEventListener('click', (e) => {
        e.stopPropagation();
        
        // Close other popups
        popups.current.forEach(p => p.remove());
        
        // Show this popup
        popup.setLngLat([company.longitude!, company.latitude!]).addTo(map.current!);
        popups.current = [popup];
      });

      markers.current.push(marker);
    });
  }, [filteredCompanies, showClusters, cleanup, createSustainabilityMarker, createEnhancedPopupContent]);

  // Initialize enhanced map
  useEffect(() => {
    if (!mapContainer.current) return;

    // Custom map style focused on sustainability
    const sustainabilityMapStyle = {
      version: 8,
      sources: {
        'carto-light': {
          type: 'raster',
          tiles: [
            'https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png'
          ],
          tileSize: 256
        }
      },
      layers: [
        {
          id: 'background',
          type: 'background',
          paint: {
            'background-color': '#f8fafc'
          }
        },
        {
          id: 'carto-light',
          type: 'raster',
          source: 'carto-light'
        }
      ]
    };

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: sustainabilityMapStyle,
      center: center,
      zoom: zoom,
      pitch: 0,
      bearing: 0
    });

    // Add controls
    map.current.addControl(new maplibregl.NavigationControl(), 'top-left');
    map.current.addControl(new maplibregl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true,
      showUserHeading: true
    }), 'top-left');

    // Event listeners
    map.current.on('load', () => {
      setLoading(false);
      addEnhancedMarkers();
    });

    map.current.on('moveend', () => {
      const bounds = map.current!.getBounds();
      setCurrentBounds(bounds);
      onAreaChange?.(bounds);
    });

    // Close popups on map click
    map.current.on('click', () => {
      popups.current.forEach(popup => popup.remove());
    });

    return () => {
      cleanup();
      map.current?.remove();
    };
  }, [center, zoom, addEnhancedMarkers, cleanup, onAreaChange]);

  // Update markers when companies or filters change
  useEffect(() => {
    if (map.current?.isStyleLoaded()) {
      addEnhancedMarkers();
    }
  }, [filteredCompanies, addEnhancedMarkers]);

  // Handle selected company
  useEffect(() => {
    if (selectedCompanyId && map.current) {
      const company = filteredCompanies.find(c => c.id === selectedCompanyId);
      if (company && company.latitude && company.longitude) {
        map.current.flyTo({
          center: [company.longitude, company.latitude],
          zoom: Math.max(map.current.getZoom(), 12),
          duration: 1500,
          easing: (t) => t * (2 - t) // easeOutQuad
        });
      }
    }
  }, [selectedCompanyId, filteredCompanies]);

  // Control handlers
  const handleZoomIn = () => map.current?.zoomIn();
  const handleZoomOut = () => map.current?.zoomOut();
  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        map.current?.flyTo({
          center: [position.coords.longitude, position.coords.latitude],
          zoom: 12,
          duration: 1500
        });
      });
    }
  };

  const handleLayerToggle = (layerKey: keyof MapLayerConfig) => {
    setActiveLayers(prev => ({
      ...prev,
      [layerKey]: !prev[layerKey]
    }));
  };

  const visibleBusinessCount = filteredCompanies.filter(c => 
    c.latitude && c.longitude
  ).length;

  return (
    <StyledContainer className={className}>
      <StyledMap ref={mapContainer} />
      
      {loading && (
        <StyledLoadingOverlay>
          <StyledSpinner />
        </StyledLoadingOverlay>
      )}

      <StyledMapControls>
        <StyledControlButton 
          onClick={() => setLayerPanelOpen(!layerPanelOpen)}
          $active={layerPanelOpen}
          title=\"Map layers\"
        >
          <IconLayers size={20} />
        </StyledControlButton>
        <StyledControlButton onClick={handleZoomIn} title=\"Zoom in\">
          <IconZoomIn size={20} />
        </StyledControlButton>
        <StyledControlButton onClick={handleZoomOut} title=\"Zoom out\">
          <IconZoomOut size={20} />
        </StyledControlButton>
        <StyledControlButton onClick={handleCurrentLocation} title=\"Current location\">
          <IconCurrentLocation size={20} />
        </StyledControlButton>
      </StyledMapControls>

      <StyledLayerPanel $open={layerPanelOpen}>
        <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
          Map Layers
        </h4>
        <StyledLayerItem>
          <input 
            type=\"checkbox\" 
            checked={activeLayers.businesses}
            onChange={() => handleLayerToggle('businesses')}
          />
          <span>Businesses</span>
        </StyledLayerItem>
        <StyledLayerItem>
          <input 
            type=\"checkbox\" 
            checked={activeLayers.sustainabilityHeatmap}
            onChange={() => handleLayerToggle('sustainabilityHeatmap')}
          />
          <span>Sustainability Heatmap</span>
        </StyledLayerItem>
        <StyledLayerItem>
          <input 
            type=\"checkbox\" 
            checked={activeLayers.renewableInfrastructure}
            onChange={() => handleLayerToggle('renewableInfrastructure')}
          />
          <span>Renewable Energy</span>
        </StyledLayerItem>
        <StyledLayerItem>
          <input 
            type=\"checkbox\" 
            checked={activeLayers.organicFarms}
            onChange={() => handleLayerToggle('organicFarms')}
          />
          <span>Organic Farms</span>
        </StyledLayerItem>
        <StyledLayerItem>
          <input 
            type=\"checkbox\" 
            checked={activeLayers.transportHubs}
            onChange={() => handleLayerToggle('transportHubs')}
          />
          <span>Transport Hubs</span>
        </StyledLayerItem>
      </StyledLayerPanel>

      <StyledBusinessCounter>
        📍 {visibleBusinessCount} sustainable businesses
      </StyledBusinessCounter>
    </StyledContainer>
  );
};"