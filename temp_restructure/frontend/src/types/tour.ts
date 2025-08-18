export interface TourProperty {
  id: string;
  propertyName: string;
  propertyAddress: string;
  roomPhotoId?: string;
  bathroomPhotoId?: string;
  drawingRoomPhotoId?: string;
  kitchenPhotoId?: string;
}

export interface TourRoom {
  id: string;
  name: string;
  label: string;
  emoji: string;
  color: string;
  hoverColor: string;
  imageId?: string;
  available: boolean;
}

export interface TourState {
  currentRoom: string;
  isLoading: boolean;
  error?: string;
}
