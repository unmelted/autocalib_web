import React, { Component } from 'react';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import './css/App.css';
import AutoCalib from './components/create_task';

class App extends Component {

  render() {
    return (
      <div className="App">
        <div className="container center">
          <p></p>
          <table>
            <tbody>
              <tr>
                <td colSpan="2">
                  <img
                    className="mobile"
                    src="https://4dreplay.com/4d/wp-content/uploads/2021/10/logo_white-2.png"
                    alt="Logo"
                    style={{ height: '100%' }} />
                  <h1>Auto Calibration</h1>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <AutoCalib />
        {/* <CanvasComponent /> */}
      </div>

    );
  }
}

export default App;