import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Bed, Bath, Square, Heart } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface PropertyCardProps {
  id: string;
  title: string;
  price: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  area: string;
  image: string;
  features?: string[];
  // Optional image IDs for VR tour
  roomPhotoId?: string;
  bathroomPhotoId?: string;
  drawingRoomPhotoId?: string;
  kitchenPhotoId?: string;
}

const PropertyCard = ({ 
  id, 
  title, 
  price, 
  location, 
  bedrooms, 
  bathrooms, 
  area, 
  image, 
  features = [],
  roomPhotoId,
  bathroomPhotoId,
  drawingRoomPhotoId,
  kitchenPhotoId
}: PropertyCardProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const navigate = useNavigate();

  // Check if any panoramic images are available for VR tour
  const hasVRTour = !!(roomPhotoId || bathroomPhotoId || drawingRoomPhotoId || kitchenPhotoId);

  const handleVRTour = () => {
    console.log("🎮 VR Tour button clicked!");
    console.log("📄 Property ID:", id);
    console.log("🏠 Property Title:", title);
    console.log("🖼️ Has VR Tour:", hasVRTour);
    console.log("📸 Room Photo ID:", roomPhotoId);
    console.log("🚿 Bathroom Photo ID:", bathroomPhotoId);
    console.log("🛋️ Drawing Room Photo ID:", drawingRoomPhotoId);
    console.log("🍳 Kitchen Photo ID:", kitchenPhotoId);
    
    if (hasVRTour) {
      console.log("🚀 Navigating to:", `/tour/${id}`);
      navigate(`/tour/${id}`);
    } else {
      console.log("❌ No VR tour available");
    }
  };

  return (
    <div className="group relative luxury-card overflow-hidden">
      <div className="relative overflow-hidden rounded-t-lg">
        <img 
          src={image} 
          alt={title}
          className="w-full h-56 object-cover group-hover:scale-110 transition-all duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-dark/20 to-transparent" />
        <button 
          onClick={() => setIsLiked(!isLiked)}
          className="absolute top-4 right-4 p-2.5 rounded-full bg-marble/90 backdrop-blur-sm hover:bg-marble transition-all duration-300 shadow-brick"
        >
          <Heart className={`h-4 w-4 transition-all duration-300 ${isLiked ? 'fill-accent text-accent scale-110' : 'text-stone-dark'}`} />
        </button>
        <div className="absolute bottom-4 left-4">
          <Badge variant="secondary" className="bg-gradient-primary text-primary-foreground border-0 shadow-luxury">
            {features[0] || 'Premium'}
          </Badge>
        </div>
        <div className="absolute top-4 left-4">
          <div className="w-3 h-3 bg-gradient-accent rounded-full shadow-luxury animate-pulse" />
        </div>
      </div>
      
      <div className="relative p-6 bg-gradient-to-br from-card to-surface">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors duration-300">{title}</h3>
          <span className="text-xl font-bold premium-gradient">{price}</span>
        </div>
        
        <div className="flex items-center text-muted-foreground mb-5">
          <MapPin className="h-4 w-4 mr-2 text-primary" />
          <span className="text-sm font-medium">{location}</span>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="flex items-center justify-center p-2 bg-surface/50 rounded-lg border border-border/50">
            <Bed className="h-4 w-4 mr-1.5 text-primary" />
            <span className="text-sm font-medium text-foreground">{bedrooms}</span>
          </div>
          <div className="flex items-center justify-center p-2 bg-surface/50 rounded-lg border border-border/50">
            <Bath className="h-4 w-4 mr-1.5 text-primary" />
            <span className="text-sm font-medium text-foreground">{bathrooms}</span>
          </div>
          <div className="flex items-center justify-center p-2 bg-surface/50 rounded-lg border border-border/50">
            <Square className="h-4 w-4 mr-1.5 text-primary" />
            <span className="text-xs font-medium text-foreground">{area}</span>
          </div>
        </div>
        
        <div className="flex gap-3">
          <Button variant="hero" className="flex-1 shadow-brick" size="sm">
            View Details
          </Button>
          <Button 
            variant={hasVRTour ? "chat" : "outline"} 
            size="sm" 
            className="shadow-elegant-sm"
            onClick={handleVRTour}
            disabled={!hasVRTour}
          >
            3D Tour
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;