import { useState, useEffect } from 'react';
import { buildImageUrl, getSpriteSheetStyle } from '../utils/imageHelpers';

export default function RangerDisplayImage({ displayImage, className = '' }) {
  const [spriteStyle, setSpriteStyle] = useState({});

  useEffect(() => {
    if (displayImage) {
      getSpriteSheetStyle(displayImage).then(style => {
        setSpriteStyle(style || {});
      });
    }
  }, [displayImage]);

  if (!displayImage) return null;

  return (
    <div
      style={{
        backgroundImage: `url('${buildImageUrl(displayImage)}')`,
        aspectRatio: '768 / 444',
        ...spriteStyle,
      }}
      className={`w-full rounded-lg shadow-lg ${className}`}
    />
  );
}
