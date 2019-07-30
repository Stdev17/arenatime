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

export var isSearched = false;
export var searchPath = "";
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

export class Match extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      //
    };
  }

  componentDidMount() {
    (async _ => {
      let mPath = path + 'api/get-match';
      let str = searchPath;
      match = await axios({
        method: 'get',
        url: mPath,
        params: str,
        headers: {
          "Accept": "application/json"
        }
      });
    })();
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
    return (
      <div>

      </div>
    );
  }
}