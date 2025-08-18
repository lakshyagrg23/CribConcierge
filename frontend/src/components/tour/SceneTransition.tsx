import React from 'react';
import { Loader2 } from 'lucide-react';

interface SceneTransitionProps {
  isLoading: boolean;
  currentRoom: string;
  error?: string;
}

const SceneTransition: React.FC<SceneTransitionProps> = ({ isLoading, currentRoom, error }) => {
  if (error) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-white z-50">
        <div className="text-center">
          <div className="text-red-400 text-lg mb-2">Error Loading Room</div>
          <div className="text-sm">{error}</div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-white z-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <div className="text-lg">Loading {currentRoom}...</div>
          <div className="text-sm mt-2 opacity-75">Please wait while we prepare your tour</div>
        </div>
      </div>
    );
  }

  return null;
};

export default SceneTransition;
