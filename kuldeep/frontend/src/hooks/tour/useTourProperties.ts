import { useState, useEffect } from 'react';
import { TourProperty } from '@/types/tour';

interface UseTourPropertiesReturn {
  properties: Record<string, TourProperty>;
  loading: boolean;
  error: string | null;
  getProperty: (id: string) => TourProperty | null;
  updateProperty: (id: string, property: TourProperty) => void;
}

export const useTourProperties = (): UseTourPropertiesReturn => {
  const [properties, setProperties] = useState<Record<string, TourProperty>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/getListings');
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.success && data.properties) {
            // Transform database properties to TourProperty format
            const tourProperties: Record<string, TourProperty> = {};
            
            data.properties.forEach((prop: any) => {
              tourProperties[prop.id] = {
                id: prop.id,
                propertyName: prop.title,
                propertyAddress: prop.location,
                roomPhotoId: prop.roomPhotoId,
                bathroomPhotoId: prop.bathroomPhotoId,
                drawingRoomPhotoId: prop.drawingRoomPhotoId,
                kitchenPhotoId: prop.kitchenPhotoId
              };
            });

            setProperties(tourProperties);
            console.log(`✅ Loaded ${Object.keys(tourProperties).length} properties for VR tours`);
          } else {
            throw new Error('Invalid response format');
          }
        } else {
          throw new Error(`API request failed: ${response.status}`);
        }
      } catch (err) {
        console.warn('⚠️ Failed to fetch from database, using fallback data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load properties');
        
        // Fallback to mock data for VR tours
        const mockProperties: Record<string, TourProperty> = {
          "1": {
            id: "1",
            propertyName: "Modern Downtown Apartment",
            propertyAddress: "Downtown District",
            roomPhotoId: "689779a64956505c47af77fc",
            bathroomPhotoId: "6897880d1da03bbe8093a959",
            drawingRoomPhotoId: "68978e04c4c955245f2c033e",
            kitchenPhotoId: "689779a64956505c47af77fc"
          },
          "2": {
            id: "2",
            propertyName: "Suburban Family Home",
            propertyAddress: "Maple Heights",
            roomPhotoId: "6897880d1da03bbe8093a959",
            kitchenPhotoId: "68978e04c4c955245f2c033e"
          }
        };

        setProperties(mockProperties);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  const getProperty = (id: string): TourProperty | null => {
    return properties[id] || null;
  };

  const updateProperty = (id: string, property: TourProperty) => {
    setProperties(prev => ({
      ...prev,
      [id]: property
    }));
  };

  return {
    properties,
    loading,
    error,
    getProperty,
    updateProperty
  };
};
