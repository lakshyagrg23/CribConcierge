import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import 'aframe';
import { TourProperty, TourRoom, TourState } from '@/types/tour';
import TourNavigationControls from './TourNavigationControls';
import SceneTransition from './SceneTransition';

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

  // Check if image is panoramic (2:1 aspect ratio) or regular
  const checkImageType = useCallback(async (imageId: string): Promise<{ isPanoramic: boolean; width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const aspectRatio = img.width / img.height;
        const isPanoramic = aspectRatio >= 1.8; // Close to 2:1 ratio
        console.log(`Image ${imageId}: ${img.width}x${img.height}, aspect ratio: ${aspectRatio.toFixed(2)}, isPanoramic: ${isPanoramic}`);
        resolve({ isPanoramic, width: img.width, height: img.height });
      };
      img.onerror = () => {
        console.error(`Failed to load image for type checking: ${imageId}`);
        resolve({ isPanoramic: false, width: 0, height: 0 });
      };
      img.src = getImageUrl(imageId);
    });
  }, [getImageUrl]);

  // Handle room switching
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
      // Check if image is panoramic
      const imageType = await checkImageType(room.imageId);
      const imageUrl = getImageUrl(room.imageId);
      
      if (imageType.isPanoramic) {
        // Use sky for panoramic images
        const sky = document.getElementById('room-sky');
        if (sky) {
          console.log('✅ Setting panoramic image to sky:', imageUrl);
          sky.setAttribute('src', imageUrl);
          // Hide any non-panoramic display
          const imageDisplay = document.getElementById('image-display');
          if (imageDisplay) {
            imageDisplay.setAttribute('visible', 'false');
          }
        }
      } else {
        // Use a plane for regular images
        console.log('📷 Displaying regular image on plane:', imageUrl);
        let imageDisplay = document.getElementById('image-display');
        if (!imageDisplay) {
          // Create image display plane if it doesn't exist
          const scene = document.querySelector('a-scene');
          if (scene) {
            imageDisplay = document.createElement('a-plane');
            imageDisplay.id = 'image-display';
            imageDisplay.setAttribute('position', '0 2 -5');
            imageDisplay.setAttribute('width', '8');
            imageDisplay.setAttribute('height', '6');
            imageDisplay.setAttribute('material', 'side: double');
            scene.appendChild(imageDisplay);
          }
        }
        
        if (imageDisplay) {
          imageDisplay.setAttribute('src', imageUrl);
          imageDisplay.setAttribute('visible', 'true');
          // Clear sky for regular images
          const sky = document.getElementById('room-sky');
          if (sky) {
            sky.setAttribute('src', '');
          }
        }
      }
      
      setCurrentRoom(roomId);
      
      // Simulate loading time for smooth transition
      setTimeout(() => {
        setTourState(prev => ({
          ...prev,
          isLoading: false
        }));
      }, 1000);
      
    } catch (error) {
      console.error('Error switching room:', error);
      setTourState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to load room image'
      }));
    }
  }, [rooms, checkImageType, getImageUrl]);

  // Initialize the scene
  useEffect(() => {
    const initializeScene = async () => {
      // Set initial room if available
      const initialRoom = rooms.find(r => r.id === currentRoom);
      console.log('Initializing with room:', currentRoom, 'Room data:', initialRoom);
      if (initialRoom && initialRoom.available && initialRoom.imageId) {
        try {
          const imageType = await checkImageType(initialRoom.imageId);
          const imageUrl = getImageUrl(initialRoom.imageId);
          
          if (imageType.isPanoramic) {
            const sky = document.getElementById('room-sky');
            console.log('Sky element found:', !!sky);
            if (sky) {
              console.log('✅ Setting initial panoramic image:', imageUrl);
              sky.setAttribute('src', imageUrl);
            }
          } else {
            console.log('📷 Initial image is regular, will display on plane');
            // For regular images, we'll handle this in the room switch logic
            handleRoomSwitch(currentRoom);
          }
        } catch (error) {
          console.error('Error initializing scene:', error);
        }
      }
    };

    // Wait for A-Frame to be ready
    if (typeof window !== 'undefined') {
      if (document.readyState === 'complete') {
        setTimeout(initializeScene, 500); // Give A-Frame time to initialize
      } else {
        window.addEventListener('load', () => {
          setTimeout(initializeScene, 500);
        });
      }
    }
  }, [currentRoom, rooms, checkImageType, getImageUrl, handleRoomSwitch]);

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
      >
        {/* 360° Sky */}
        <a-sky 
          id="room-sky" 
          src="" 
          rotation="0 -90 0"
        />

        {/* Camera and cursor for interaction */}
        <a-entity id="cameraRig" position="0 1.6 0">
          <a-camera wasd-controls="acceleration: 50">
            <a-cursor
              fuse="true"
              fuse-timeout="1000"
              color="#FFF"
              geometry="primitive: ring; radiusInner: 0.01; radiusOuter: 0.02"
              position="0 0 -1"
            />
          </a-camera>
        </a-entity>

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
          📷 Note: Regular photos will be displayed on a plane. For full 360° experience, upload panoramic images.
        </p>
      </div>

      {/* Instructions Overlay */}
      <div className="absolute bottom-4 left-4 bg-black/70 text-white p-3 rounded-lg backdrop-blur-sm text-sm">
        <p>🖱️ Click and drag to look around</p>
        <p>⌨️ Use WASD keys to move</p>
        <p>👆 Click buttons to switch rooms</p>
      </div>
    </div>
  );
};

export default VirtualTourViewer;
