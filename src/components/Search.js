import React from 'react';
import {
  Form,
  Col,
  Button
} from 'react-bootstrap';
import { SetParty } from './SetParty';

import '../css/daum.css';
import '../css/text.css';

var party = [];

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

export const search = (
  <div className="text">
  <h1 style={topicText}>
    대전 검색
  </h1>
  <h2 style={subText} className="twenty">
    검색 설정
  </h2>
  <h3 style={smallText} className="ten">
    <Form>
      <Form.Row>
        <Form.Group as={Col} controlId="formGridPosition">
          <Form.Label>덱 유형</Form.Label>
          <Form.Control as="select">
            <option>방어</option>
            <option>공격</option>
          </Form.Control>
        </Form.Group>
        <Form.Group as={Col} controlId="formGridPosition">
          <Form.Label>결과</Form.Label>
          <Form.Control as="select">
            <option>패배</option>
            <option>승리</option>
          </Form.Control>
        </Form.Group>
        <Form.Group as={Col} controlId="formGridPosition">
          <Form.Label>아레나</Form.Label>
          <Form.Control as="select">
            <option>전체</option>
            <option>배틀 아레나</option>
            <option>프린세스 아레나</option>
          </Form.Control>
        </Form.Group>
        <Form.Group as={Col} controlId="formGridPosition">
          <Form.Label>기간</Form.Label>
          <Form.Control as="select">
            <option>전체</option>
            <option>7일 이내</option>
            <option>30일 이내</option>
            <option>3개월 이내</option>
          </Form.Control>
        </Form.Group>
        <Form.Group as={Col} controlId="formGridPosition">
          <Form.Label>전투력</Form.Label>
          <Form.Control as="select">
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
          <Form.Control as="select">
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
    <Button variant='success'>
      검색 시작
    </Button>
  </p>
  
  </div>
);