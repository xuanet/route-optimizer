import React, { Component } from 'react';
import './styles/AddressDisplay.css';
import axios from 'axios'
import AddressDisplayHelper from './AddressDisplayHelper';
const DistanceFormat = require('../DistanceFormat')

class AddressDisplay extends Component {
    constructor(props) {
        super(props)

        this.state = {
            keyword: '',
            startAddress: props.startAddress,
            endAddress: props.endAddress,
            apiKey: props.apiKey,

            places: []
        }

        this.changeHandler = this.changeHandler.bind(this)
        this.findEstablishment = this.findEstablishment.bind(this)
        this.addInput = this.addInput.bind(this)
        this.handleInputChange = this.handleInputChange.bind(this)
        this.calculate = this.calculate.bind(this)
    }

    componentDidUpdate(prevProps, prevState) {
        console.log('address display updated, new start: ', this.state.startAddress)
        console.log('address display updated, new start: ', this.props.startAddress)

    }

    addInput = () => {
        this.setState((prevState) => ({
            places: [...prevState.places, []], // Add a new empty string to the array
        }));
    };

    handleInputChange = (index, event) => {
        const newInputs = this.state.places.slice(); // Create a copy of the inputs array
        newInputs[index] = event.target.value; // Update the value at the given index
        this.setState({ places: newInputs }); // Set the updated array to the state
    };

    findEstablishment = () => {

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

    filterUniquePlaces = (places) => {
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

    changeHandler = (e) => {
        const value = e.target.value
        this.setState({
            keyword: value
        })
    };

    updatePlace = (index, updatedPlace) => {
        this.setState(prevState => {
            const newArray = [...prevState.places]
            newArray[index] = updatedPlace
            return { places: newArray }
        })
        console.log('update place from address display')
    };

    calculate = () => {
        console.log(2)
		const test = new DistanceFormat(this.state.startAddress, this.state.endAddress, this.state.places, axios)
        console.log(3)
		test.optimize()

	}

    render() {

        const startAddress = this.props.startAddress
        const endAddress = this.state.endAddress
        const keyword = this.state.keyword
        const places = this.state.places
        const apiKey = this.state.apiKey

        return (

            <div>
                <button onClick={this.addInput}>Add Input</button>
                <div id='input-field-encompass'>
                {this.state.places.map((input, index) => (
                    <AddressDisplayHelper id='input-field' position={index} updatePlace={this.updatePlace} places={places[index]} startAddress={startAddress} endAddress={endAddress} apiKey={apiKey}/>
                ))}
                </div>
                <button onClick={() => console.log(this.state.places)}>Reveal all locations</button>
                <button onClick={this.calculate}>Calculate</button>
            </div>
        );
    }
}

export default AddressDisplay;
