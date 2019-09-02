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

import { MobSearch } from './MobSearch';
import { MobRegister } from './MobRegister';
import { MobPart } from './MobPart';
import { MobMatch } from './MobMatch';
import { MobStat } from './MobStat';
import { MobRank } from './MobRank';

var fireMatch = false;
export function switchFire() {
  if (fireMatch) {
    fireMatch = false;
  } else {
    fireMatch = true;
  }
}

let setWidth = {
  width: 412
};

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

export class pageMobSearch extends React.Component {
  render() {
    return (
      <div className="top" style={setWidth}>
      <Container>
        <Card>
          <MobSearch/>
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

export class pageMobRegister extends React.Component {
  render() {
    return (
      <div className="top" style={setWidth}>
      <Container>
        <Card>
          <MobRegister/>
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

export class pageMobMatch extends React.Component {
  render() {
    return (
      <div className="top" style={setWidth}>
      <Container>
        <Card>
          <MobMatch fire={fireMatch}/>
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

export class pageMobPart extends React.Component {
  render() {
    return (
      <div className="top" style={setWidth}>
      <Container>
        <Card>
          <MobPart/>
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

export class pageMobStat extends React.Component {
  render() {
    return (
      <div className="top" style={setWidth}>
      <Container>
        <Card>
          <MobStat/>
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

export class pageMobRank extends React.Component {
  render() {
    return (
      <div className="top" style={setWidth}>
      <Container>
        <Card>
          <MobRank/>
        </Card>
      </Container>
      </div>
    );
  }
}