import React, { Component } from 'react';
import './navbar.css';
import './sensorElementary.css'

class Sensor extends Component {

    render() {
        const {id,type,interval} = this.props;

        return (
            <div className="sensor-card">
                <div className="sensor-content">
                    <h3>Device info:</h3>
                    <h4>ID: {id}</h4>
                    <h4>Type: {type}</h4>
                    <h4>Interval: {interval}ms</h4>
                </div>
            </div>
        );
    }
}
export default Sensor;