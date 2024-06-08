import React, { Component } from 'react';
import './styles/AddressDisplay.css';
import axios from 'axios'
import AddressDisplayHelper from './AddressDisplayHelper';

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
            bestPathDistanceLink: '',

            calculateStatus: 'no-status',
            avoidTollCheck: false
        }



        this.changeHandler = this.changeHandler.bind(this)

        this.addInput = this.addInput.bind(this)
        this.removeInput = this.removeInput.bind(this)
        this.handleInputChange = this.handleInputChange.bind(this)
        this.calculate = this.calculate.bind(this)
        this.formatGoogleMapsRoute = this.formatGoogleMapsRoute.bind(this)
        this.validateStartEndAddress = this.validateStartEndAddress.bind(this)
        this.changeTollStatus = this.changeTollStatus.bind(this)
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.places !== this.state.places) {
            this.setState({
                calculateStatus: 'no-status'
            })
        }
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
        for (let i = 0; i < this.state.places.length; i++) {
            if (this.state.places[i].length === 0) {
                emptyPlaces.push(i + 1)
            }
        }
        if (emptyPlaces.length > 0) {
            alert(`Input(s) ${emptyPlaces.join(', ')} are empty`);
            return
        }

        // more than 25 intermediates
        const totalIntermediates = this.state.places.reduce((acc, innerList) => acc + innerList.length, 0);
        if (totalIntermediates >= 25) {
            alert('Please choose no more than 25 intermediates')
            return
        }


        // style calculate button
        this.setState({
            calculateStatus: 'calculate-button-calculating'
        })

        // make api request
        let optimalPaths = await this.fetchOptimalPaths(this.props.startAddress, this.props.endAddress, this.state.places, this.state.avoidTollCheck)

        this.setState({
            bestPathTime: optimalPaths.data.optimalPathTime,
            bestPathDistance: optimalPaths.data.optimalPathDistance
        }, () => {
            console.log(this.state.bestPathDistance)
            console.log(typeof (this.state.bestPathDistance))
            console.log(this.state.bestPathDistance.length)
            const timeLink = this.formatGoogleMapsRoute(this.state.bestPathTime)
            console.log(timeLink)

            const distLink = this.formatGoogleMapsRoute(this.state.bestPathDistance)
            console.log(distLink)
            this.setState({
                bestPathTimeLink: timeLink,
                bestPathDistanceLink: distLink,
                calculateStatus: 'calculate-button-done'
            })
        })
    }

    fetchOptimalPaths = (startAddress, endAddress, places, avoidToll) => {
        const url = '/optimal_path'

        let params = {
            startAddress: startAddress,
            endAddress: endAddress,
            places: places,
            avoidToll: avoidToll
        }
        return new Promise((resolve, reject) => {
            axios.post(url, params)
                .then(response => {
                    resolve(response)
                })
                .catch(error => {
                    reject(error)
                })
        })
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

    changeTollStatus = (e) => {
        this.setState({
            avoidTollCheck: e.target.checked
        });
    }


    render() {

        const startAddress = this.props.startAddress
        const endAddress = this.props.endAddress
        const places = this.state.places
        const apiKey = this.state.apiKey
        const avoidTollCheck = this.state.avoidTollCheck

        return (

            <div>
                <div id='buttons-container'>
                    <button onClick={this.addInput}>Add Input</button>
                    <button onClick={this.removeInput}>Remove Input</button>
                    <button onClick={() => console.log(this.state.places)}>Reveal all locations</button>
                    <button id={this.state.calculateStatus} onClick={this.calculate}>Calculate</button>
                    <label>
                        <input
                            type="checkbox"
                            checked={avoidTollCheck}
                            onChange={this.changeTollStatus}
                        />
                        Avoid tolls
                    </label>

                </div>
                <a href={this.state.bestPathTimeLink} target="_blank" rel="noopener noreferrer">
                    Best Time
                </a>
                <a href={this.state.bestPathDistanceLink} target="_blank" rel="noopener noreferrer">
                    Best Distance
                </a>

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
