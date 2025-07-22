import React, { useEffect } from 'react';

const GoogleMapsLoader = ({ children }) => {
  useEffect(() => {
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCSVNAzcal6oqDoX65qVmTIXUR8IFYWaYE&libraries=places`; // Reemplaza TU_API_KEY con tu clave API de Google Maps
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);

      script.onload = () => {
        console.log('Google Maps API loaded successfully.');
      };

      script.onerror = () => {
        console.error('Error loading Google Maps API.');
      };
    } else {
      console.log('Google Maps API already loaded.');
    }
  }, []);

  return <>{children}</>;
};

export default React.memo(GoogleMapsLoader);
