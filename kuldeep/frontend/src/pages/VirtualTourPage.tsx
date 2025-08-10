import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { VirtualTourViewer } from '@/components/tour';
import { useTourProperties } from '@/hooks/tour';
import { TourProperty } from '@/types/tour';
import { Loader2, ArrowLeft, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const VirtualTourPage: React.FC = () => {
  const { propertyId } = useParams<{ propertyId: string }>();
  const navigate = useNavigate();
  const { getProperty, loading: propertiesLoading } = useTourProperties();
  const [property, setProperty] = useState<TourProperty | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProperty = async () => {
      if (!propertyId) {
        setError('Property ID is required');
        setLoading(false);
        return;
      }

      if (propertiesLoading) {
        return; // Wait for properties to load
      }

      try {
        const foundProperty = getProperty(propertyId);
        if (!foundProperty) {
          setError('Property not found');
        } else {
          setProperty(foundProperty);
        }
      } catch (err) {
        console.error('Error loading property:', err);
        setError('Failed to load property details');
      } finally {
        setLoading(false);
      }
    };

    loadProperty();
  }, [propertyId, getProperty, propertiesLoading]);

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Loading Virtual Tour</h2>
          <p className="text-gray-300">Preparing your immersive experience...</p>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-400" />
          <h2 className="text-xl font-semibold mb-2">Tour Unavailable</h2>
          <p className="text-gray-300 mb-6">{error || 'Property not found'}</p>
          <Button 
            onClick={handleBackToDashboard}
            variant="outline"
            className="text-white border-white hover:bg-white hover:text-black"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Navigation Bar */}
      <div className="absolute top-0 left-0 right-0 z-40 bg-gradient-to-b from-black/80 to-transparent p-4">
        <div className="flex items-center justify-between">
          <Button
            onClick={handleBackToDashboard}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="text-white text-center">
            <h1 className="text-lg font-semibold">{property.propertyName}</h1>
            <p className="text-sm opacity-75">{property.propertyAddress}</p>
          </div>

          <div className="w-32" /> {/* Spacer for center alignment */}
        </div>
      </div>

      {/* VR Tour Viewer */}
      <div className="w-full h-screen">
        <VirtualTourViewer property={property} />
      </div>
    </div>
  );
};

export default VirtualTourPage;
