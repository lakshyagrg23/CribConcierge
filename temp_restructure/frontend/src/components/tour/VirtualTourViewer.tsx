import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import 'aframe';
import { TourProperty, TourRoom, TourState } from '@/types/tour';
import TourNavigationControls from './TourNavigationControls';
import SceneTransition from './SceneTransition';
import { VoiceAssistant } from '../voice/VoiceAssistantClean';
import { VoiceCommand } from '@/types/voice';

interface VirtualTourViewerProps {
  property: TourProperty;
}

const VirtualTourViewer: React.FC<VirtualTourViewerProps> = ({ property }) => {
  const sceneRef = useRef<HTMLElement>(null);
  const [tourState, setTourState] = useState<TourState>({
    currentRoom: 'bedroom',
    isLoading: false,
    error: undefined
  });

  // Define room configuration with mapping
  const rooms: TourRoom[] = useMemo(() => [
    {
      id: 'kitchen',
      name: 'Kitchen',
      label: 'Kitchen',
      emoji: '🍳',
      color: '#ff6347',
      hoverColor: '#ffa07a',
      imageId: property.kitchenPhotoId,
      available: !!property.kitchenPhotoId
    },
    {
      id: 'living-room',
      name: 'Living Room',
      label: 'Living Room',
      emoji: '🛋',
      color: '#2596ff',
      hoverColor: '#72b7ff',
      imageId: property.drawingRoomPhotoId,
      available: !!property.drawingRoomPhotoId
    },
    {
      id: 'bedroom',
      name: 'Bedroom',
      label: 'Bedroom',
      emoji: '🛏',
      color: '#32cd32',
      hoverColor: '#6af06a',
      imageId: property.roomPhotoId,
      available: !!property.roomPhotoId
    },
    {
      id: 'bathroom',
      name: 'Bathroom',
      label: 'Bathroom',
      emoji: '🛁',
      color: '#fcc537',
      hoverColor: '#ffe873',
      imageId: property.bathroomPhotoId,
      available: !!property.bathroomPhotoId
    }
  ], [property.kitchenPhotoId, property.drawingRoomPhotoId, property.roomPhotoId, property.bathroomPhotoId]);

  // Find the first available room for initial display
  const getInitialRoom = () => {
    const availableRoom = rooms.find(room => room.available);
    return availableRoom ? availableRoom.id : 'bedroom';
  };

  const [currentRoom, setCurrentRoom] = useState(getInitialRoom());

  // Get image URL for a given image ID
  const getImageUrl = useCallback((imageId: string): string => {
    const url = `/api/images/${imageId}`;
    console.log('Generated image URL:', url);
    return url;
  }, []);

  // Simple room switching without complex panoramic detection
  const handleRoomSwitch = useCallback(async (roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    if (!room || !room.available || !room.imageId) {
      console.warn(`Room ${roomId} is not available or has no image`);
      return;
    }

    setTourState(prev => ({
      ...prev,
      isLoading: true,
      error: undefined
    }));

    try {
      const imageUrl = getImageUrl(room.imageId);
      console.log('Switching to room:', roomId, 'Image URL:', imageUrl);
      
      // Test if the image loads first
      const testImage = new Image();
      testImage.onload = () => {
        console.log('✅ Image loaded successfully, applying to sky');
        const sky = document.getElementById('room-sky');
        if (sky) {
          sky.setAttribute('src', imageUrl);
          setCurrentRoom(roomId);
          
          setTimeout(() => {
            setTourState(prev => ({
              ...prev,
              isLoading: false
            }));
          }, 500);
        }
      };
      
      testImage.onerror = (error) => {
        console.error('❌ Image failed to load:', imageUrl, error);
        setTourState(prev => ({
          ...prev,
          isLoading: false,
          error: `Failed to load ${room.name} image`
        }));
      };
      
      testImage.src = imageUrl;
      
    } catch (error) {
      console.error('Error switching room:', error);
      setTourState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to load room image'
      }));
    }
  }, [rooms, getImageUrl]);

  // Voice command handler
  const handleVoiceCommand = useCallback((command: VoiceCommand) => {
    console.log('Voice command received:', command);
    
    switch (command.action) {
      case 'navigate':
        if (command.target) {
          // Map voice command targets to room IDs
          const roomMapping: Record<string, string> = {
            'kitchen': 'kitchen',
            'bedroom': 'bedroom',
            'bathroom': 'bathroom',
            'living_room': 'living-room',
            'living room': 'living-room'
          };
          
          const roomId = roomMapping[command.target];
          if (roomId) {
            handleRoomSwitch(roomId);
          }
        }
        break;
        
      case 'describe':
        // Voice assistant will handle the description response
        console.log(`Describing current room: ${currentRoom}`);
        break;
        
      case 'exit':
        // Navigate back to dashboard
        if (window.history.length > 1) {
          window.history.back();
        } else {
          window.location.href = '/dashboard';
        }
        break;
        
      default:
        console.log('Unhandled voice command:', command);
    }
  }, [currentRoom, handleRoomSwitch]);

  // Initialize the scene with the first available room
  useEffect(() => {
    const initializeScene = () => {
      const initialRoom = rooms.find(r => r.id === currentRoom);
      console.log('Initializing VR scene with room:', currentRoom, initialRoom);
      
      if (initialRoom && initialRoom.available && initialRoom.imageId) {
        // Use handleRoomSwitch for initialization to ensure consistency
        setTimeout(() => {
          handleRoomSwitch(currentRoom);
        }, 1000); // Give A-Frame time to initialize
      } else {
        console.warn('No available room found for initialization');
      }
    };

    // Wait for A-Frame and DOM to be ready
    if (typeof window !== 'undefined') {
      setTimeout(initializeScene, 500);
    }
  }, [currentRoom, rooms, handleRoomSwitch]);

  const getCurrentRoomName = () => {
    const room = rooms.find(r => r.id === currentRoom);
    return room ? room.name : 'Room';
  };

  return (
    <div className="relative w-full h-full">
      {/* Scene Transition Overlay */}
      <SceneTransition 
        isLoading={tourState.isLoading}
        currentRoom={getCurrentRoomName()}
        error={tourState.error}
      />

      {/* A-Frame Scene */}
      <a-scene 
        ref={sceneRef}
        embedded 
        style={{ width: '100%', height: '100%' }}
        vr-mode-ui="enabled: false"
        device-orientation-permission-ui="enabled: false"
        background="color: #000000"
      >
        {/* 360° Sky - will display regular images as textured sphere */}
        <a-sky 
          id="room-sky" 
          src="" 
          rotation="0 0 0"
          radius="50"
        />

        {/* Camera and cursor for interaction */}
        <a-entity id="cameraRig" position="0 1.6 0">
          <a-camera wasd-controls="acceleration: 50" look-controls="enabled: true">
            <a-cursor
              fuse="true"
              fuse-timeout="1000"
              color="#FFF"
              geometry="primitive: ring; radiusInner: 0.01; radiusOuter: 0.02"
              position="0 0 -1"
            />
          </a-camera>
        </a-entity>

        {/* Ambient lighting for better visibility */}
        <a-light type="ambient" color="#ffffff" intensity="0.5" />

        {/* Tour Navigation Controls */}
        <TourNavigationControls
          rooms={rooms}
          onRoomSwitch={handleRoomSwitch}
          propertyId={property.id}
        />
      </a-scene>

      {/* Property Info Overlay */}
      <div className="absolute top-4 left-4 bg-black/70 text-white p-4 rounded-lg backdrop-blur-sm">
        <h2 className="text-xl font-bold">{property.propertyName}</h2>
        <p className="text-sm opacity-90">{property.propertyAddress}</p>
        <p className="text-sm mt-1 text-blue-300">Currently viewing: {getCurrentRoomName()}</p>
        <p className="text-xs mt-2 text-yellow-300">
          📷 Images will be displayed as 360° textures (works best with panoramic photos)
        </p>
      </div>

      {/* Voice Assistant */}
      <div className="absolute top-4 right-4 max-w-sm">
        <VoiceAssistant
          onCommand={handleVoiceCommand}
          currentRoom={currentRoom}
          propertyId={property.id}
          isInTour={true}
        />
      </div>

      {/* Instructions Overlay */}
      <div className="absolute bottom-4 left-4 bg-black/70 text-white p-3 rounded-lg backdrop-blur-sm text-sm">
        <p>🖱️ Click and drag to look around</p>
        <p>⌨️ Use WASD keys to move</p>
        <p>👆 Click buttons to switch rooms</p>
        <p>🎤 Use voice commands: "go to kitchen", "describe this room"</p>
      </div>

      {/* Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-4 right-4 bg-black/70 text-white p-2 rounded text-xs">
          <p>Room: {currentRoom}</p>
          <p>Available rooms: {rooms.filter(r => r.available).length}</p>
          <p>Loading: {tourState.isLoading ? 'Yes' : 'No'}</p>
        </div>
      )}
    </div>
  );
};

export default VirtualTourViewer;
