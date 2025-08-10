# 🏠 Virtual Reality Tour Integration

## 📋 Overview

This VR tour feature allows users to view panoramic images of properties in an immersive 360° experience using A-Frame WebVR technology.

## 🏗️ Architecture

### Components Structure

```
src/components/tour/
├── VirtualTourViewer.tsx      # Main A-Frame scene component
├── VirtualTourModal.tsx       # Modal wrapper for embedded tours
├── TourNavigationControls.tsx # Room switching interface
├── SceneTransition.tsx        # Loading states and transitions
├── EnhancedHotspot.tsx        # Interactive UI elements
└── index.ts                   # Component exports
```

### Pages

```
src/pages/VirtualTourPage.tsx  # Full-screen VR tour page
```

### Hooks

```
src/hooks/tour/
├── useTourProperties.ts       # Property data management
└── index.ts                   # Hook exports
```

### Types

```
src/types/tour.ts             # VR tour type definitions
```

## 🔧 Technology Stack

- **A-Frame 1.4.2**: WebVR framework for immersive experiences
- **React Integration**: Custom React wrapper components
- **MongoDB GridFS**: Panoramic image storage
- **TypeScript**: Type safety and developer experience

## 📸 Image Requirements

### Format

- **Equirectangular projection**: 360° panoramic images
- **JPEG format**: Optimized for web delivery
- **Recommended resolution**: 4096x2048 or higher
- **Aspect ratio**: 2:1 (width:height)

### Room Mapping

- `roomPhotoId` → Bedroom
- `drawingRoomPhotoId` → Living Room
- `kitchenPhotoId` → Kitchen
- `bathroomPhotoId` → Bathroom

## 🎮 User Experience

### Navigation

- **Mouse/Touch**: Click and drag to look around
- **Keyboard**: WASD keys for movement (optional)
- **VR Controllers**: Support for VR headsets
- **Room Switching**: Click floating menu buttons

### Features

- **Smooth Transitions**: Loading states between rooms
- **Disabled States**: Rooms without images are disabled
- **Property Info**: Overlay showing property details
- **Exit Options**: Return to dashboard or close modal

## 🚀 Usage

### From Dashboard

1. Property cards show "3D Tour" button
2. Button is enabled only if panoramic images exist
3. Click opens full-screen VR experience

### Direct URL Access

```
/tour/:propertyId
```

### Programmatic Access

```typescript
import { VirtualTourModal } from "@/components/tour";

const MyComponent = () => {
  const [showTour, setShowTour] = useState(false);

  return (
    <VirtualTourModal
      isOpen={showTour}
      onClose={() => setShowTour(false)}
      property={propertyData}
    />
  );
};
```

## 🔗 API Integration

### Image Service

```typescript
// Images are served from Node.js image service
const imageUrl = `/api/images/${imageId}`;
```

### Property Data

```typescript
interface TourProperty {
  id: string;
  propertyName: string;
  propertyAddress: string;
  roomPhotoId?: string;
  bathroomPhotoId?: string;
  drawingRoomPhotoId?: string;
  kitchenPhotoId?: string;
}
```

## 🛠️ Development

### Adding New Room Types

1. Update `TourRoom` interface in `types/tour.ts`
2. Add room configuration in `VirtualTourViewer.tsx`
3. Update property interface to include new image ID field

### Customizing UI

- Modify `TourNavigationControls.tsx` for menu appearance
- Update `EnhancedHotspot.tsx` for button styles
- Customize `SceneTransition.tsx` for loading animations

### Performance Optimization

- Images are lazy-loaded when rooms are switched
- A-Frame scene is embedded to prevent memory leaks
- Smooth transitions with loading states

## 🔧 Configuration

### A-Frame Settings

```typescript
<a-scene
  embedded
  vr-mode-ui="enabled: false"
  device-orientation-permission-ui="enabled: false"
>
```

### Camera Settings

```typescript
<a-camera wasd-controls="acceleration: 50">
  <a-cursor fuse="true" fuse-timeout="1000" color="#FFF" />
</a-camera>
```

## 📱 Mobile Support

- Touch controls for 360° viewing
- Responsive button layouts
- Gyroscope support for device orientation
- Optimized loading for mobile networks

## 🔮 Future Enhancements

### Planned Features

- **Hotspots**: Interactive information points
- **Floor Plans**: 2D navigation overlay
- **Measurements**: Room dimension tools
- **Virtual Staging**: Furniture placement
- **Audio Tours**: Narrated experiences
- **Multi-floor Support**: Building navigation

### Technical Improvements

- **Preloading**: Predictive image loading
- **Compression**: Advanced image optimization
- **Streaming**: Progressive image loading
- **Analytics**: User interaction tracking

## 🐛 Troubleshooting

### Common Issues

**Images not loading**

- Check image ID validity in MongoDB
- Verify image service is running on port 3000
- Ensure images are in equirectangular format

**Performance issues**

- Reduce image resolution
- Enable image compression
- Check browser WebGL support

**Navigation problems**

- Verify A-Frame cursor configuration
- Check button click event handlers
- Ensure proper room availability flags

### Browser Support

- **Chrome/Edge**: Full support
- **Firefox**: Full support
- **Safari**: Limited VR features
- **Mobile**: Touch navigation only

## 📈 Analytics Integration

Track user engagement:

- Room visit duration
- Navigation patterns
- Tour completion rates
- Device/browser usage

This VR tour feature provides an immersive property viewing experience that enhances user engagement and showcases properties in a compelling way.
