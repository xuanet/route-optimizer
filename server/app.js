const DistanceFormat = require('./DistanceFormat.js')
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path'); // Import the path module

const app = express();
const port = 80; // You can choose any port

app.use(express.static(path.join(__dirname, '../build')));
app.use(cors())
app.use(bodyParser.json());

function filterUniquePlaces(places) {
	const uniquePlaces = [];
	const seenAddresses = new Set();
	let dupes = 0

	places.forEach(place => {
		const address = place.vicinity;
		if (address.split(' ').length > 1) {
			if (!seenAddresses.has(address)) {
				uniquePlaces.push({
					name: place.name,
					address: address,
					location: place.geometry.location
				});
				seenAddresses.add(address);
			}
			else dupes++
		}
	});
	console.log('dupes', dupes)
	return uniquePlaces.slice(0, Math.min(uniquePlaces.length, 20));
}

app.get('*', (req, res) => {
	res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

app.post('/fetch_places', async (req, res) => {
	// extract request fields
	const startAddress = req.body.startAddress
	const endAddress = req.body.endAddress
	const keyword = req.body.keyword
	const apiKey = req.body.apiKey

	const url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';
	let matches = []

	// build params

	// near start

	let params = {
		location: `${startAddress.lat},${startAddress.lng}`,
		rankby: 'distance',
		keyword: `${keyword}`,
		key: `${apiKey}`
	}

	await axios.get(url, { params })
		.then(response => {
			// Process the results
			const places = response.data.results;
			const reducedPlaces = places.slice(0, Math.min(places.length, 5))
			matches.push(...reducedPlaces)
			console.log('start near length', reducedPlaces.length)
		})
		.catch(error => {
			console.error('Error:', error);
		})


	// near end

	params = {
		location: `${endAddress.lat},${endAddress.lng}`,
		rankby: 'distance',
		keyword: `${keyword}`, // e.g., 'restaurant', 'supermarket', etc.
		key: `${apiKey}`
	}

	await axios.get(url, { params })
		.then(response => {
			// Process the results
			const places = response.data.results;
			const reducedPlaces = places.slice(0, Math.min(places.length, 5))
			matches.push(...reducedPlaces)
			console.log('end near length', reducedPlaces.length)
		})
		.catch(error => {
			console.error('Error:', error);
		})

	const uniquePlaces = filterUniquePlaces(matches)
	res.json(uniquePlaces)
})


app.post('/optimal_path', async (req, res) => {
	// extract request fields
	const startAddress = req.body.startAddress
	const endAddress = req.body.endAddress
	const places = req.body.places
	const avoidToll = req.body.avoidToll

	// create DistanceFormat object
	let optimalPaths = new DistanceFormat(startAddress, endAddress, places, avoidToll)
	try {
		await optimalPaths.optimize()
	}
	catch {
		console.log('API Error')
		res.json('API Error')
		return
	}

	const optimalPathTime = optimalPaths.bestPathTime
	const optimalPathDistance = optimalPaths.bestPathDistance
	const optimalPathTimeNames = optimalPaths.bestPathTimeNames
	const optimalPathDistanceNames = optimalPaths.bestPathDistanceNames

	res.json({ optimalPathTime, optimalPathDistance, optimalPathTimeNames, optimalPathDistanceNames })

})

app.listen(port, () => {
	console.log(`Server is running`);
});
