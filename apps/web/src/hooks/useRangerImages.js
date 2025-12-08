import { useState, useEffect } from 'react';
import rangerImageMap from '../assets-manifest.json';

export function useRangerImages() {
  const [imageMap, setImageMap] = useState({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      // Map image URLs to ranger references
      // Format: "name|ability" => R2 URL
      const map = {};
      
      // This would need to be populated from your ranger_image_map.json
      // For now, we'll create a placeholder that can be extended
      setImageMap(map);
      setIsLoaded(true);
    } catch (error) {
      console.error('Failed to load ranger images:', error);
      setIsLoaded(true);
    }
  }, []);

  const getRangerImage = (rangerName, ability) => {
    const key = `${rangerName}|${ability}`;
    return imageMap[key] || null;
  };

  return { getRangerImage, isLoaded };
}
