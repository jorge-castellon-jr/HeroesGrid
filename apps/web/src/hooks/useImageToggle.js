import { useState, useEffect } from 'react';

export function useImageToggle() {
  const [useImages, setUseImages] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedPreference = localStorage.getItem('use-ranger-images');
    if (savedPreference !== null) {
      setUseImages(JSON.parse(savedPreference));
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage when it changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('use-ranger-images', JSON.stringify(useImages));
    }
  }, [useImages, isLoaded]);

  const toggleUseImages = () => {
    setUseImages(prev => !prev);
  };

  return { useImages, toggleUseImages, isLoaded };
}
