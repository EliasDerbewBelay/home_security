import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

export interface LocationData {
  latitude: number;
  longitude: number;
}

export function useCurrentLocation() {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchLocation() {
      try {
        setLoading(true);
        setErrorMsg(null);
        
        const { status } = await Location.requestForegroundPermissionsAsync();
        
        if (status !== 'granted') {
          if (isMounted) {
            setErrorMsg('Permission to access location was denied.');
            setLoading(false);
          }
          return;
        }

        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        if (isMounted) {
          setLocation({
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
          });
          setLoading(false);
        }
      } catch (error) {
        if (isMounted) {
          console.error("Error fetching location:", error);
          setErrorMsg('Failed to retrieve device location.');
          setLoading(false);
        }
      }
    }

    fetchLocation();

    return () => {
      isMounted = false;
    };
  }, []);

  return { location, errorMsg, loading };
}
