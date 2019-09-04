import React from 'react';
import {
  Modal,
  Form,
  Col,
  Button,
  Pagination
} from 'react-bootstrap';
import { sort } from './Party';
import { SetParty } from './SetParty';

import '../css/daum.css';
import '../css/text.css';
import { SearchParty } from './SearchParty';

import { path } from '../util/dummy';

var axios = require('axios');


var party = [];
var results = [];
var searched = false;
var offset = 1;
var max = 1;
var queryItems = [];

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

export class Search extends React.Component {
  constructor(props) {
    super(props);

    this.getSearch = this.getSearch.bind(this);
    this.setSelection = this.setSelection.bind(this);
    this.validateDeck = this.validateDeck.bind(this);
    this.inputHandler = this.inputHandler.bind(this);
    this.updateOffset = this.updateOffset.bind(this);
    this.getCount = this.getCount.bind(this);
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
      count: 0,
      form: {
        target: "방어",
        result: "패배",
        arena: "전체",
        date: "전체",
        power: "전체",
        sort: "순추천순",
        deck: {

        }
      }
    };
  }
  updateOffset(num) {
    {
      offset = num;
      results = [];
      let items = queryItems[offset-1]['Items'];
      if (items != null) {
        for (let i in items) {
          results.push(items[i]);
        }
      }
      this.forceUpdate();
    }
  }

  componentDidMount() {
    this.getCount();
  }

  getCount() {
    let mPath = path + 'api/get-count';
    return (async _ => {
      let res = await axios({
        method: 'get',
        url: mPath,
        headers: {
          "Accept": "application/json"
        }
      });
      if (res.data.message === 'Getting Count Failed') {
        console.log('Count Error');
        return;
      } else {
        this.setState({
          count: Number(res.data.message)
        });
      }
    })();
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
    searched = true;
    let f = this.setSelection(this.state.form);
    f = this.validateDeck(f);
    let str = JSON.stringify(f);
    let mPath = path + 'api/get-search';
    return (async _ => {
      let res = await axios({
        method: 'get',
        url: mPath,
        params: str,
        headers: {
          "Accept": "application/json"
        }
      });
      if (res.data.message === 'Query Failed' || res.data.message === 'Internal server error') {
        this.setState({
          title_msg: "검색 실패",
          msg: "데이터 검색에 오류가 발생했습니다."
        });
        this.errorShow();
        return;
      } else {
        let msg = res.data.message;
        results = [];
        if (msg === 'Deck Not Found') {
          this.forceUpdate();
          return;
        }
        max = msg.length;
        offset = 1;
        let items = msg[offset-1]['Items'];
        if (items != null) {
          for (let i in items) {
            results.push(items[i]);
          }
          queryItems = msg;
        }
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
    switch (this.state.form.target) {
      case "방어":
        f.target = "defense";
        break;
      case "공격":
        f.target = "attack";
        break;
      default:
        break;
    }
    switch (this.state.form.arena) {
      case "배틀 아레나":
        f.arena = "battleArena";
        break;
      case "프린세스 아레나":
        f.arena = "princessArena";
        break;
      case "전체":
        f.arena = "all";
        break;
      default:
        break;
    }
    switch (this.state.form.result) {
      case "패배":
        f.result = "defeat";
        break;
      case "승리":
        f.result = "victory";
        break;
      case "전체":
        f.result = "all";
        break;
      default:
        break;
    }
    switch (this.state.form.date) {
      case "전체":
        f.date = "all";
        break;
      case "7일 이내":
        f.date = "week";
        break;
      case "30일 이내":
        f.date = "month";
        break;
      case "3개월 이내":
        f.date = "season";
        break;
      default:
        break;
    }
    switch (this.state.form.power) {
      case "전체":
        f.power = "all";
        break;
      case "55000 이상":
        f.power = ">55000";
        break;
      case "50000-55000":
        f.power = ">50000";
        break;
      case "45000-50000":
        f.power = ">45000";
        break;
      case "40000-45000":
        f.power = ">40000";
        break;
      case "40000 미만":
        f.power = "<40000";
        break;
      default:
        break;
    }
    switch (this.state.form.sort) {
      case "순추천순":
        f.sort = "netUpvotes";
        break;
      case "최신순":
        f.sort = "latest";
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
            return <SearchParty match={value} key={index}/>
        })}
        <Pagination>
        <Pagination.First onClick={() => {
          offset = 1;
          results = [];
          let items = queryItems[0]['Items'];
          if (items != null) {
            for (let i in items) {
              results.push(items[i]);
            }
          }
          this.forceUpdate();
        }}/>
        <Pagination.Prev onClick={() => {
          if (offset > 1) {
            offset -= 1;
          }
          results = [];
          let items = queryItems[offset-1]['Items'];
          if (items != null) {
            for (let i in items) {
              results.push(items[i]);
            }
          }
          this.forceUpdate();
        }}/>
        <Pagination.Ellipsis />
        {items}
        <Pagination.Ellipsis />
        <Pagination.Next onClick={() => {
          if (offset < max) {
            offset += 1;
          }
          results = [];
          let items = queryItems[offset-1]['Items'];
          if (items != null) {
            for (let i in items) {
              results.push(items[i]);
            }
          }
          this.forceUpdate();
        }}/>
        <Pagination.Last onClick={() => {
          offset = max;
          results = [];
          let items = queryItems[offset-1]['Items'];
          if (items != null) {
            for (let i in items) {
              results.push(items[i]);
            }
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
        대전 검색
      </h1>
      <p style={smallText} className="twenty">
        {'덧글 기능 오픈! 돋보기를 클릭해서 덧글을 등록해 보세요!'}
        <br/>
        {'지금까지 총 '+this.state.count+'개의 대전 결과가 등록되었습니다. (6시간마다 갱신)'}
      </p>
      <h2 style={subText} className="ten">
        검색 설정
      </h2>
      <h3 style={smallText} className="ten">
        <Form ref="form">
          <Form.Row>
            <Form.Group as={Col} controlId="formGridPosition">
              <Form.Label>덱 유형</Form.Label>
              <Form.Control name="target" onChange={this.inputHandler} as="select">
                <option>방어</option>
                <option>공격</option>
              </Form.Control>
            </Form.Group>
            <Form.Group as={Col} controlId="formGridPosition">
              <Form.Label>결과</Form.Label>
              <Form.Control name="result" onChange={this.inputHandler} as="select">
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
            <Form.Group as={Col} controlId="formGridPosition">
              <Form.Label>기간</Form.Label>
              <Form.Control name="date" onChange={this.inputHandler} as="select">
                <option>전체</option>
                <option>7일 이내</option>
                <option>30일 이내</option>
                <option>3개월 이내</option>
              </Form.Control>
            </Form.Group>
            <Form.Group as={Col} controlId="formGridPosition">
              <Form.Label>전투력</Form.Label>
              <Form.Control name="power" onChange={this.inputHandler} as="select">
                <option>전체</option>
                <option>55000 이상</option>
                <option>50000-55000</option>
                <option>45000-50000</option>
                <option>40000-45000</option>
                <option>40000 미만</option>
              </Form.Control>
            </Form.Group>
            <Form.Group as={Col} controlId="formGridPosition">
              <Form.Label>정렬</Form.Label>
              <Form.Control name="sort" onChange={this.inputHandler} as="select">
                <option>순추천순</option>
                <option>최신순</option>
              </Form.Control>
            </Form.Group>
          </Form.Row>
        </Form>
      </h3>
      <h4 style={subText} className="ten">
        <SetParty party={party}/>
      </h4>
      <p style={subText} className="twenty">
        <Button variant='success' onClick={this.getSearch}>
          검색 시작
        </Button>
      </p>
      <div style={subText} className="ten">
        {this.queried()}
      </div>
      <Modal
        show={this.state.errShow}
        onHide={this.errorHide}
        dialogClassName="modal-web"
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