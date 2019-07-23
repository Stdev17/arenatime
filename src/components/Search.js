import React from 'react';
import {
  Button
} from 'react-bootstrap';
import { Party } from './SetParty';

import '../css/daum.css';
import '../css/text.css';

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

export const search = (
  <div className="text">
  <h1 style={topicText}>
    대전 검색 
  </h1>
  <h2 style={subText}>
    <br/>
    <Party/>
  </h2>
  </div>
);