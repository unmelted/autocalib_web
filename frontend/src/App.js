import React, { Component } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import './css/App.css';
import AutoCalib from './components/auto_calib';

class App extends Component {

  render() {
    return (
      <div className="App">
        <nav class="navbar navbar-dark bg-dark py-3">
        </nav>
        <Container>
          <Row>
            <Col xs lg="3">
              <Row id="upper-row1">

                <img
                  // align="left"
                  className="mobile"
                  src="https://4dreplay.com/4d/wp-content/uploads/2021/10/logo_white-2.png"
                  alt="Logo"
                  style={{ height: '100%' }}
                />
              </Row>

              <Row id="upper-row2">
                <h3>Auto Calibration</h3>
              </Row>
              <Row id="body-row">
                <p>Create Task</p>
                <p>Search Task</p>
              </Row>
            </Col>
            <Col xs={9}>
              {/* (wider) block for test */}
              <AutoCalib />
            </Col>
          </Row>
        </Container>
        <div className="container center">
          <p></p>
          <table>
            <tbody>
              <tr>
                <td colSpan="2">
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