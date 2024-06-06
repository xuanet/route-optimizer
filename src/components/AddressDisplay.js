import React, { Component } from 'react';
import './styles/AddressDisplay.css';
import axios from 'axios'
import AddressDisplayHelper from './AddressDisplayHelper';
// const DistanceFormat = require('../DistanceFormat')
import DistanceFormat from '../DistanceFormat';

class AddressDisplay extends Component {
    constructor(props) {
        super(props)

        this.state = {
            keyword: '',
            startAddress: props.startAddress,
            endAddress: props.endAddress,
            apiKey: props.apiKey,

            places: [],

            bestPathTime: [],
            bestPathDistance: [],

            bestPathTimeLink: '',
            bestPathDistanceLink: ''
        }



        this.changeHandler = this.changeHandler.bind(this)

        this.addInput = this.addInput.bind(this)
        this.removeInput = this.removeInput.bind(this)
        this.handleInputChange = this.handleInputChange.bind(this)
        this.calculate = this.calculate.bind(this)
        this.formatGoogleMapsRoute = this.formatGoogleMapsRoute.bind(this)
        this.validateStartEndAddress = this.validateStartEndAddress.bind(this)
    }

    addInput = () => {
        this.setState((prevState) => ({
            places: [...prevState.places, []], // Add a new empty string to the array
        }));
    };

    removeInput = () => {
        const reducedPlaces = this.state.places.slice(0, -1)
        this.setState({
            places: reducedPlaces
        })
    }

    handleInputChange = (index, event) => {
        const newInputs = this.state.places.slice(); // Create a copy of the inputs array
        newInputs[index] = event.target.value; // Update the value at the given index
        this.setState({ places: newInputs }); // Set the updated array to the state
    };

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

    validateStartEndAddress = (startAddress, endAddress) => {
        return ((startAddress.lat === 0 && startAddress.lng === 0) || (endAddress.lat === 0 && endAddress.lng === 0)) ? false : true
    }

    calculate = async () => {

        if (!this.validateStartEndAddress(this.props.startAddress, this.props.endAddress)) {
            alert('Please set start and end address')
            return
        }

        if (this.state.places.length === 0) {
            // no intermediates
            alert('Please include at least 1 intermediate location')
            return
        }


        let emptyPlaces = []

        for (let i = 0; i<this.state.places.length; i++) {
            if (this.state.places[i].length === 0) {
                emptyPlaces.push(i+1)
            }
        }

        if (emptyPlaces.length > 0) {
            alert(`Inputs ${emptyPlaces.join(', ')} are empty or not confirmed`);
        }


        const optimalPaths = new DistanceFormat(this.props.startAddress, this.props.endAddress, this.state.places, axios)
        await optimalPaths.optimize()
        const timePath = optimalPaths.bestPathTimeAddresses
        const distPath = optimalPaths.bestPathDistanceAddresses
        this.setState({
            bestPathTime: timePath,
            bestPathDistance: distPath
        }, () => {
            const timeLink = this.formatGoogleMapsRoute(this.state.bestPathTime)
            const distLink = this.formatGoogleMapsRoute(this.state.bestPathDistance)
            this.setState({
                bestPathTimeLink: timeLink,
                bestPathDistanceLink: distLink
            })
        })

        console.log(optimalPaths.startMap)
        console.log(optimalPaths.endMap)
        console.log('time paths checked', optimalPaths.numPathsTimeChecked)
        console.log('dist paths checked', optimalPaths.numPathsDistanceChecked)




        console.log(optimalPaths.idMap)
        console.log(optimalPaths.placeMap)
        console.log(optimalPaths.bestPathTime)
        console.log(optimalPaths.currBestTime)


    }

    formatGoogleMapsRoute = (addresses) => {
        if (addresses.length === 0) return '';

        let tempAddresses = structuredClone(addresses)
        tempAddresses.splice(0, 0, this.props.startAddress.address)
        tempAddresses.push(this.props.endAddress.address)

        // prepend and append start and end

        // Base URL for Google Maps directions
        const baseURL = 'https://www.google.com/maps/dir/';

        // Format each address by replacing spaces with '+'
        const formattedAddresses = tempAddresses.map(address => address.replace(/\s+/g, '+'));

        // Join all addresses with '/'
        const route = formattedAddresses.join('/');

        // Combine the base URL with the formatted route
        return `${baseURL}${route}/@?avoid=t`
    }


    render() {

        const startAddress = this.props.startAddress
        const endAddress = this.props.endAddress
        const places = this.state.places
        const apiKey = this.state.apiKey

        return (

            <div>
                <div id='buttons-container'>
                    <button onClick={this.addInput}>Add Input</button>
                    <button onClick={this.removeInput}>Remove Input</button>
                    <button onClick={() => console.log(this.state.places)}>Reveal all locations</button>
                    <button onClick={this.calculate}>Calculate</button>

                    <a href={this.state.bestPathTimeLink} target="_blank" rel="noopener noreferrer">
                        Best Time
                    </a>
                    <a href={this.state.bestPathDistanceLink} target="_blank" rel="noopener noreferrer">
                        Best Distance
                    </a>
                

                </div>

                <div id='input-field-encompass'>
                    {this.state.places.map((input, index) => (
                        <AddressDisplayHelper key={index} className='input-field' position={index} updatePlace={this.updatePlace} places={places[index]} startAddress={startAddress} endAddress={endAddress} apiKey={apiKey} />
                    ))}
                </div>


            </div>
        );
    }
}

export default AddressDisplay;
