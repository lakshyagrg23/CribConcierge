import { useState, useEffect } from 'react';

interface Property {
  id: string;
  title: string;
  price: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  area: string;
  features: string[];
  roomPhotoId?: string;
  bathroomPhotoId?: string;
  drawingRoomPhotoId?: string;
  kitchenPhotoId?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

interface UsePropertiesReturn {
  properties: Property[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useProperties = (): UsePropertiesReturn => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/getListings');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch properties: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setProperties(data.properties || []);
        console.log(`✅ Loaded ${data.count} properties from database`);
      } else {
        throw new Error('Failed to load properties');
      }
    } catch (err) {
      console.error('Error fetching properties:', err);
      setError(err instanceof Error ? err.message : 'Failed to load properties');
      
      // Fallback to mock data if API fails
      console.warn('🔄 Using fallback mock data');
      setProperties([
        {
          id: "1",
          title: "Modern Downtown Apartment",
          price: "₹450,000",
          location: "Downtown District",
          bedrooms: 2,
          bathrooms: 2,
          area: "850 sq ft",
          features: ["Pet Friendly", "Parking"],
          roomPhotoId: "689779a64956505c47af77fc",
          bathroomPhotoId: "6897880d1da03bbe8093a959",
          drawingRoomPhotoId: "68978e04c4c955245f2c033e",
          kitchenPhotoId: "689779a64956505c47af77fc"
        },
        {
          id: "2",
          title: "Suburban Family Home",
          price: "₹320,000",
          location: "Maple Heights",
          bedrooms: 3,
          bathrooms: 2,
          area: "1,200 sq ft",
          features: ["Garden", "Garage"],
          roomPhotoId: "6897880d1da03bbe8093a959",
          kitchenPhotoId: "68978e04c4c955245f2c033e"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const refetch = async () => {
    await fetchProperties();
  };

  return {
    properties,
    loading,
    error,
    refetch
  };
};
