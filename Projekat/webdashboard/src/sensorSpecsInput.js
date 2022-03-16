import React, { Component } from 'react';
import SensorSpecs from './sensorSpecs';

class SensorSpecsInput extends Component {
    static defaultProps = {
        action: "http://172.22.90.35:31516/sensorinfo",
        method: "PUT",
        onClose() {}
    }
    constructor(props) {
        super(props);
        this.state = {
            id: 0,
            type: "All",
            interval: 0,
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
            body: JSON.stringify({"id":this.state.id})
          }
          
        fetch(this.props.action,options)
            .then(res => res.json())
            .then((result) => {
                    this.setState({ id: result.message.id, type:result.message.type, interval:result.message.interval})

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
        const sensorSpecs= this.state;
        return (
        <div>
            <div style={{ width: "35%", margin: "auto" }}>
                <h1 style={{ textAlign: "center" }}>Sensor info</h1>
                <div>
                
                <form action={this.props.action} method={this.props.method} onSubmit={this.handleSubmit} >
                    <div>
                    <label>Insert sensor ID:   </label>
                    <div><input type='number' min="1" max="2" className='form-control' name='id' value={this.state.id} onChange={this.handleChange} /></div>
                    </div>
                    <div>
                    <div> <button className='btn btn-lg btn-info btn-block form-control' type='submit' style={{ marginTop: "5%" }} onClick={this.onSubmit}>Get data</button>  </div>
                    <div><button type="button" className='btn btn-lg btn-info btn-block form-control' onClick={onClose}> Cancel </button></div>
                    </div>
                </form>
               </div>
            </div>
            <SensorSpecs id={sensorSpecs.id} type={sensorSpecs.type} interval={sensorSpecs.interval}/>
        </div>
            )
    }
}
export default SensorSpecsInput;