import './App.css';
import { useState, useEffect } from 'react'
import Header from './components/Header';
import SearchAddress from './components/SearchAddress';
import AddressDisplay from './components/AddressDisplay';
import axios from 'axios'

import './components/styles/TestMapStyles.css'

import { LoadScript } from '@react-google-maps/api';
import StartEndAddressDisplay from './components/StartEndAddressDisplay';

const apiKeyMap = 'AIzaSyBSxhXCH1UBbtgc9CmobRec-gRLt_MHb1Q'
const apiKeyAutocomplete = 'AIzaSyCk8Y40ZcvbAnqIQKmBuxDn66JwCJM8sTU'
const apiKeyDistanceMatrix = 'AIzaSyA438rz5gimhiPCCyXYR64pG6813qJUnA8'
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
			<LoadScript googleMapsApiKey={apiKeyAutocomplete} libraries={libraries}>
				<Header />
				<SearchAddress apiKey={apiKeyAutocomplete} selectStart={selectStart} selectEnd={selectEnd}></SearchAddress>
				<StartEndAddressDisplay startAddress={startAddress} endAddress={endAddress}></StartEndAddressDisplay>
				<AddressDisplay startAddress={startAddress} endAddress={endAddress} apiKey={apiKeyMap}></AddressDisplay>
			</LoadScript>
		</div>
	);
}

export default App;
