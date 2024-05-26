import React, { Component } from 'react'

class StartEnd extends Component {
	constructor(props) {
		super(props)

		this.state = {
			start: props.start,
			end: props.end,
		}
	}

    changeHandler = (e) => {
        const { name, value } = e.target;
        const [key, coordinate] = name.split('_');

        this.setState((prevState) => ({
            [key]: {
                ...prevState[key],
                [coordinate]: parseFloat(value),
            },
        }));
    };

	submitHandler = e => {
		e.preventDefault()
		const { start, end } = this.state;
		console.log(start)
		console.log(end)
		this.props.updateStart(start);
		this.props.updateEnd(end);
	}

	render() {
		const { start, end } = this.state
		const { lat: startLat, lng: startLng } = start
		const { lat: endLat, lng: endLng } = end
		return (
			<div>
                <form onSubmit={this.submitHandler}>
                    <div>
						<label>StartLat</label>
                        <input
                            type="number"
                            name="start_lat"
                            value={startLat}
                            onChange={this.changeHandler}
                        />
                    </div>
                    <div>
						<label>StartLng</label>
                        <input
                            type="number"
                            name="start_lng"
                            value={startLng}
                            onChange={this.changeHandler}
                        />
                    </div>
					<div>
						<label>EndLat</label>
                        <input
                            type="number"
                            name="end_lat"
                            value={endLat}
                            onChange={this.changeHandler}
                        />
                    </div>
                    <div>
						<label>EndLng</label>
                        <input
                            type="number"
                            name="end_lng"
                            value={endLng}
                            onChange={this.changeHandler}
                        />
                    </div>
                    <button type="submit">Submit</button>
                </form>
			</div>
		)
	}
}

export default StartEnd

