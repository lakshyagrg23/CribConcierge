import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import VirtualTourViewer from './VirtualTourViewer';
import { TourProperty } from '@/types/tour';

interface VirtualTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: TourProperty;
}

const VirtualTourModal: React.FC<VirtualTourModalProps> = ({
  isOpen,
  onClose,
  property
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-screen max-h-screen w-screen h-screen p-0 m-0 bg-black">
        {/* Close Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="absolute top-4 right-4 z-50 bg-black/50 hover:bg-black/70 text-white rounded-full w-10 h-10"
        >
          <X className="h-5 w-5" />
        </Button>

        {/* VR Tour Viewer */}
        <div className="w-full h-full">
          <VirtualTourViewer property={property} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VirtualTourModal;
