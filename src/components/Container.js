import React from 'react';

import {
  Container,
  Card
} from 'react-bootstrap';

import { Register } from './Register';
import { Search } from './Search';
import '../css/container.css';
import { Match } from './Match';

var fireMatch = false;
export function switchFire() {
  if (fireMatch) {
    fireMatch = false;
  } else {
    fireMatch = true;
  }
}

export class pageSearch extends React.Component {
  render() {
    return (
      <div className="top">
      <Container>
        <Card>
          <Search/>
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
          <Register/>
        </Card>
      </Container>
      </div>
    );
  }
}

export class pageMatch extends React.Component {
  render() {
    return (
      <div className="top">
      <Container>
        <Card>
          <Match fire={fireMatch}/>
        </Card>
      </Container>
      </div>
    );
  }
}