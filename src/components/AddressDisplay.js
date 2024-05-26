import React, { Component } from 'react';
import './styles/AddressDisplay.css';

class AddressDisplay extends Component {
    constructor(props) {
        super(props)

        this.state = {
            addresses: props.addresses
        }
    }

    render() {

        const addresses = this.props.addresses

        console.log(addresses)
        console.log(this.props.addresses)

        return (
            <div id='address-display'>
                List of post
                {addresses.length
                    ? addresses.map(post => <div key={post.id}>{post.address}</div>)
                    : null}
            </div>
        );
    }
}

export default AddressDisplay;
