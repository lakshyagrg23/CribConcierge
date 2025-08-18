import React from 'react';

interface EnhancedHotspotProps {
  position: string;
  width: string;
  height: string;
  color: string;
  opacity: string;
  text: string;
  textColor: string;
  hoverColor: string;
  onClick: () => void;
  className?: string;
}

const EnhancedHotspot: React.FC<EnhancedHotspotProps> = ({
  position,
  width,
  height,
  color,
  opacity,
  text,
  textColor,
  hoverColor,
  onClick,
  className = "clickable"
}) => {
  return (
    <a-plane
      position={position}
      width={width}
      height={height}
      color={color}
      opacity={opacity}
      material="shader: flat; transparent: true; side: double"
      radius="0.12"
      className={className}
      text={`value: ${text}; align: center; color: ${textColor}; width: 3`}
      animation__mouseenter="property: scale; to: 1.17 1.17 1; dur: 200; startEvents: mouseenter"
      animation__mouseleave="property: scale; to: 1 1 1; dur: 200; startEvents: mouseleave"
      animation__mouseenter2={`property: color; to: ${hoverColor}; startEvents: mouseenter`}
      animation__mouseleave2={`property: color; to: ${color}; startEvents: mouseleave`}
      onClick={onClick}
      shadow="cast: true"
    />
  );
};

export default EnhancedHotspot;
