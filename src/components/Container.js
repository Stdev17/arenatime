import React from 'react';

import {
  Container,
  Card
} from 'react-bootstrap';

import { Register } from './Register';
import { Search } from './Search';
import '../css/container.css';
import { Match } from './Match';
import { Part } from './Part';
import { Stat } from './Stat';
import { Rank } from './Rank';

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

export class pagePart extends React.Component {
  render() {
    return (
      <div className="top">
      <Container>
        <Card>
          <Part/>
        </Card>
      </Container>
      </div>
    );
  }
}

export class pageStat extends React.Component {
  render() {
    return (
      <div className="top">
      <Container>
        <Card>
          <Stat/>
        </Card>
      </Container>
      </div>
    );
  }
}

export class pageRank extends React.Component {
  render() {
    return (
      <div className="top">
      <Container>
        <Card>
          <Rank/>
        </Card>
      </Container>
      </div>
    );
  }
}