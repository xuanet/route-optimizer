import React, { useEffect, useState} from 'react'
import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';
import './styles/TestMapStyles.css'


function TestMap({ startAddress, endAddress, apiKey} ) {

    // useEffect(() => {
    //     console.log('start updated', startAddress)
    // }, [startAddress])

    // useEffect(() => {
    //     console.log('end updated', endAddress)
    // }, [endAddress])

    console.log(startAddress)
    
    return (

        <APIProvider apiKey={apiKey}>
            <div id='map-container'>
                <Map className='map' center={{lat: startAddress.lat, lng: startAddress.lng}} zoom={9}>
                    <Marker key='1' position={{lat: startAddress.lat, lng: startAddress.lng}} />
                    <Marker key='2' position={{lat: endAddress.lat, lng: endAddress.lng}} />
                </Map>
            </div>
        </APIProvider>
    );
}

export default TestMap;