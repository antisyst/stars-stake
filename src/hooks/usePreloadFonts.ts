import { useState, useEffect } from 'react';

interface FontFace {
  family: string;
  source: string;
  descriptors?: FontFaceDescriptors;
}

export const usePreloadFonts = (fonts: FontFace[]): boolean => {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    const loadFonts = async () => {
      try {
        const fontFaces = fonts.map(font => {
          return new FontFace(font.family, `url(${font.source})`, font.descriptors);
        });

        const loadedFonts = await Promise.all(fontFaces.map(fontFace => fontFace.load()));

        loadedFonts.forEach(fontFace => document.fonts.add(fontFace));

        setFontsLoaded(true);
      } catch (err) {
        console.error('Failed to preload fonts:', err);
        setFontsLoaded(true);
      }
    };

    loadFonts();
  }, [fonts]);

  return fontsLoaded;
}