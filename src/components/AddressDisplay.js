import React from 'react'
import './styles/AddressDisplay.css'

function AddressDisplay({ places, deleteAddress }) {

    const placesCol1 = places.slice(0, 5)
    const placesCol2 = places.slice(5)

    return (
        <div id='display'>
            <div id='display-container'>
                {placesCol1.length
                    ? placesCol1.map((place, index) => 
                    <div>
                        <p>{place.name}</p>
                        <button key={index} id={index} onClick={deleteAddress}>{place.address}</button>
                    </div>)
                    : null}
            </div>


            <div id='display-container'>
                {placesCol2.length
                    ? placesCol2.map((place, index) => 
                    <div>
                        <p>{place.name}</p>
                        <button key={index+5} id={index+5} onClick={deleteAddress}>{place.address}</button>
                    </div>)
                    : null}
            </div>
        </div>
    )
}

export default AddressDisplay
