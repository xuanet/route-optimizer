import React, { Component } from 'react'
import { LoadScript, Autocomplete } from '@react-google-maps/api';
import axios from 'axios'

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
    }   

    

    changeHandler = (e) => {
        const value = e.target.value
        this.setState({
            keyword: value
        })
    };

    findEstablishment = () => {

        const startAddress = this.props.startAddress
        const keyword = this.state.keyword
        const apiKey = this.state.apiKey
        // Define the parameters for the Nearby Search request
        const params = {
            location: `${startAddress.lat},${startAddress.lng}`,
            // radius: '10000',
            rankby: 'distance',
            keyword: `${keyword}`, // e.g., 'restaurant', 'supermarket', etc.
            key: `${apiKey}`
        };

        // Make the Nearby Search request
        const url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';

        axios.get(url, { params })
            .then(response => {
                // Process the results
                const places = response.data.results;
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
            console.log(place)
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
            }
        });

        return uniquePlaces.slice(0, Math.min(uniquePlaces.length, 10));
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

    handleStartChanged = () => {
        // Handle start address change
    };

    handleLoadStart() {
        console.log('search bar started')
    }

    setApiState = () => {
        this.setState({
            apiKey: 'AIzaSyBSxhXCH1UBbtgc9CmobRec-gRLt_MHb1Q'
        })
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
                <input
                    type="text"
                    name="keyword"
                    value={keyword}
                    onChange={this.changeHandler}
                />
                <button onClick={this.findEstablishment}>Find establishment</button>
                <div id='address-display'>
                    Places:
                    {places.length
                        ? places.map((place, index) => <div><p>{place.name}</p><button id={index} onClick={this.deleteAddress}>{place.address}</button></div>)
                        : null}
                </div>
                <button onClick={this.handleAddressChange}>Confirm</button>


                <LoadScript
                    googleMapsApiKey={apiKey}
                    libraries={libraries}
                    onLoad={this.handleLoadScriptSuccess}
                >
                    {this.state.googleMapsLoaded ? (
                        <div id='autocomplete-box'>
                            <label>Start</label>
                            <Autocomplete libraries={libraries} onLoad={this.handleLoadStart}>
                                <input
                                    type="text"
                                    ref={this.inputRefStart}
                                    placeholder="Search start address..."
                                />
                            </Autocomplete>
                            <button onClick={this.handleStartChanged}>Update Start</button>
                        </div>
                    ) : (
                        <div>Loading...</div>
                    )}
                </LoadScript>
                <button onClick={this.setApiState}>Refresh autocomplete</button>
            </React.Fragment>
        )
    }
}

export default AddressDisplayHelper
