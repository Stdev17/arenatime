import React from 'react';
import {
  Form,
  Col,
  Button,
  Alert,
  Modal
} from 'react-bootstrap';
import { SetParty } from './SetParty';
import { sort } from './Party';
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
      selectedFile: null,
      loaded: false,
      overload: false,
      msg: "",
      errShow: false,
      form: {
        attackPower: 0,
        defencePower: 0,
        attackStar: "",
        defenceStar: "",
        result: "방어덱 패배",
        arena: "배틀 아레나",
        memo: ""
      }
    };
    this.fileHandler = this.fileHandler.bind(this);
    this.inputHandler = this.inputHandler.bind(this);
    this.validatePower = this.validatePower.bind(this);
    this.validateStarAndDeck = this.validateStarAndDeck.bind(this);
    this.validateFile = this.validateFile.bind(this);
    this.setStar = this.setStar.bind(this);
    this.setDeck = this.setDeck.bind(this);
    this.setSelection = this.setSelection.bind(this);
    this.checkForm = this.checkForm.bind(this);
    this.errorShow = () => {
      this.setState({ errShow: true });
    };

    this.errorHide = () => {
      this.setState({ errShow: false });
    };
    this.resetForm = (e) => {
      this.refs.form.reset();
    };
  }
  fileHandler(e) {
    if (e.target.files[0] == null) {
      this.setState({
        selectedFile: null,
        loaded: false,
        overload: false
      });
      return;
    }
    if (e.target.files[0].size > 51200) {
      this.setState({
        selectedFile: null,
        loaded: false,
        overload: true
      });
      return;
    }
    this.setState({
      selectedFile: e.target.files[0],
      loaded: true,
      overload: false
    });
  }
  inputHandler(e) {
    let eName = e.target.name;
    let eVal = e.target.value;
    this.setState({form: {...this.state.form, [eName]: eVal}});
  }
  checkForm(e) {
    e.preventDefault();
    if (!this.validatePower()) {
      return;
    }
    if (!this.validateStarAndDeck()) {
      return;
    }
    if (!this.validateFile()) {
      return;
    }
    //set JSON
    let f = {
      result: "",
      arena: "",
      memo: this.state.form.memo,
      attackPower: this.state.form.attackPower,
      attackDeck: {
        first: "", second: "", third: "", fourth: "", fifth: ""
      },
      attackStar: {
        first: 0, second: 0, third: 0, fourth: 0, fifth: 0
      },
      defencePower: this.state.form.defencePower,
      defenceDeck: {
        first: "", second: "", third: "", fourth: "", fifth: ""
      },
      defenceStar: {
        first: 0, second: 0, third: 0, fourth: 0, fifth: 0
      }
    };
    f = this.setStar(f);
    f = this.setDeck(f);
    f = this.setSelection(f);
    //send image API
    //send data API
    let body = JSON.stringify(f);
    console.log(body);
    //reset form
    this.resetForm(e);
    defParty.splice(0, defParty.length)
    attParty.splice(0, attParty.length)
    this.forceUpdate();
  }
  validatePower() {
    this.setState({
      msg: "정상 범위 내의 전투력을 입력해 주세요."
    });
    if (!(this.state.form.attackPower > 100)) {
      this.errorShow();
      return false;
    }
    if (!(this.state.form.attackPower < 70000)) {
      this.errorShow();
      return false;
    }
    if (!(this.state.form.defencePower > 100)) {
      this.errorShow();
      return false;
    }
    if (!(this.state.form.defencePower < 70000)) {
      this.errorShow();
      return false;
    }
    return true;
  }
  validateStarAndDeck() {
    this.setState({
      msg: "캐릭터 별 성급을 정확히 입력해 주세요."
    });
    let a = this.state.form.attackStar;
    if (!(a % 10 > 0 && a % 10 < 6)
    || !(a < 10 || (Math.floor(a/10) % 10 > 0 && Math.floor(a/10) % 10 < 6))
    || !(a < 100 || (Math.floor(a/100) % 10 > 0 && Math.floor(a/100) % 10 < 6))
    || !(a < 1000 || (Math.floor(a/1000) % 10 > 0 && Math.floor(a/1000) % 10 < 6))
    || !(a < 10000 || (Math.floor(a/10000) % 10 > 0 && Math.floor(a/10000) % 10 < 6))) {
      this.errorShow();
      return false;
    }
    let d = this.state.form.defenceStar;
    if (!(d % 10 > 0 && d % 10 < 6)
    || !(d < 10 || (Math.floor(d/10) % 10 > 0 && Math.floor(d/10) % 10 < 6))
    || !(d < 100 || (Math.floor(d/100) % 10 > 0 && Math.floor(d/100) % 10 < 6))
    || !(d < 1000 || (Math.floor(d/1000) % 10 > 0 && Math.floor(d/1000) % 10 < 6))
    || !(d < 10000 || (Math.floor(d/10000) % 10 > 0 && Math.floor(d/10000) % 10 < 6))) {
      this.errorShow();
      return false;
    }
    if (Math.floor(a/Math.pow(10, attParty.length-1)) < 1) {
      this.errorShow();
      return false;
    }
    if (Math.floor(d/Math.pow(10, defParty.length-1)) < 1) {
      this.errorShow();
      return false;
    }
    return true;
  }
  validateFile() {
    this.setState({
      msg: "파일 크기를 조정해 주세요."
    });
    if (this.state.overload) {
      return false;
    }
    return true;
  }
  setStar(f) {
    let atk = this.state.form.attackStar;
    let aParty = attParty.length-1;
    if (aParty >= 0) {
      f.attackStar.first = Math.floor(atk / Math.pow(10, aParty));
      atk -= f.attackStar.first * Math.pow(10, aParty);
      aParty -= 1;
    }
    if (aParty >= 0) {
      f.attackStar.second = Math.floor(atk / Math.pow(10, aParty));
      atk -= f.attackStar.second * Math.pow(10, aParty);
      aParty -= 1;
    }
    if (aParty >= 0) {
      f.attackStar.third = Math.floor(atk / Math.pow(10, aParty));
      atk -= f.attackStar.third * Math.pow(10, aParty);
      aParty -= 1;
    }
    if (aParty >= 0) {
      f.attackStar.fourth = Math.floor(atk / Math.pow(10, aParty));
      atk -= f.attackStar.fourth * Math.pow(10, aParty);
      aParty -= 1;
    }
    if (aParty >= 0) {
      f.attackStar.fifth = Math.floor(atk / Math.pow(10, aParty));
      atk -= f.attackStar.fifth * Math.pow(10, aParty);
      aParty -= 1;
    }
    let dfc = this.state.form.defenceStar;
    let dParty = defParty.length-1;
    if (dParty >= 0) {
      f.defenceStar.first = Math.floor(dfc / Math.pow(10, dParty));
      dfc -= f.defenceStar.first * Math.pow(10, dParty);
      dParty -= 1;
    }
    if (dParty >= 0) {
      f.defenceStar.second = Math.floor(dfc / Math.pow(10, dParty));
      dfc -= f.defenceStar.second * Math.pow(10, dParty);
      dParty -= 1;
    }
    if (dParty >= 0) {
      f.defenceStar.third = Math.floor(dfc / Math.pow(10, dParty));
      dfc -= f.defenceStar.third * Math.pow(10, dParty);
      dParty -= 1;
    }
    if (dParty >= 0) {
      f.defenceStar.fourth = Math.floor(dfc / Math.pow(10, dParty));
      dfc -= f.defenceStar.fourth * Math.pow(10, dParty);
      dParty -= 1;
    }
    if (dParty >= 0) {
      f.defenceStar.fifth = Math.floor(dfc / Math.pow(10, dParty));
      dfc -= f.defenceStar.fifth * Math.pow(10, dParty);
      dParty -= 1;
    }
    return f;
  }
  setDeck(f) {
    let atk = sort(attParty.slice());
    if (atk.length > 0) {
      f.attackDeck.first = atk.pop();
    }
    if (atk.length > 0) {
      f.attackDeck.second = atk.pop();
    }
    if (atk.length > 0) {
      f.attackDeck.third = atk.pop();
    }
    if (atk.length > 0) {
      f.attackDeck.fourth = atk.pop();
    }
    if (atk.length > 0) {
      f.attackDeck.fifth = atk.pop();
    }
    let dfc = sort(attParty.slice());
    if (dfc.length > 0) {
      f.defenceDeck.first = dfc.pop();
    }
    if (dfc.length > 0) {
      f.defenceDeck.second = dfc.pop();
    }
    if (dfc.length > 0) {
      f.defenceDeck.third = dfc.pop();
    }
    if (dfc.length > 0) {
      f.defenceDeck.fourth = dfc.pop();
    }
    if (dfc.length > 0) {
      f.defenceDeck.fifth = dfc.pop();
    }
    return f;
  }
  setSelection(f) {
    if (this.state.form.arena == "배틀 아레나") {
      f.arena = "battleArena";
    } else {
      f.arena = "princessArena";
    }
    if (this.state.form.result == "방어덱 패배") {
      f.result = "attackWin";
    } else {
      f.result = "defenceWin";
    }
    return f;
  }
  alert() {
    if (this.state.overload) {
      return (
        <div>
        <br/>
        <Alert variant="danger">
          <p>
            파일 제한 용량을 초과했습니다.
          </p>
        </Alert>
        </div>
      );
    }
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
        <Form ref="form">
          <Form.Row>
            <Form.Group as={Col} controlId="formGridCity">
              <Form.Label>공격덱 전투력</Form.Label>
                <Form.Control name="attackPower" onChange={this.inputHandler} maxLength={5}/>
            </Form.Group>
            <Form.Group as={Col} controlId="formGridCity">
              <Form.Label>방어덱 전투력</Form.Label>
                <Form.Control name="defencePower" onChange={this.inputHandler} maxLength={5}/>
            </Form.Group>
            <Form.Group as={Col} controlId="formGridCity">
              <Form.Label>공격덱 성급</Form.Label>
                <Form.Control placeholder="(54434)" name="attackStar" onChange={this.inputHandler} maxLength={5}/>
            </Form.Group>
            <Form.Group as={Col} controlId="formGridCity">
              <Form.Label>방어덱 성급</Form.Label>
                <Form.Control placeholder="(54434)" name="defenceStar" onChange={this.inputHandler} maxLength={5}/>
            </Form.Group>
            <Form.Group as={Col} controlId="formGridPosition">
              <Form.Label>결과</Form.Label>
              <Form.Control as="select" name="result" onChange={this.inputHandler}>
                <option>방어덱 패배</option>
                <option>방어덱 승리</option>
              </Form.Control>
            </Form.Group>
            <Form.Group as={Col} controlId="formGridPosition">
              <Form.Label>아레나</Form.Label>
              <Form.Control as="select" name="arena" onChange={this.inputHandler}>
                <option>배틀 아레나</option>
                <option>프린세스 아레나</option>
              </Form.Control>
            </Form.Group>
          </Form.Row>
          <Form.Row>
            <Form.Group as={Col} controlId="formGridCity">
              <Form.Label>설명</Form.Label>
                <Form.Control as="textarea" name="memo" onChange={this.inputHandler} maxLength={200}/>
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
        <input type="file" name="file" accept=".jpg, .jpeg, .png" onChange={this.fileHandler}/>
        {this.alert()}
      </p>
      <p style={subText} className="twenty">
        <Button variant='success' onClick={this.checkForm}>
          대전 등록
        </Button>
      </p>
      <Modal
          show={this.state.errShow}
          onHide={this.errorHide}
          dialogClassName="modal-90w"
          aria-labelledby="example-custom-modal-styling-title"
        >

            <Modal.Header>
              <Modal.Title>
                등록 실패
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {this.state.msg}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="primary" onClick={this.errorHide}>확인</Button>
            </Modal.Footer>

        </Modal>
      </div>
    );
  }
}

