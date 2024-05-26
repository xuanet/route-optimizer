import React, { useState } from 'react';
import { LoadScript } from '@react-google-maps/api';

const libraries = ['places'];

const DistanceMatrix = ({ apiKey }) => {
    const [startAddress, setStartAddress] = useState('');
    const [endAddress, setEndAddress] = useState('');
    const [distance, setDistance] = useState(null);
    const [duration, setDuration] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'start') setStartAddress(value);
        if (name === 'end') setEndAddress(value);
    };

    const calculateDistance = () => {
        const service = new window.google.maps.DistanceMatrixService();
        service.getDistanceMatrix(
            {
                origins: [startAddress],
                destinations: [endAddress],
                travelMode: 'DRIVING',
            },
            (response, status) => {
                if (status === 'OK') {
                    const result = response.rows[0].elements[0];
                    setDistance(result.distance.text);
                    setDuration(result.duration.text);
                } else {
                    console.error('Error fetching distance matrix data', status);
                }
            }
        );
    };

    return (
        <div>
            <LoadScript googleMapsApiKey={apiKey} libraries={libraries}>
                <div>
                    <label>Start Address:</label>
                    <input
                        type="text"
                        name="start"
                        value={startAddress}
                        onChange={handleInputChange}
                    />
                </div>
                <div>
                    <label>End Address:</label>
                    <input
                        type="text"
                        name="end"
                        value={endAddress}
                        onChange={handleInputChange}
                    />
                </div>
                <button onClick={calculateDistance}>Calculate Distance</button>
                {distance && duration && (
                    <div>
                        <p>Distance: {distance}</p>
                        <p>Duration: {duration}</p>
                    </div>
                )}
            </LoadScript>
        </div>
    );
};

export default DistanceMatrix;
