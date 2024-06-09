import React, { Component } from 'react'
import { Autocomplete } from '@react-google-maps/api';
import axios from 'axios'
import './styles/AddressDisplayHelperStyles.css'
import PAD from './PAD';

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
        this.validateStartEndAddress = this.validateStartEndAddress.bind(this)
    }



    changeHandler = (e) => {
        const value = e.target.value
        this.setState({
            keyword: value
        })
    };

    validateStartEndAddress = (startAddress, endAddress) => {
        return ((startAddress.lat === 0 && startAddress.lng === 0) || (endAddress.lat === 0 && endAddress.lng === 0)) ? false : true
    }

    fetchPlaces = (startAddress, endAddress, keyword, apiKey) => {
        const url = '/fetch_places'

        let params = {
            startAddress: startAddress,
            endAddress: endAddress,
            keyword: keyword,
            apiKey: apiKey
        };

        return new Promise((resolve, reject) => {
            axios.post(url, params, { timeout: 5000 })
                .then(response => {
                    resolve(response)
                })
                .catch(error => {
                    reject(error)
                })
        })
    }

    findEstablishment = async () => {
        const startAddress = this.props.startAddress
        const endAddress = this.props.endAddress

        if (!this.validateStartEndAddress(startAddress, endAddress)) {
            alert('Please set start and end address')
            return
        }

        const keyword = this.state.keyword
        const apiKey = this.state.apiKey

        // make api request

        try {
            let foundPlaces = await this.fetchPlaces(startAddress, endAddress, keyword, apiKey)
            this.setState({
                places: foundPlaces.data
            }, () => {
                this.handleAddressChange()
            })
        }
        catch {
            alert('Server error')
        }
    }


    handleAddressChange = () => {
        const position = this.state.position
        const places = this.state.places

        // if (places.length === 0) {
        //     alert("Please include at least 1 location or remove input")
        //     return
        // }

        this.props.updatePlace(position, places);
    };

    deleteAddress = (e) => {
        const id = e.target.id
        const updatedPlaces = [...this.state.places]
        updatedPlaces.splice(id, 1)
        this.setState({
            places: updatedPlaces
        }, () => {
            this.handleAddressChange()
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
            }, () => {
                this.handleAddressChange()
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

                <div id='all'>

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
                                <input id='autocomplete-input'
                                    type="text"
                                    ref={this.inputRefStart}
                                    placeholder="Enter new address..."
                                />
                            </Autocomplete>
                            <button id='add-address-button' onClick={this.addAddress}>Add address</button>
                            {/* <button id='confirm-button' onClick={this.handleAddressChange}>Confirm</button> */}
                        </div>

                    </div>
                    <PAD places={places} deleteAddress={this.deleteAddress}></PAD>
                </div>



            </React.Fragment>
        )
    }
}

export default AddressDisplayHelper
