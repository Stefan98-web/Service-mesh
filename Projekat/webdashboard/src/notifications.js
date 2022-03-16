import React, { Component } from 'react';
import socketIOClient from "socket.io-client";

let socket;

class Notifications extends Component {
    constructor(props) {
        super(props);
        this.state = {
            warnings: "",
        }
        this.handleChange = this.handleChange.bind(this);
    }
    handleChange(e) {
        this.setState({ warnings: e.info});
    }
    componentDidMount() {

        socket = socketIOClient("http://172.23.56.192:31516");
        socket.on('Notification', (data) => {
            this.handleChange(data);
        })
    }
    componentWillUnmount() {
        socket.disconnect();
    }
    render() {
        const Notification = this.state.warnings;
        return (
        <div style={{ textAlign: "center" }}>
            <h1> Notification:</h1>
            <h2>{Notification}</h2>
        </div>)
    }
}
export default Notifications;