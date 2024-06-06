import './App.css';
import { useState, useEffect } from 'react'
import Header from './components/Header';
import TestMap from './components/TestMap';
import StartEnd from './components/StartEnd';
// import './components/styles/TestMapStyles.css'
import SearchAddress from './components/SearchAddress';
// import TestMapClass from './components/TestMapClass';
import DistanceMatrix from './components/DistanceMatrix';
import AddressDisplay from './components/AddressDisplay';
import axios from 'axios'

import './components/styles/TestMapStyles.css'

import { LoadScript, Autocomplete } from '@react-google-maps/api';
import StartEndAddressDisplay from './components/StartEndAddressDisplay';

const apiKeyMap = 'AIzaSyBSxhXCH1UBbtgc9CmobRec-gRLt_MHb1Q'
const apiKeyAutocomplete = 'AIzaSyCk8Y40ZcvbAnqIQKmBuxDn66JwCJM8sTU'
const apiKeyDistanceMatrix = 'AIzaSyA438rz5gimhiPCCyXYR64pG6813qJUnA8'
const libraries = ['places'];

function App() {

	// current lng lat wrong
	const [startAddress, setStartAddress] = useState({ address: 'Unset', lat: 0, lng: 0 });
	const [endAddress, setEndAddress] = useState({ address: 'Unset', lat: 0, lng: 0 });

	useEffect(() => {
		console.log('startAddress: ', startAddress)
	}, [startAddress])

	useEffect(() => {
		console.log('endAddress: ', endAddress)
	}, [endAddress])

	const [addresses, updateAddresses] = useState([])
	useEffect(() => {
		console.log(addresses)
	}, [addresses])


	/////////////////


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

	const findEstablishment = () => {

		const startAddress = this.state.startAddress
		console.log(startAddress)
		const keyword = this.state.keyword
		const apiKey = this.state.apiKey
		// Define the parameters for the Nearby Search request
		const params = {
			location: `${startAddress.lat},${startAddress.lng}`,
			radius: '10000',
			keyword: `${keyword}`, // e.g., 'restaurant', 'supermarket', etc.
			key: `${apiKey}`
		};

		// Make the Nearby Search request
		const url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';

		axios.get(url, { params })
			.then(response => {
				// Process the results
				const places = response.data.results;
				console.log('length', places.length)
				const uniquePlaces = this.filterUniquePlaces(places);
				this.setState({
					places: uniquePlaces,
					keyword: ''
				})
				console.log(this.state.places)
			})
			.catch(error => {
				console.error('Error:', error);
			});
	}

	const filterUniquePlaces = (places) => {
		const uniquePlaces = [];
		const seenAddresses = new Set();

		places.forEach(place => {
			const address = place.vicinity;
			if (!seenAddresses.has(address)) {
				uniquePlaces.push({
					name: place.name,
					address: address,
					location: place.geometry.location
				});
				seenAddresses.add(address);
			}
		});

		return uniquePlaces;
	}




	//////////////

	return (
		<div className="App">

			<LoadScript googleMapsApiKey={apiKeyAutocomplete} libraries={libraries}>


				<Header />
				{/* <StartEnd start={start} end={end} updateStart={handleUpdateStart} updateEnd={handleUpdateEnd} /> */}
				<SearchAddress apiKey={apiKeyAutocomplete} selectStart={selectStart} selectEnd={selectEnd}></SearchAddress>
				<StartEndAddressDisplay startAddress={startAddress} endAddress={endAddress}></StartEndAddressDisplay>
				{/* <TestMap startAddress={startAddress} endAddress={endAddress} apiKey={apiKeyMap} /> */}
				{/* <TestMap startAddress={start} endAddress={end} /> */}
				{/* <button onClick={() => addAddress()}>Add Address</button> */}
				{/* <DistanceMatrix apiKey={apiKeyDistanceMatrix} />  */}
				{/* <button onClick={() => findEstablishment()}>Find establishment</button> */}
				<div id='place-search'>
					<AddressDisplay startAddress={startAddress} endAddress={endAddress} apiKey={apiKeyMap} findEstablishment={findEstablishment} filterUniquePlaces={filterUniquePlaces}></AddressDisplay>
				</div>

			</LoadScript>

		</div>
	);
}

export default App;
