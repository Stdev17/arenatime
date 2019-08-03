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
//import { FormData } from 'form-data';
import '../css/daum.css';
import '../css/text.css';

import { path } from '../util/dummy';

let axios = require('axios');



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
      title_msg: "",
      msg: "",
      isSending: false,
      errShow: false,
      form: {
        attackPower: 0,
        defensePower: 0,
        attackStar: "",
        defenseStar: "",
        matchResult: "방어덱 패배",
        arena: "배틀 아레나",
        memo: ""
      }
    };
    this.fileHandler = this.fileHandler.bind(this);
    this.inputHandler = this.inputHandler.bind(this);
    this.validatePower = this.validatePower.bind(this);
    this.validateStarAndDeck = this.validateStarAndDeck.bind(this);
    this.validateFile = this.validateFile.bind(this);
    this.sendDatatoS3 = this.sendDatatoS3.bind(this);
    this.sendFiletoS3 = this.sendFiletoS3.bind(this);
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
    if (e.target.files[0].size > 512000) {
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
    if (this.isSending) {
      return;
    }
    if (!this.validatePower()) {
      return;
    }
    if (!this.validateStarAndDeck()) {
      return;
    }
    if (!this.validateFile()) {
      return;
    }
    this.setState({
      title_msg: "등록 실패",
      isSending: true
    });
    //set JSON
    let f = {
      matchResult: "",
      arena: "",
      memo: this.state.form.memo,
      attackNum: attParty.length,
      attackPower: this.state.form.attackPower,
      attackDeck: {
        first: ""
      },
      attackStar: {
        first: 1
      },
      defenseNum: defParty.length,
      defensePower: this.state.form.defensePower,
      defenseDeck: {
        first: ""
      },
      defenseStar: {
        first: 1
      }
    };
    f = this.setStar(f);
    f = this.setDeck(f);
    f = this.setSelection(f);
    this.setState({
      title_msg: "등록 실패",
      msg: "대전 업로드에 실패했습니다."
    });
    //send image API
    (async _ => {
      if (this.state.loaded) {
        this.setState({
          title_msg: "등록 중",
          msg: "잠시만 기다려 주세요."
        });
        this.errorShow();
        let s3 = await this.sendFiletoS3();
        console.log(f);
        let dat = await this.sendDatatoS3(f, s3);
        if (dat === 'Succeeded Data Upload') {
          this.resetForm(e);
          defParty.splice(0, defParty.length);
          attParty.splice(0, attParty.length);
          this.setState({
            memo: "",
            title_msg: "등록 성공",
            msg: "대전 결과가 DB에 등록되었습니다."
          });
        }
      } else {
        let s3 = 'Not Uploaded';
        this.setState({
          title_msg: "등록 중",
          msg: "잠시만 기다려 주세요."
        });
        this.errorShow();
        let dat = await this.sendDatatoS3(f, s3);
        if (dat === 'Succeeded Data Upload') {
          this.resetForm(e);
          defParty.splice(0, defParty.length);
          attParty.splice(0, attParty.length);
          this.setState({
            memo: "",
            title_msg: "등록 성공",
            msg: "대전 결과가 DB에 등록되었습니다."
          });
        }
      }
      //reset form
      this.setState({
        isSending: false
      });
    })();
  }
  validatePower() {
    this.setState({
      title_msg: "등록 실패",
      msg: "정상 범위 내의 전투력을 입력해 주세요."
    });
    if (!(this.state.form.attackPower > 100) && this.state.form.attackPower !== 0) {
      this.errorShow();
      return false;
    }
    if (!(this.state.form.attackPower < 70000)) {
      this.errorShow();
      return false;
    }
    if (!(this.state.form.defensePower > 100) && this.state.form.defensePower !== 0) {
      this.errorShow();
      return false;
    }
    if (!(this.state.form.defensePower < 70000)) {
      this.errorShow();
      return false;
    }
    return true;
  }
  validateStarAndDeck() {
    this.setState({
      title_msg: "등록 실패",
      msg: "덱을 정확히 입력해 주세요."
    });
    if ((this.state.form.attackStar === "" || this.state.form.attackStar === 99999) && (this.state.form.defenseStar === "" || this.state.form.defenseStar === 99999) && attParty.length > 0 && defParty.length > 0) {
      let f = this.state.form;
      f.attackStar = 99999;
      f.defenseStar = 99999;
      this.setState({
        form: f
      });
      return true;
    }
    let a = this.state.form.attackStar;
    if (!(a % 10 > 0 && a % 10 < 6)
    || !(a < 10 || (Math.floor(a/10) % 10 > 0 && Math.floor(a/10) % 10 < 6))
    || !(a < 100 || (Math.floor(a/100) % 10 > 0 && Math.floor(a/100) % 10 < 6))
    || !(a < 1000 || (Math.floor(a/1000) % 10 > 0 && Math.floor(a/1000) % 10 < 6))
    || !(a < 10000 || (Math.floor(a/10000) % 10 > 0 && Math.floor(a/10000) % 10 < 6))) {
      this.errorShow();
      return false;
    }
    let d = this.state.form.defenseStar;
    if (!(d % 10 > 0 && d % 10 < 6)
    || !(d < 10 || (Math.floor(d/10) % 10 > 0 && Math.floor(d/10) % 10 < 6))
    || !(d < 100 || (Math.floor(d/100) % 10 > 0 && Math.floor(d/100) % 10 < 6))
    || !(d < 1000 || (Math.floor(d/1000) % 10 > 0 && Math.floor(d/1000) % 10 < 6))
    || !(d < 10000 || (Math.floor(d/10000) % 10 > 0 && Math.floor(d/10000) % 10 < 6))) {
      this.errorShow();
      return false;
    }
    if (Math.floor(a/Math.pow(10, attParty.length-1)) < 1 || (a/Math.pow(10, attParty.length-1)) >= 10) {
      this.errorShow();
      return false;
    }
    if (Math.floor(d/Math.pow(10, defParty.length-1)) < 1 || (d/Math.pow(10, defParty.length-1)) >= 10) {
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
    let aParty = Math.floor(Math.log10(atk));
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
    let dfs = this.state.form.defenseStar;
    let dParty = Math.floor(Math.log10(dfs));
    if (dParty >= 0) {
      f.defenseStar.first = Math.floor(dfs / Math.pow(10, dParty));
      dfs -= f.defenseStar.first * Math.pow(10, dParty);
      dParty -= 1;
    }
    if (dParty >= 0) {
      f.defenseStar.second = Math.floor(dfs / Math.pow(10, dParty));
      dfs -= f.defenseStar.second * Math.pow(10, dParty);
      dParty -= 1;
    }
    if (dParty >= 0) {
      f.defenseStar.third = Math.floor(dfs / Math.pow(10, dParty));
      dfs -= f.defenseStar.third * Math.pow(10, dParty);
      dParty -= 1;
    }
    if (dParty >= 0) {
      f.defenseStar.fourth = Math.floor(dfs / Math.pow(10, dParty));
      dfs -= f.defenseStar.fourth * Math.pow(10, dParty);
      dParty -= 1;
    }
    if (dParty >= 0) {
      f.defenseStar.fifth = Math.floor(dfs / Math.pow(10, dParty));
      dfs -= f.defenseStar.fifth * Math.pow(10, dParty);
      dParty -= 1;
    }
    return f;
  }
  setDeck(f) {
    let at = f.attackNum;
    let atk = sort(attParty.slice());
    if (at > 0) {
      f.attackDeck.first = atk.pop();
      at -= 1;
    }
    if (at > 0) {
      f.attackDeck.second = atk.pop();
      at -= 1;
    }
    if (at > 0) {
      f.attackDeck.third = atk.pop();
      at -= 1;
    }
    if (at > 0) {
      f.attackDeck.fourth = atk.pop();
      at -= 1;
    }
    if (at > 0) {
      f.attackDeck.fifth = atk.pop();
      at -= 1;
    }
    let df = f.defenseNum;
    let dfs = sort(defParty.slice());
    if (df > 0) {
      f.defenseDeck.first = dfs.pop();
      df -= 1;
    }
    if (df > 0) {
      f.defenseDeck.second = dfs.pop();
      df -= 1;
    }
    if (df > 0) {
      f.defenseDeck.third = dfs.pop();
      df -= 1;
    }
    if (df > 0) {
      f.defenseDeck.fourth = dfs.pop();
      df -= 1;
    }
    if (df > 0) {
      f.defenseDeck.fifth = dfs.pop();
      df -= 1;
    }
    return f;
  }
  setSelection(f) {
    if (this.state.form.arena === "배틀 아레나") {
      f.arena = "battleArena";
    } else {
      f.arena = "princessArena";
    }
    if (this.state.form.matchResult === "방어덱 패배") {
      f.matchResult = "attackWin";
    } else {
      f.matchResult = "defenseWin";
    }
    return f;
  }
  sendFiletoS3 () {
    let result = 'Upload Failed';
    let mPath = path + 'api/put-s3-image';
    return (async _ => {
      let form = new FormData();
      try {
        let f = await this.getBase64(this.state.selectedFile);
        form.append('image', f);
        let res = await axios({
          method: 'post',
          url: mPath,
          data: form,
          headers: {
            "Accept": "multipart/form-data",
            "Content-Type": "multipart/form-data"
          }
        });
        if (res.status === 200) {
          result = res.data.message;
        }
      }
      catch {
        //
        console.log("put image error");
      }
      return result;
    })();
  }
  sendDatatoS3 (f, res) {
    if (res === undefined || res === 'Upload Failed') {
      return false;
    }
    let mPath = path + 'api/put-s3-data';
    let result = 'Upload Failed';
    if (res !== 'Not Uploaded') {
      f.imagePath = res;
    }
    let str = JSON.stringify(f);
    return (async _ => {
      try {
        let resp = await axios({
          url: mPath,
          method: 'post',
          data: str,
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
          }
        })
        if (resp.status === 200) {
          result = resp.data.message;
        }
      }
      catch {
        console.log("put data error");
      }
      return result;
    })();
  }
  getBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  }
  alert() {
    if (this.state.overload) {
      return (
        <div>
        <br/>
        <Alert variant="danger">
          <div>
            파일 제한 용량을 초과했습니다.
          </div>
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
                <Form.Control name="defensePower" onChange={this.inputHandler} maxLength={5}/>
            </Form.Group>
            <Form.Group as={Col} controlId="formGridCity">
              <Form.Label>공격덱 성급</Form.Label>
                <Form.Control placeholder="(54434)" name="attackStar" onChange={this.inputHandler} maxLength={5}/>
            </Form.Group>
            <Form.Group as={Col} controlId="formGridCity">
              <Form.Label>방어덱 성급</Form.Label>
                <Form.Control placeholder="(54434)" name="defenseStar" onChange={this.inputHandler} maxLength={5}/>
            </Form.Group>
            <Form.Group as={Col} controlId="formGridPosition">
              <Form.Label>결과</Form.Label>
              <Form.Control as="select" name="matchResult" onChange={this.inputHandler}>
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
      <div style={smallText} className="ten">
        {"500KB 이하의 .jpg .jpeg .png 파일을 올려주세요."}
        <br/>
        <input type="file" name="file" accept=".jpg, .jpeg, .png" onChange={this.fileHandler}/>
        {this.alert()}
      </div>
      <p style={subText} className="twenty">
        <Button variant='success' onClick={this.checkForm}>
          대전 등록
        </Button>
      </p>
      <Modal
          show={this.state.errShow}
          onHide={this.errorHide}
          aria-labelledby="example-custom-modal-styling-title"
        >

            <Modal.Header>
              <Modal.Title>
                {this.state.title_msg}
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

