import React, { Component } from 'react';
import SensorList from './sensorDataList';
class InputsData extends Component {
    static defaultProps = {
        action: "http://172.22.90.35:31516/beachinfo",
        method: "PUT",
        onClose() {}
    }
    constructor(props) {
        super(props);
        this.state = {
            BeachName: "All",
            WaterTemperature: "All",
            WavePeriod: "All",
            BatteryLife: "All",
            data: []
        }
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }
    handleChange(e) {
        this.setState({ [e.target.name]: e.target.value });
    }
    handleSubmit(e) {
        e.preventDefault();

        let options = {
            method: 'PUT',
            headers: {
                'content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify(this.state)
          }
    
        fetch(this.props.action,options)
            .then(res => res.json())
            .then((result) => {
                    this.setState({ data: result})

                },(error) => {
                    this.setState({
                        isLoaded: true,
                        error
                    });
                }
            )
    }
    render() {
        const {onClose} = this.props;
        const sensorsData= this.state.data;
        return (
        <div>
            <div style={{ width: "35%", margin: "auto" }}>
                <h2 style={{ textAlign: "center" }}>Beach info</h2>
                <div>
                
                <form action={this.props.action} method={this.props.method} onSubmit={this.handleSubmit} >
                    <div>
                    <label>Select beach name:   </label>
                    <select className="form-select" name="BeachName" value={this.state.BeachName} onChange={this.handleChange}>
                        <option value="Montrose Beach">Montrose Beach</option>
                        <option value="Ohio Street Beach">Ohio Street Beach</option>
                        <option value="Calumet Beach">Calumet Beach</option>
                        <option value="Osterman Beach">Osterman Beach</option>
                        <option value="Rainbow Beach">Rainbow Beach</option>
                        <option value="63rd Street Beach">63rd Street Beach</option>
                    </select>
                    </div>
                    <div>
                    <label>Water temperature:</label>
                    <div ><input type='number' step="0.1" min="0" className='form-control' name='WaterTemperature' value={this.state.WaterTemperature} onChange={this.handleChange} /></div>
                    </div>
                    <div>
                    <label>Battery life:</label>
                    <div ><input type='number' step="0.1" min="0" className='form-control' name='BatteryLife' value={this.state.BatteryLife} onChange={this.handleChange}/></div>
                    </div>
                    <div>
                    <label>Wave period:</label>
                    <div ><input type='number' min="0" className='form-control' name='WavePeriod' value={this.state.WavePeriod} onChange={this.handleChange}/></div>
                    </div>
                    <div > <button className='btn btn-lg btn-info btn-block form-control' type='submit' style={{ marginTop: "5%" }} onClick={this.onSubmit}>Get data</button>  </div>
                </form>
                <button
                    type="button"
                    className='btn btn-lg btn-info btn-block form-control'
                    onClick={onClose}>Cancel</button>
                </div>
            </div>
            <SensorList sensors={sensorsData}/>
        </div>
            )
    }
}
export default InputsData;