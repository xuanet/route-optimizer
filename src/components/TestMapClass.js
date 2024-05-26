import React, { Component } from 'react'
// import { APIProvider, Map, Marker, AdvancedMarker } from '@vis.gl/react-google-maps';
import { LoadScript, GoogleMap, Marker } from '@react-google-maps/api';
import './styles/TestMapStyles.css'

const mapContainerStyle = {
    width: '100%',
    height: '400px',
  };
  
  const libraries = ['places'];

class TestMapClass extends Component {

    constructor(props) {
        super(props)

        this.state = {
            start: { lat: parseFloat(props.start.lat), lng: parseFloat(props.start.lng) },
            end: { lat: parseFloat(props.end.lat), lng: parseFloat(props.end.lng) },
            apiKey: props.apiKey
        }
    }

    componentDidMount() {
        console.log(this.state.start)
    }

    render() {
        const { start, end } = this.state
        return (
            <div id='map-container'>
                <LoadScript googleMapsApiKey={this.state.apiKey} libraries={libraries}>
                    <GoogleMap
                        mapContainerStyle={mapContainerStyle}
                        center={start}
                        zoom={9}
                    >
                        <Marker position={start} />
                        <Marker position={end} />
                    </GoogleMap>
                </LoadScript>
            </div>
        )
    }
}

export default TestMapClass
