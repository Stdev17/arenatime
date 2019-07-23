import React from 'react';
import {
  Modal,
  Card,
  Button
} from 'react-bootstrap';
import { Cutter } from './Cutter.js';
import { Party } from './Party.js';

import '../css/daum.css';
import '../css/text.css';

export var party = [];

export class SetParty extends React.Component {

  constructor(props, context) {
    super(props, context);

    this.state = {
      show: false,
    };

    this.handleShow = () => {
      this.setState({ show: true });
    };

    this.handleHide = () => {
      this.setState({ show: false });
    };
  }

  mainText = {
    fontFamily: 'Daum',
    fontStyle: 'normal',
    fontSize: 14,
    fontColor: '#333333'
  }
  

  render() {
    return (
      <div>
        {"대상 파티  "}
        <Button variant="primary" onClick={this.handleShow}>
          파티 설정
        </Button>
        <br/>
        <br/>
        <Party party={party}/>

        <Modal
          show={this.state.show}
          onHide={this.handleHide}
          dialogClassName="modal-90w"
          aria-labelledby="example-custom-modal-styling-title"
        >

            <Modal.Header>
              <Modal.Title>
                파티 설정
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Cutter/>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="primary" onClick={this.handleHide}>파티 저장</Button>
            </Modal.Footer>

        </Modal>
      </div>
    );
  }

}
