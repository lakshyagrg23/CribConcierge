import React from 'react';
import { useNavigate } from 'react-router-dom';
import EnhancedHotspot from './EnhancedHotspot';
import { TourRoom } from '@/types/tour';

interface TourNavigationControlsProps {
  rooms: TourRoom[];
  onRoomSwitch: (roomId: string) => void;
  propertyId: string;
}

const TourNavigationControls: React.FC<TourNavigationControlsProps> = ({
  rooms,
  onRoomSwitch,
  propertyId
}) => {
  const navigate = useNavigate();

  const handleExitTour = () => {
    navigate('/dashboard');
  };

  const handleRoomClick = (room: TourRoom) => {
    if (room.available && room.imageId) {
      onRoomSwitch(room.id);
    }
  };

  return (
    <a-entity id="menu" position="0 2 -.75" rotation="0 5 0" scale="1.3 1.3 1.3">
      {/* Room Navigation Buttons */}
      {rooms.map((room, index) => {
        const basePosition = -2.1 + (index * 1.4); // Spacing between buttons
        const isDisabled = !room.available || !room.imageId;
        
        return (
          <EnhancedHotspot
            key={room.id}
            position={`${basePosition} 0 0`}
            width="1.6"
            height="0.6"
            color={isDisabled ? "#666666" : room.color}
            opacity={isDisabled ? "0.5" : "0.85"}
            text={`${room.emoji} ${room.label}`}
            textColor={isDisabled ? "#999" : "#fff"}
            hoverColor={isDisabled ? "#666666" : room.hoverColor}
            onClick={() => handleRoomClick(room)}
            className={isDisabled ? "disabled" : "clickable"}
          />
        );
      })}

      {/* Exit Button */}
      <EnhancedHotspot
        position="0 1.5 -2"
        width="2"
        height="0.6"
        color="#ff3b30"
        opacity="0.85"
        text="Exit Tour"
        textColor="#fff"
        hoverColor="#ff6f61"
        onClick={handleExitTour}
        className="clickable"
      />
    </a-entity>
  );
};

export default TourNavigationControls;
