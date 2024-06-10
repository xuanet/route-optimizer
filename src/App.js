import './App.css';
import Header from './components/Header';
import StartEndAddressSelector from './components/StartEndAddressSelector';
import StartEndAddressDisplay from './components/StartEndAddressDisplay';
import InputModifier from './components/InputModifier';

import { useState } from 'react'
import { LoadScript } from '@react-google-maps/api';

const apiKey = process.env.REACT_APP_API_KEY
const libraries = ['places'];

function App() {

	const [startAddress, setStartAddress] = useState({ address: 'Unset', lat: 0, lng: 0 });
	const [endAddress, setEndAddress] = useState({ address: 'Unset', lat: 0, lng: 0 });

	const selectStart = (place) => {
		if (place.geometry && place.geometry.location) {
			setStartAddress((prevSelectedPlace) => {
				const updatedPlace = {
					...prevSelectedPlace,
					address: place.formatted_address,
					lat: place.geometry.location.lat(),
					lng: place.geometry.location.lng()
				};
				return updatedPlace;
			});
		}
	};

	const selectEnd = (place) => {
		if (place.geometry && place.geometry.location) {
			setEndAddress((prevSelectedPlace) => {
				const updatedPlace = {
					...prevSelectedPlace,
					address: place.formatted_address,
					lat: place.geometry.location.lat(),
					lng: place.geometry.location.lng()
				};
				return updatedPlace;
			});
		}
	};

	return (
		<div className="App">
			<LoadScript googleMapsApiKey={apiKey} libraries={libraries}>
				<Header />
				<StartEndAddressSelector apiKey={apiKey} selectStart={selectStart} selectEnd={selectEnd} />
				<StartEndAddressDisplay startAddress={startAddress} endAddress={endAddress} />
				<InputModifier startAddress={startAddress} endAddress={endAddress} apiKey={apiKey} />
			</LoadScript>
		</div>
	);
}

export default App;
