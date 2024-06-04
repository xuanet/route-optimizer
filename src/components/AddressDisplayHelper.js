import React, { Component } from 'react'
import { Autocomplete } from '@react-google-maps/api';
import axios from 'axios'
import './styles/AddressDisplayHelperStyles.css'

export class AddressDisplayHelper extends Component {

    constructor(props) {
        super(props)

        this.state = {
            position: props.position,
            keyword: '',
            startAddress: props.startAddress,
            endAddress: props.endAddress,
            apiKey: props.apiKey,

            places: props.places,
            googleMapsLoaded: false,

            apiKey: 'AIzaSyBSxhXCH1UBbtgc9CmobRec-gRLt_MHb1Q'
        }

        this.changeHandler = this.changeHandler.bind(this)
        this.findEstablishment = this.findEstablishment.bind(this)
        this.handleAddressChange = this.handleAddressChange.bind(this)
        this.deleteAddress = this.deleteAddress.bind(this)
        this.handleLoadScriptSuccess = this.handleLoadScriptSuccess.bind(this)
        this.setApiState = this.setApiState.bind(this)
        this.handleLoadStart = this.handleLoadStart.bind(this)
        this.addAddress = this.addAddress.bind(this)
    }



    changeHandler = (e) => {
        const value = e.target.value
        this.setState({
            keyword: value
        })
    };

    findEstablishment = async () => {



        const startAddress = this.props.startAddress
        const endAddress = this.props.endAddress
        const keyword = this.state.keyword
        const apiKey = this.state.apiKey
        // Define the parameters for the Nearby Search request
        let params = {
            location: `${startAddress.lat},${startAddress.lng}`,
            // radius: '20000',
            rankby: 'distance',
            keyword: `${keyword}`, // e.g., 'restaurant', 'supermarket', etc.
            key: `${apiKey}`
        };

        let matches = []

        // Make the Nearby Search request
        const url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';

        await axios.get(url, { params })
            .then(response => {
                // Process the results
                const places = response.data.results;
                const reducedPlaces = places.slice(0, Math.min(places.length, 10))
                matches.push(...reducedPlaces)
                console.log('start near length', reducedPlaces.length)
            })
            .catch(error => {
                console.error('Error:', error);
            })

        // variable names must be params for API

        params = {
            location: `${endAddress.lat},${endAddress.lng}`,
            // radius: '20000',
            rankby: 'distance',
            keyword: `${keyword}`, // e.g., 'restaurant', 'supermarket', etc.
            key: `${apiKey}`
        };

        await axios.get(url, { params })
            .then(response => {
                // Process the results
                const places = response.data.results;
                const reducedPlaces = places.slice(0, Math.min(places.length, 10))
                matches.push(...reducedPlaces)
                console.log('end near length', reducedPlaces.length)
            })
            .catch(error => {
                console.error('Error:', error);
            })

        const uniquePlaces = this.filterUniquePlaces(matches)
        this.setState({
            places: uniquePlaces
        })
    }

    filterUniquePlaces = (places) => {
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

    handleAddressChange = () => {
        const position = this.state.position
        const places = this.state.places
        this.props.updatePlace(position, places);
    };

    deleteAddress = (e) => {
        const id = e.target.id
        const updatedPlaces = [...this.state.places]
        updatedPlaces.splice(id, 1)
        this.setState({
            places: updatedPlaces
        })
    }

    handleLoadScriptSuccess = () => {
        console.log('faggot')
        this.setState({ googleMapsLoaded: true });
    };

    handleLoadStart(autocompleteInstance) {
        this.autocomplete = autocompleteInstance;
        this.autocomplete.setTypes(['address']); // Restrict to address types and establishment
        console.log('autocomplete start loaded')
    }

    setApiState = () => {
        this.setState({
            apiKey: 'AIzaSyBSxhXCH1UBbtgc9CmobRec-gRLt_MHb1Q'
        })
    }

    addAddress = () => {
        if (this.autocomplete) {
            const place = this.autocomplete.getPlace()
            const tempPlace = this.state.places
            tempPlace.push({
                name: place.name,
                address: place.formatted_address,
                location: place.geometry.location
            })
            this.setState({
                places: tempPlace,
            })
        }
    }


    render() {
        const startAddress = this.state.startAddress
        const endAddress = this.state.endAddress
        const keyword = this.state.keyword
        const places = this.state.places

        const libraries = ['places'];
        const apiKey = this.state.apiKey

        return (
            <React.Fragment>

                <div id='combined'>

                    <div id='find-establishment-container'>
                        <input
                            type="text"
                            name="keyword"
                            value={keyword}
                            onChange={this.changeHandler}
                            placeholder="Enter keyword..."
                        />
                        <button id='find-establishment-button' onClick={this.findEstablishment}>Find establishment</button>
                    </div>

                    <div id='autocomplete-search'>
                        <Autocomplete onLoad={this.handleLoadStart}>
                            <input
                                type="text"
                                ref={this.inputRefStart}
                                placeholder="Enter new address..."
                            />
                        </Autocomplete>
                        <button id='add-address-button' onClick={this.addAddress}>Add address</button>
                        <button id='confirm-button' onClick={this.handleAddressChange}>Confirm</button>
                    </div>

                </div>

                <div id='address-display'>
                    {places.length
                        ? places.map((place, index) => <div>
                            <p>{place.name}</p>
                            <button key={index} id={index} onClick={this.deleteAddress}>{place.address}</button>
                        </div>)
                        : null}
                </div>




            </React.Fragment>
        )
    }
}

export default AddressDisplayHelper
