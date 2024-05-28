import React, { Component } from 'react'
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

            places: props.places
        }

        this.changeHandler = this.changeHandler.bind(this)
        this.findEstablishment = this.findEstablishment.bind(this)
        this.handleAddressChange = this.handleAddressChange.bind(this)
    }   

    changeHandler = (e) => {
        const value = e.target.value
        this.setState({
            keyword: value
        })
    };

    findEstablishment = () => {

        const startAddress = this.props.startAddress
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

    handleAddressChange = () => {
        const position = this.state.position
        const places = this.state.places
        this.props.updatePlace(position, places);
    };



    render() {
        const startAddress = this.state.startAddress
        const endAddress = this.state.endAddress
        const keyword = this.state.keyword
        const places = this.state.places
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
                        ? places.map(place => <div><p>{place.name}</p><p>{place.address}</p></div>)
                        : null}
                </div>
                <button onClick={this.handleAddressChange}>Confirm</button>
            </React.Fragment>
        )
    }
}

export default AddressDisplayHelper
