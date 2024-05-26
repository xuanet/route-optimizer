import React, { useState, useRef } from 'react';
import { useLoadScript, Autocomplete } from '@react-google-maps/api';

const libraries = ['places'];

const SearchAddress = ({ apiKey, onPlaceSelected }) => {
  const [autocomplete, setAutocomplete] = useState(null);
  const inputRef = useRef(null);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey,
    libraries,
  });

  const onLoad = (autocompleteInstance) => {
    autocompleteInstance.setTypes(['address']); // Restrict to address types
    setAutocomplete(autocompleteInstance);
  };

  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      onPlaceSelected(place);
    } else {
      console.log('Autocomplete is not loaded yet!');
    }
  };

  if (loadError) {
    return <div>Error loading maps</div>;
  }

  if (!isLoaded) {
    return <div>Loading maps</div>;
  }

  return (
    <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged} apiKey={apiKey}>
      <input
        type="text"
        ref={inputRef}
        placeholder="Search places..."
        style={{ width: '90%', height: '40px', padding: '10px' }}
      />
    </Autocomplete>
  );
};

export default SearchAddress
