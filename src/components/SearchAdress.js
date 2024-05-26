import React, { Component } from 'react';
import { LoadScript, Autocomplete } from '@react-google-maps/api';

const libraries = ['places'];

class SearchAddress extends Component {
    constructor(props) {
        super(props);
        this.autocomplete = null;
        this.inputRef = React.createRef();

        this.handleStartChanged = this.handleStartChanged.bind(this)
        this.handleEndChanged = this.handleEndChanged.bind(this)
    }

    handleLoadStart = (autocompleteInstance) => {
        this.autocompleteStart = autocompleteInstance;
        this.autocompleteStart.setTypes(['address']); // Restrict to address types and establishment
        console.log('autocomplete start loaded')
    };

    handleLoadEnd = (autocompleteInstance) => {
        this.autocompleteEnd = autocompleteInstance;
        this.autocompleteEnd.setTypes(['address']); // Restrict to address types and establishment
        console.log('autocomplete end loaded')
    };



    handleStartChanged = () => {
        if (this.autocompleteStart) {
            const place = this.autocompleteStart.getPlace();
            this.props.selectStart(place);
        } else {
            console.log('Autocomplete start is not loaded yet!');
        }
    };

    handleEndChanged = () => {
        if (this.autocompleteEnd) {
            const place = this.autocompleteEnd.getPlace();
            this.props.selectEnd(place);
        } else {
            console.log('Autocomplete end is not loaded yet!');
        }
    };


    render() {
        const apiKey = this.props.apiKey;
        return (
            <React.Fragment>
                <LoadScript googleMapsApiKey={apiKey} libraries={libraries}>
                    <label>Start</label>
                    <Autocomplete libraries={libraries} onLoad={this.handleLoadStart}>
                        <input
                            type="text"
                            ref={this.inputRef}
                            placeholder="Search start address..."
                            style={{ width: '40%', height: '40px', padding: '10px' }}
                        />
                    </Autocomplete>
                    <button onClick={this.handleStartChanged}>Update Start</button>
                    <label>End</label>
                    <Autocomplete libraries={libraries} onLoad={this.handleLoadEnd}>
                    <input
                        type="text"
                        ref={this.inputRef}
                        placeholder="Search places..."
                        style={{ width: '40%', height: '40px', padding: '10px' }}
                    />
                    </Autocomplete>
                    <button onClick={this.handleEndChanged}>Update End</button>
                </LoadScript>
            </React.Fragment>
        );
    }
}

export default SearchAddress
