import { useState, useCallback } from 'react';

export interface GeocodeResult {
  lat: number;
  lng: number;
  formatted_address: string;
  address_components?: any;
}

// Extract UK postcode from address string
function extractUKPostcode(address: string): string | null {
  // UK postcode regex pattern
  const postcodePattern = /\b[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}\b/gi;
  const match = address.match(postcodePattern);
  return match ? match[match.length - 1].trim() : null;
}

export function useGeocoding() {
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodeError, setGeocodeError] = useState<string | null>(null);
  const [geocodeInfo, setGeocodeInfo] = useState<string | null>(null);

  const geocodeAddress = useCallback(async (address: string): Promise<GeocodeResult | null> => {
    if (!address || address.trim().length < 5) {
      return null;
    }

    setIsGeocoding(true);
    setGeocodeError(null);
    setGeocodeInfo(null);

    try {
      // First, try with the full address
      let response = await fetch(`/api/geocode?address=${encodeURIComponent(address.trim())}`);
      
      if (response.ok) {
        const result = await response.json();
        setGeocodeInfo('✓ Found using full address');
        // Clear success message after 3 seconds
        setTimeout(() => setGeocodeInfo(null), 2000);
        return result;
      }

      // If full address fails, try with just the postcode
      const postcode = extractUKPostcode(address);
      if (postcode) {
        console.log(`Full address failed, trying with postcode: ${postcode}`);
        setGeocodeInfo(`Trying postcode: ${postcode}...`);
        response = await fetch(`/api/geocode?address=${encodeURIComponent(postcode)}`);
        
        if (response.ok) {
          const result = await response.json();
          setGeocodeInfo(`✓ Found using postcode: ${postcode}`);
          // Clear success message after 3 seconds
          setTimeout(() => setGeocodeInfo(null), 2000);
          return result;
        }
      }

      // If both attempts fail, log the error and return null
      const errorData = await response.json();
      throw new Error(errorData.error || 'Geocoding failed');

    } catch (error: any) {
      console.error('Geocoding error:', error);
      setGeocodeError(error.message);
      setGeocodeInfo(null);
      setTimeout(() => setGeocodeError(null), 2000);
      return null;
    } finally {
      setIsGeocoding(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setGeocodeError(null);
    setGeocodeInfo(null);
  }, []);

  return {
    geocodeAddress,
    isGeocoding,
    geocodeError,
    geocodeInfo,
    clearError,
  };
}
