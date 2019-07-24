import React from 'react';

import {
  Container,
  Card
} from 'react-bootstrap';

import { register } from './Register';
import { search } from './Search';
import '../css/container.css';

export class pageSearch extends React.Component {
  render() {
    return (
      <div className="top">
      <Container>
        <Card>
          {search}
        </Card>
      </Container>
      </div>
    );
  }
}
export class pageRegister extends React.Component {
  render() {
    return (
      <div className="top">
      <Container>
        <Card>
          {register}
        </Card>
      </Container>
      </div>
    );
  }
}