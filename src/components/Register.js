import React from 'react';
import {
  Form,
  Col,
  Button
} from 'react-bootstrap';
import { SetParty } from './SetParty';
import '../css/daum.css';
import '../css/text.css';

var defParty = [];
var attParty = [];

const topicText = {
  fontFamily: 'Daum',
  fontStyle: 'normal',
  fontSize: 36,
  fontColor: '#333333'
  }

const subText = {
  fontFamily: 'Daum',
  fontStyle: 'normal',
  fontSize: 28,
  fontColor: '#333333'
}

const smallText = {
  fontFamily: 'Daum',
  fontStyle: 'normal',
  fontSize: 16,
  fontColor: '#333333'
}

export class Register extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedFile: null
    };
    this.onChangeHandler = this.onChangeHandler.bind(this);
  }
  onChangeHandler(e) {
    if (e.target.files[0].size > 1) {
      console.log(e.target.files[0].size);
    }
    this.setState({
      selectedFile: e.target.files[0]
    });
  }

  render() {
    return (
      <div className="text">
      <h1 style={topicText}>
        대전 등록
      </h1>
      <h2 style={subText} className="twenty">
        대전 유형
      </h2>
      <h3 style={smallText} className="ten">
        <Form>
          <Form.Row>
            <Form.Group as={Col} controlId="formGridCity">
              <Form.Label>공격덱 전투력</Form.Label>
                <Form.Control />
            </Form.Group>
            <Form.Group as={Col} controlId="formGridCity">
              <Form.Label>방어덱 전투력</Form.Label>
                <Form.Control />
            </Form.Group>
            <Form.Group as={Col} controlId="formGridCity">
              <Form.Label>공격덱 성급</Form.Label>
                <Form.Control placeholder="(54434)"/>
            </Form.Group>
            <Form.Group as={Col} controlId="formGridCity">
              <Form.Label>방어덱 성급</Form.Label>
                <Form.Control placeholder="(54434)"/>
            </Form.Group>
            <Form.Group as={Col} controlId="formGridPosition">
              <Form.Label>결과</Form.Label>
              <Form.Control as="select">
                <option>방어덱 패배</option>
                <option>방어덱 승리</option>
              </Form.Control>
            </Form.Group>
            <Form.Group as={Col} controlId="formGridPosition">
              <Form.Label>아레나</Form.Label>
              <Form.Control as="select">
                <option>배틀 아레나</option>
                <option>프린세스 아레나</option>
              </Form.Control>
            </Form.Group>
          </Form.Row>
          <Form.Row>
            <Form.Group as={Col} controlId="formGridCity">
              <Form.Label>설명</Form.Label>
                <Form.Control as="textarea"/>
            </Form.Group>
          </Form.Row>
        </Form>
      </h3>
      <h4 style={subText} className="ten">
        <SetParty party={attParty} handle="att"/>
      </h4>
      <h5 style={subText} className="twenty">
        <SetParty party={defParty} handle="def"/>
      </h5>
      <h6 style={subText} className="twenty">
        {"결과 이미지"}
      </h6>
      <p style={smallText} className="ten">
        {"500KB 이하의 .jpg .jpeg .png 파일을 올려주세요."}
        <br/>
        <input type="file" name="file" accept=".jpg, .jpeg, .png" onChange={this.onChangeHandler}/>
      </p>
      <p style={subText} className="twenty">
        <Button variant='success'>
          대전 등록
        </Button>
      </p>
      </div>
    );
  }
}

