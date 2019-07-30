import React from 'react';
import {
  Modal,
  Form,
  Col,
  Button
} from 'react-bootstrap';
import { sort } from './Party';

import '../css/daum.css';
import '../css/text.css';

var axios = require('axios');
let path = 'http://localhost:4000/';

var isSearched = false;
var fire = false;
var searchPath = "";
var match = {};

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

export function setSearched() {
  isSearched = true;
  fire = true;
}

export function setSearchPath(str) {
  searchPath = str;
}

export class Match extends React.Component {
  constructor(props) {
    super(props);

    this.getResult = this.getResult.bind(this);
    this.state = {
      //
      msg: ""
    };
  }

  getResult() {
    fire = false;
    (async _ => {
      let mPath = path + 'api/get-match';
      let str = searchPath;
      let res = await axios({
        method: 'get',
        url: mPath,
        params: str,
        headers: {
          "Accept": "application/json"
        }
      });
      if (res.data.message == 'GetItem Failed') {
        this.setState({
          msg: "데이터 검색에 실패했습니다."
        });
        return;
      } else {
        let msg = res.data.message;
        match = msg['Item'];
        this.setState({
          msg: JSON.stringify(match)
        });
        this.forceUpdate();
        return;
      }
    })();
  }

  componentDidMount() {
    //this.getResult();
  }

  render() {
    if (!isSearched) {
      return (
        <div className="text">
          <h1 style={topicText}>
            404 Not Found
          </h1>
        <h2 style={subText} className="twenty">
          대전 결과를 찾을 수 없습니다.
        </h2>
        </div>
      )
    }
    if (fire) {
      this.getResult();
    }
    return (
      <div>
        {this.state.msg}
      </div>
    );
  }
}