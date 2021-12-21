import React, {Component} from 'react';
import SensorElementary from './sensorElementary';
import './sensorDataList.css'
import PropTypes from 'prop-types';

class SensorList extends Component{
    static defaultProps ={
        sensors:[]
    }

    static propTypes = {
        sensors:PropTypes.arrayOf(PropTypes.object)
    }
    render(){
        const sensors = this.props.sensors.map((s,index)=>(
            <SensorElementary key={index} BeachName={s["Beach Name"]} MeasurementTimestamp={s["Measurement Timestamp"]} WaterTemperature={s["Water Temperature"]} Turbidity={s["Turbidity"]} TransducerDepth={s["Transducer Depth"]} WaveHeight={s["Wave Height"]}
            WavePeriod={s["Wave Period"]} BatteryLife={s["Battery Life"]} MeasurementTimestampLabel={s["Measurement Timestamp Label"]}/>
        ));
            return(
                <div className="sensor-list">
                    {sensors}
                </div>
            )
    }
}
export default SensorList;
