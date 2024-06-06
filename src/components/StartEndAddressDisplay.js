import React from 'react'

function StartEndAddressDisplay({ startAddress, endAddress }) {
  return (
    <React.Fragment>
        <p>Start Address: {startAddress.address}</p>
        <p>End Address: {endAddress.address}</p>
    </React.Fragment>
  )
}

export default StartEndAddressDisplay
