import Navbar from './navbar';
import './App.css';
import InputsData from './inputsData';
import SensorSpecs from './sensorSpecsInput';
import Notifications from './notifications';
import React from 'react';

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
        showForm:false,
        showGet:false,
        showNotifs:false
    }
}//onGet={()=>this.setState({showGet: true,showForm: false})}
render(){
  const {showForm}= this.state;
  const {showGet}= this.state;
  const {showNotifs}= this.state;
  return (
    
    <div className="App">
      <Navbar onNewInput ={()=>this.setState({showForm: true,showGet:false,showNotifs:false})} onGet={()=>this.setState({showGet: true,showForm: false,showNotifs:false})} onNotifs={()=>this.setState({showNotifs:true, showGet: false, showForm: false})}/>
      {showForm ? 
      <InputsData onClose={()=>this.setState({showForm:false})}/>
      : null}
      {showGet ? 
      <SensorSpecs onClose={()=>this.setState({showGet:false})}/>
      : null}
      {showNotifs ? 
      <Notifications onClose={()=>this.setState({showNotifs:false})}/>
      : null}
    </div>
  );
}
}

export default App;
