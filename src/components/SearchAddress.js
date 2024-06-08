import React, { Component } from 'react';
import { Autocomplete } from '@react-google-maps/api';
import './styles/SearchAddressStyles.css'

const libraries = ['places'];

class SearchAddress extends Component {
    constructor(props) {
        console.log('props for SearchAddress', props)
        super(props);
        this.autocomplete = null;
        this.inputRefStart = React.createRef();
        this.inputRefEnd = React.createRef();

        this.handleStartChanged = this.handleStartChanged.bind(this)
        this.handleEndChanged = this.handleEndChanged.bind(this)
        this.handleLoadStart = this.handleLoadStart.bind(this)
        this.handleLoadEnd = this.handleLoadEnd.bind(this)

    }


    handleLoadStart = (autocompleteInstance) => {
        this.autocompleteStart = autocompleteInstance;
        this.autocompleteStart.setTypes(['address']); // Restrict to address types and establishment
    };

    handleLoadEnd = (autocompleteInstance) => {
        this.autocompleteEnd = autocompleteInstance;
        this.autocompleteEnd.setTypes(['address']); // Restrict to address types and establishment
    };



    handleStartChanged = () => {
        if (this.autocompleteStart) {
            const place = this.autocompleteStart.getPlace();
            try {
                this.props.selectStart(place);
            }
            catch {
                alert('Please enter valid start address')
            }
        } else {
            console.log('Autocomplete start is not loaded yet!');
        }
    };

    handleEndChanged = () => {
        if (this.autocompleteEnd) {
            const place = this.autocompleteEnd.getPlace();
            try {
                this.props.selectEnd(place);
            }
            catch {
                alert('Please enter valid end address')
            }
        } else {
            console.log('Autocomplete end is not loaded yet!');
        }
    };


    render() {
        const apiKey = this.props.apiKey;
        return (
            <React.Fragment>
                    <div id='autocomplete-box'>
                        <Autocomplete libraries={libraries} onLoad={this.handleLoadStart}>
                            <input
                                type="text"
                                ref={this.inputRefStart}
                                placeholder="Enter start address..."
                            />
                        </Autocomplete>
                        <button onClick={this.handleStartChanged}>Update Start</button>
                    </div>
                    
                    <div id='autocomplete-box'>
                        <Autocomplete libraries={libraries} onLoad={this.handleLoadEnd}>
                            <input
                                type="text"
                                ref={this.inputRefEnd}
                                placeholder="Enter end address..."
                            />
                        </Autocomplete>
                        <button onClick={this.handleEndChanged}>Update End</button>
                    </div>
            </React.Fragment>
        );
    }
}

export default SearchAddress
