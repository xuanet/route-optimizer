import './App.css';
import { useState, useEffect } from 'react'
import Header from './components/Header';
import TestMap from './components/TestMap';
import StartEnd from './components/StartEnd';
import './components/styles/TestMapStyles.css'
import SearchAdress from './components/SearchAdress';
// import TestMapClass from './components/TestMapClass';
import DistanceMatrix from './components/styles/DistanceMatrix';
import AddressDisplay from './components/AddressDisplay';


import {APIProvider, Map, Marker} from '@vis.gl/react-google-maps';
import './components/styles/TestMapStyles.css'

const apiKeyMap = 'AIzaSyBSxhXCH1UBbtgc9CmobRec-gRLt_MHb1Q'
const apiKeyAutocomplete = 'AIzaSyCk8Y40ZcvbAnqIQKmBuxDn66JwCJM8sTU'
const apiKeyDistanceMatrix = 'AIzaSyA438rz5gimhiPCCyXYR64pG6813qJUnA8'

function App() {


	const [start, updateStart] = useState({ lat: 35.791470, lng: -78.781143 });
	const [end, updateEnd] = useState({ lat: 35.9940, lng: -78.8986 });

	const [startAddress, setStartAddress] = useState({ address: '201 William Henry Way', lat: 0, lng: 0 });
	const [endAddress, setEndAddress] = useState({ address: '106 Haley House Lane', lat: 0, lng: 0 });

	useEffect(() => {
		console.log('startAddress: ', startAddress)
	}, [startAddress])

	useEffect(() => {
		console.log('endAddress: ', endAddress)
	}, [endAddress])

	const [addresses, updateAddresses] = useState([])
	useEffect(() => {
		console.log(addresses)
		console.log('app.js thinks addresses is', typeof(addresses))
	}, [addresses])


	/////////////////

	const handleUpdateStart = (newStart) => {
		console.log('i have executed updatestart')
		updateStart(newStart);
		console.log(start)
	};

	const handleUpdateEnd = (newEnd) => {
		updateEnd(newEnd);
		console.log('i have executed updateend')
		console.log(end)
	};

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

	// const addAddress = () => {
	// 	updateAddresses(prevArray => [...prevArray, {'id': prevArray.length + 1, 'address': selectedPlace.address}])
	// }


	//////////////

	return (
		<div className="App">

			<Header />
			
			{/* <StartEnd start={start} end={end} updateStart={handleUpdateStart} updateEnd={handleUpdateEnd} /> */}
			<SearchAdress apiKey={apiKeyMap} selectStart={selectStart} selectEnd={selectEnd}></SearchAdress>
			<TestMap startAddress={startAddress} endAddress={endAddress} apiKey={apiKeyMap} />
			{/* <button onClick={() => addAddress()}>Add Address</button> */}
			{/* <DistanceMatrix apiKey={apiKeyDistanceMatrix} />  */}
			{/* <AddressDisplay addresses={addresses}></AddressDisplay> */}
		</div>
	);
}

export default App;
