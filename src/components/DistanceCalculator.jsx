import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Loader } from '@googlemaps/js-api-loader';

// 1. FIX for API Key visibility: Use VITE_ prefix with import.meta.env 
const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const DistanceCalculator = () => {
  // State for Distance Calculation
  const [originAddress, setOriginAddress] = useState('New York, NY');
  const [destinationAddress, setDestinationAddress] = useState('Boston, MA');
  const [distanceResult, setDistanceResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Refs for Autocomplete Input Fields
  const originInputRef = useRef(null);
  const destinationInputRef = useRef(null);

  // =========================================================================
  // INITIALIZE GOOGLE MAPS LOADER AND AUTOCOMPLETE
  // =========================================================================
  useEffect(() => {
    if (!API_KEY) {
      setError("VITE_GOOGLE_MAPS_API_KEY is missing. Check your .env file.");
      return;
    }

    const loader = new Loader({
      apiKey: API_KEY,
      version: "weekly",
      // 2. FEATURE: Load the 'places' library for Autocomplete
      libraries: ["places"], 
    });

    loader.load().then(() => {
      // Function to attach Autocomplete to an input field
      const initAutocomplete = (inputElement, setAddressState) => {
        if (window.google && window.google.maps && window.google.maps.places) {
          const autocomplete = new window.google.maps.places.Autocomplete(
            inputElement,
            { fields: ["formatted_address"] }
          );

          autocomplete.addListener("place_changed", () => {
            const place = autocomplete.getPlace();
            if (place.formatted_address) {
              setAddressState(place.formatted_address);
            }
          });
        }
      };

      // Attach Autocomplete to the Origin input
      if (originInputRef.current) {
        initAutocomplete(originInputRef.current, setOriginAddress);
      }
      // Attach Autocomplete to the Destination input
      if (destinationInputRef.current) {
        initAutocomplete(destinationInputRef.current, setDestinationAddress);
      }

    }).catch(e => {
      console.error("Error loading Google Maps API:", e);
      setError("Failed to load Google Maps API. Check console and API key/permissions.");
    });
  }, []); // Run only once on mount

  // =========================================================================
  // DISTANCE MATRIX CALCULATION
  // =========================================================================
  const calculateDistance = async () => {
    if (!API_KEY) {
      setError("API Key is missing. Cannot calculate distance.");
      return;
    }
    
    setLoading(true);
    setError(null);
    setDistanceResult(null);

    const encodedOrigin = encodeURIComponent(originAddress);
    const encodedDestination = encodeURIComponent(destinationAddress);

    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?` +
                `origins=${encodedOrigin}` +
                `&destinations=${encodedDestination}` +
                `&mode=driving` + 
                `&units=imperial` + 
                `&key=${API_KEY}`;

    try {
      const response = await axios.get(url);
      const data = response.data;

      if (data.status === 'OK') {
        const element = data.rows[0].elements[0];
        
        if (element.status === 'OK') {
          const distance = element.distance.text;
          const duration = element.duration.text;
          setDistanceResult({ distance, duration });
        } else {
          setError(`Location Error: ${element.status}. Check if the addresses are valid.`);
        }
      } else {
        setError(`API Request Failed: ${data.status}. ${data.error_message || 'No error message provided.'}`);
      }
    } catch (err) {
      console.error('Network or Request Error:', err);
      setError('A network or CORS error occurred. Check your console and API key restrictions.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto', fontFamily: 'Arial, sans-serif', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h1>🛣️ Distance Calculator (with Autocomplete)</h1>
      
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', fontWeight: 'bold' }}>Origin Address:</label>
        <input 
          type="text" 
          value={originAddress} 
          onChange={(e) => setOriginAddress(e.target.value)}
          // Attach Ref for Autocomplete
          ref={originInputRef} 
          style={{ width: '97%', padding: '8px', margin: '5px 0', border: '1px solid #ccc' }}
        />
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontWeight: 'bold' }}>Destination Address:</label>
        <input 
          type="text" 
          value={destinationAddress} 
          onChange={(e) => setDestinationAddress(e.target.value)}
          // Attach Ref for Autocomplete
          ref={destinationInputRef} 
          style={{ width: '97%', padding: '8px', margin: '5px 0', border: '1px solid #ccc' }}
        />
      </div>
      
      <button 
        onClick={calculateDistance} 
        disabled={loading || !originAddress || !destinationAddress}
        style={{ 
          padding: '10px 20px', 
          cursor: 'pointer', 
          backgroundColor: loading ? '#ccc' : '#007bff', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px'
        }}
      >
        {loading ? 'Calculating...' : 'Calculate Driving Distance'}
      </button>

      {error && (
        <p style={{ color: 'white', backgroundColor: '#dc3545', padding: '10px', borderRadius: '4px', marginTop: '15px' }}>
          **Error:** {error}
        </p>
      )}

      {distanceResult && (
        <div style={{ marginTop: '20px', borderTop: '2px solid #007bff', padding: '10px 0' }}>
          <h2>Results</h2>
          <p>🚗 **Distance:** **{distanceResult.distance}**</p>
          <p>⏱️ **Estimated Travel Time:** **{distanceResult.duration}**</p>
        </div>
      )}
    </div>
  );
};

export default DistanceCalculator;