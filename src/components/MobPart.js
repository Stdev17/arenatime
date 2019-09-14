import React from 'react';
import {
  Modal,
  Form,
  Col,
  Button,
  Pagination
} from 'react-bootstrap';
import { sort } from './Party';
import { MobSetParty } from './MobSetParty';

import '../css/daum.css';
import '../css/mobile.css';
import { MobSearchParty } from './MobSearchParty';

import { path } from '../util/dummy';

var axios = require('axios');

var party = [];
var searched = false;
var results = [];
var offset = 1;
var max = 1;
var queryItems = [];

const topicText = {
  fontFamily: 'GyeonggiTitleM',
  fontStyle: 'normal',
  fontSize: 36,
  fontColor: '#333333'
}

const subText = {
  fontFamily: 'GyeonggiTitleM',
  fontStyle: 'normal',
  fontSize: 28,
  fontColor: '#333333'
}

const smallText = {
  fontFamily: 'GyeonggiTitleM',
  fontStyle: 'normal',
  fontSize: 16,
  fontColor: '#333333'
}

export class MobPart extends React.Component {
  constructor(props) {
    super(props);

    this.getSearch = this.getSearch.bind(this);
    this.setSelection = this.setSelection.bind(this);
    this.validateDeck = this.validateDeck.bind(this);
    this.inputHandler = this.inputHandler.bind(this);
    this.updateOffset = this.updateOffset.bind(this);
    this.errorShow = () => {
      this.setState({ errShow: true });
    };

    this.errorHide = () => {
      this.setState({ errShow: false });
    };
    this.state = {
      title_msg: "",
      msg: "",
      errShow: false,
      res: "",
      items: [],
      form: {
        deckType: "방어",
        matchResult: "패배",
        arena: "전체",
        deck: {

        }
      }
    };
  }
  updateOffset(num) {
    {
      offset = num;
      results = [];
      let items = queryItems.slice((offset-1)*5, (offset)*5);
      for (let i in items) {
        results.push(items[i]);
      }
      this.forceUpdate();
    }
  }

  getSearch() {
    results = [];
    if (party.length < 1) {
      this.setState({
        title_msg: "검색 실패",
        msg: "파티를 설정해 주세요."
      });
      this.errorShow();
      return;
    }
    if (party.length < 2 || party.length > 3) {
      this.setState({
        title_msg: "검색 실패",
        msg: "2,3명만 선택해 주세요."
      });
      this.errorShow();
      return;
    }
    let f = this.setSelection(this.state.form);
    f = this.validateDeck(f);
    let str = JSON.stringify(f);
    let mPath = path + 'api/get-part';
    this.setState({
      title_msg: "검색 중",
      msg: "잠시만 기다려 주세요."
    });
    this.errorShow();
    return (async _ => {
      let res = await axios({
        method: 'get',
        url: mPath,
        params: str,
        headers: {
          "Accept": "application/json"
        }
      });
      if (res.data.message === 'Query Failed' || res.data.message === 'Parsing Failed' || res.data.message === 'Getting Items Failed' || res.data.message === 'Internal server error') {
        this.setState({
          title_msg: "검색 실패",
          msg: "데이터 검색에 오류가 발생했습니다."
        });
        return;
      } else {
        let msg = res.data.message;
        results = [];
        max = Math.ceil(msg.length/5);
        offset = 1;
        if (msg != null) {
          let items = msg.slice(0, 5);
          for (let i in items) {
            results.push(items[i]);
          }
          queryItems = msg;
        }
        searched = true;
        this.errorHide();
        this.forceUpdate();
        return;
      }
    })();
  }
  validateDeck(f) {
    let at = party.length;
    f.deck = {};
    let atk = sort(party.slice());
    if (at > 0) {
      f.deck.first = atk.pop();
      at -= 1;
    }
    if (at > 0) {
      f.deck.second = atk.pop();
      at -= 1;
    }
    if (at > 0) {
      f.deck.third = atk.pop();
      at -= 1;
    }
    if (at > 0) {
      f.deck.fourth = atk.pop();
      at -= 1;
    }
    if (at > 0) {
      f.deck.fifth = atk.pop();
      at -= 1;
    }
    return f;
  }
  setSelection(f) {
    switch (this.state.form.deckType) {
      case "방어":
        f.deckType = "defense";
        break;
      case "공격":
        f.deckType = "attack";
        break;
      default:
        break;
    }
    switch (this.state.form.arena) {
      case "배틀 아레나":
        f.arena = "princessArena";
        break;
      case "프린세스 아레나":
        f.arena = "battleArena";
        break;
      case "전체":
        f.arena = "all";
        break;
      default:
        break;
    }
    switch (this.state.form.matchResult) {
      case "패배":
        if (f.deckType === 'attack') {
          f.matchResult = "attackWin";
        } else {
          f.matchResult = "defenseWin";
        }
        break;
      case "승리":
        if (f.deckType === 'attack') {
          f.matchResult = "defenseWin";
        } else {
          f.matchResult = "attackWin";
        }
        break;
      case "전체":
        f.matchResult = "all";
        break;
      default:
        break;
    }
    return f;
  }
  inputHandler(e) {
    let eName = e.target.name;
    let eVal = e.target.value;
    this.setState({form: {...this.state.form, [eName]: eVal}});
  }

  queried() {
    if (results.length > 0) {
      //return this.state.res;
      let items = [];
      for (let num = offset-2; num <= offset+4; num++) {
        if (num < 1) {
          continue;
        }
        if (num > max || (num > 5 && num > offset+2)) {
          break;
        }
        items.push(
          <Pagination.Item key={num} active={num === offset} onClick={() => this.updateOffset(num)}>
            {num}           
          </Pagination.Item>,
        );
      }
      return (
        <div>
        {results.map((value, index) => {
            return <MobSearchParty match={value} search={false} key={index}/>
        })}
        <Pagination>
        <Pagination.First onClick={() => {
          offset = 1;
          results = [];
          let items = queryItems.slice((offset-1)*5, (offset)*5);
          for (let i in items) {
            results.push(items[i]);
          }
          this.forceUpdate();
        }}/>
        <Pagination.Prev onClick={() => {
          if (offset > 1) {
            offset -= 1;
          }
          results = [];
          let items = queryItems.slice((offset-1)*5, (offset)*5);
          for (let i in items) {
            results.push(items[i]);
          }
          this.forceUpdate();
        }}/>
        {items}
        <Pagination.Next onClick={() => {
          if (offset < max) {
            offset += 1;
          }
          results = [];
          let items = queryItems.slice((offset-1)*5, (offset)*5);
          for (let i in items) {
            results.push(items[i]);
          }
          this.forceUpdate();
        }}/>
        <Pagination.Last onClick={() => {
          offset = max;
          results = [];
          let items = queryItems.slice((offset-1)*5, (offset)*5);
          for (let i in items) {
            results.push(items[i]);
          }
          this.forceUpdate();
        }}/>
        </Pagination>
        </div>
      );

    } else if (searched) {
      return (
        <p className={'ten'} style={subText}>
          {'검색 결과가 없습니다.'}
        </p>
      );
    }
  }
  render() {
    return (
      <div className="text">
      <h1 style={topicText}>
        부분 검색
      </h1>
      <p style={smallText} className="twenty">
        {'부분 검색은 2, 3명 조합만 가능합니다.'}
        <br/>
        {'최대 50개까지만 표시됩니다.'}
      </p>
      <h2 style={subText} className="ten">
        검색 설정
      </h2>
      <h3 style={smallText} className="ten">
        <Form ref="form">
          <Form.Row>
            <Form.Group as={Col} controlId="formGridPosition">
              <Form.Label>덱 유형</Form.Label>
              <Form.Control name="deckType" onChange={this.inputHandler} as="select">
                <option>방어</option>
                <option>공격</option>
              </Form.Control>
            </Form.Group>
            <Form.Group as={Col} controlId="formGridPosition">
              <Form.Label>결과</Form.Label>
              <Form.Control name="matchResult" onChange={this.inputHandler} as="select">
                <option>패배</option>
                <option>승리</option>
                <option>전체</option>
              </Form.Control>
            </Form.Group>
            <Form.Group as={Col} controlId="formGridPosition">
              <Form.Label>아레나</Form.Label>
              <Form.Control name="arena" onChange={this.inputHandler} as="select">
                <option>전체</option>
                <option>배틀 아레나</option>
                <option>프린세스 아레나</option>
              </Form.Control>
            </Form.Group>
          </Form.Row>
          <Form.Row/>
        </Form>
      </h3>
      <h4 style={subText} className="ten">
        <MobSetParty party={party}/>
      </h4>
      <p style={subText} className="twenty">
        <Button variant='success' onClick={this.getSearch}>
          검색 시작
        </Button>
      </p>
      <div style={smallText} className="ten">
        {this.queried()}
      </div>
      <Modal
        show={this.state.errShow}
        onHide={this.errorHide}
        dialogClassName="modal-mobile"
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