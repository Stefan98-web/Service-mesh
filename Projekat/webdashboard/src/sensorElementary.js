import React, { Component } from 'react';
import './navbar.css';
import './sensorElementary.css'

class Sensor extends Component {

    render() {
        const {BeachName,MeasurementTimestamp,WaterTemperature,Turbidity,TransducerDepth,WaveHeight,
        WavePeriod,BatteryLife,MeasurementTimestampLabel} = this.props;

        return (
            <div className="sensor-card">
                <div className="sensor-content">
                    <h3>{BeachName}</h3>
                    <h4>Measurement Timestamp: {MeasurementTimestamp}</h4>
                    <h4>Water Temperature: {WaterTemperature}°C</h4>
                    <h4>Turbidity: {Turbidity}</h4>
                    <h4>Transducer Depth: {TransducerDepth}</h4>
                    <h4>Wave Height: {WaveHeight}m</h4>
                    <h4>Wave Period: {WavePeriod}s</h4>
                    <h4>Battery Life: {BatteryLife}%</h4>
                    <h4>Measurement Timestamp Label: {MeasurementTimestampLabel}</h4>
                </div>
            </div>
        );
    }
}
export default Sensor;