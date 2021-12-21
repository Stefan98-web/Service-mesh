  
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './navbar.css';

class Navbar extends Component {
    static defaultProps = {
        onNewInput() {},
        onGet() {},
        onNotifs() {}
    }
    static propTypes = {
        onNewInput: PropTypes.func,
        onGet: PropTypes.func
    }

    render() {
        return (
            <header>
                <h2> <a>Beach water quality</a> </h2>
                <nav>
                    <li> <a onClick={this.props.onGet}>Get data from sensors</a> </li>
                    <li> <a onClick={this.props.onNewInput}>Search</a> </li>
                    <li> <a onClick={this.props.onNotifs}>Notifications</a> </li>
                </nav>
            </header>
        );
    }
}
export default Navbar;