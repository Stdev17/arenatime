import React from 'react';
import {
  Modal,
  Button,
  Form,
  Col
} from 'react-bootstrap';
import { Cutter } from './Cutter.js';
import { MobParty } from './MobParty.js';
import { char } from '../util/char_parse.js';

import '../css/daum.css';
import '../css/mobile.css';
import '../css/SetParty.css';

export class MobSetParty extends React.Component {

  constructor(props, context) {
    super(props, context);

    this.inputHandler = this.inputHandler.bind(this);
    this.addParty = this.addParty.bind(this);

    this.state = {
      show: false,
      text: "대상 파티  ",
      p: this.props.party,
      char: "Empty"
    };

    this.handleShow = () => {
      this.setState({ show: true });
    };

    this.handleHide = () => {
      this.setState({ show: false });
    };

    this.clearParty = () => {
      let p = this.props.party;
      p.splice(0, p.length);
      this.forceUpdate();
    }
  }

  mainText = {
    fontFamily: 'Daum',
    fontStyle: 'normal',
    fontSize: 14,
    fontColor: '#333333'
  }
  
  componentDidMount() {
    if (this.props.handle === "def") {
      this.setState({ text: "방어 파티  "});
    }
    if (this.props.handle === "att") {
      this.setState({ text: "공격 파티  "});
    }
  }

  inputHandler(e) {
    this.setState({
      char: e.target.value
    })
  }

  addParty() {
    if (!(this.state.char in char)) {
      return;
    }
    let p = this.props.party;
    if (p.length < 5 && !(p.includes(char[this.state.char]))) {
      p.push(char[this.state.char]);
      this.forceUpdate();
    }
  }


  render() {

    return (
      <div>
        {this.state.text}
        <Button variant="primary" onClick={this.handleShow}>
          파티 설정
        </Button>
        <h1 className="ten">
          {' '}
        </h1>
        <MobParty party={this.state.p}/>

        <Modal
          show={this.state.show}
          onHide={this.handleHide}
          aria-labelledby="example-custom-modal-styling-title"
        >

            <Modal.Header>
              <Modal.Title>
                파티 설정
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Cutter party={this.state.p}/>
              <div align="center" className="ten">
              <Form ref="form">
              <Form.Row>
                <Form.Group as={Col} controlId="formGridCity">
                    <Form.Control className="char" onChange={this.inputHandler} maxLength={8}/>
                </Form.Group>
              </Form.Row>
              </Form>
              <Button variant="primary" onClick={this.addParty}>캐릭터 추가</Button>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="danger" onClick={this.clearParty}>설정 초기화</Button>
              <Button variant="primary" onClick={this.handleHide}>파티 저장</Button>
            </Modal.Footer>

        </Modal>
      </div>
    );
  }

}
