import React from 'react';
import {
  Image,
  Text,
  Group
} from 'react-konva';

import '../css/daum.css';
import '../css/text.css';

import { sort } from './Party.js';
import { getCoord } from './Block.tsx';
import { char } from '../util/char.js';

let parse = require('../util/rev_parse.js');
let prime = require('../util/prime.js').prime;
let scale = 76;

class Slot extends React.Component {
  constructor(props) {
    super(props);
    let c = this.props.character;
    this.state = {
      image: null,
      x: getCoord(char.indexOf(c)).XCoord,
      y: getCoord(char.indexOf(c)).YCoord
    };
  }
  componentDidMount() {
    const image = new window.Image();
    image.src = "/arenatime/characters.jpg";
    if (this.props.character === "Empty") {
      this.setState({
        x: 1100,
        y: 760
      });
    } else {
      let c = this.props.character;
      this.setState({
        x: getCoord(char.indexOf(c)).XCoord,
        y: getCoord(char.indexOf(c)).YCoord
      });
    }
    image.onload = () => {
      // setState will redraw layer
      // because "image" property is changed
      this.setState({
        image: image
      });
    };
  }
  componentDidUpdate(oldProps) {
    const newProps = this.props;
    if(newProps.character !== oldProps.character) {
      if (newProps.character === "Empty") {
        this.setState({
          x: 1100,
          y: 760
        });
      } else {
        let c = newProps.character;
        this.setState({
          x: getCoord(char.indexOf(c)).XCoord,
          y: getCoord(char.indexOf(c)).YCoord
        });
      }
    }
  }
  render() {
    return (
      <Group>
      <Image
      x={this.props.setX+22}
      y={this.props.setY*102+42}
      width={scale}
      height={scale}
      image={this.state.image}
      crop = {{
        x: this.state.x,
        y: this.state.y,
        width: 76,
        height: 76
      }}
      stroke={'black'}
      strokeWidth={2}
      />
      <Text
      x={this.props.setX-2}
      y={this.props.setY*102+122}
      fontSize={16}
      fontFamily={'Daum'}
      fontStyle={'normal'}
      fontColor={'#333333'}
      width={124}
      align='center'
      text={parse[this.props.character]}
      />
      </Group>
    );
  }
}

class Duo extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let x = [this.props.setX, this.props.setX+86];
    //
    let team = [];
    for (let p in prime) {
      if (this.props.duos % prime[p] === 0) {
        team.push(p);
      }
    }
    let sorted = sort(team).splice(3, 2);
    return (
      <Group>
      {sorted.map((value, index) => {
        return <Slot character={value} setX={x[sorted.indexOf(value)]} setY={this.props.setY} key={index}/>
      })}
      </Group>
    );    
  }

}

class Trio extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let x = [this.props.setX, this.props.setX+86, this.props.setX+172];
    //
    let team = [];
    for (let p in prime) {
      if (this.props.trios % prime[p] === 0) {
        team.push(p);
      }
    }
    let sorted = sort(team).splice(2, 3);
    return (
      <Group>
      {sorted.map((value, index) => {
        return <Slot character={value} setX={x[sorted.indexOf(value)]} setY={this.props.setY} key={index}/>
      })}
      </Group>
    );    
  }
}

export class TeamSet extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    if (this.props.isDuo) {
      return (
        <Group>
          <Duo duos={this.props.stat[0]} setX={this.props.setX} setY={this.props.setY}/>
          <Text
          x={this.props.setX-22}
          y={this.props.setY*102+77}
          fontSize={20}
          fontFamily={'Daum'}
          fontStyle={'normal'}
          fontColor={'#333333'}
          width={42}
          align='center'
          text={this.props.setY+1}
          />
          <Text
          x={this.props.setX+172}
          y={this.props.setY*102+77}
          fontSize={21}
          fontFamily={'Daum'}
          fontStyle={'normal'}
          fontColor={'#333333'}
          width={124}
          align='center'
          text={this.props.stat[1]['val']+'%'}
          />
        </Group>
      );
    } else {
      return (
        <Group>
          <Trio trios={this.props.stat[0]} setX={this.props.setX} setY={this.props.setY}/>
          <Text
          x={this.props.setX-22}
          y={this.props.setY*102+77}
          fontSize={20}
          fontFamily={'Daum'}
          fontStyle={'normal'}
          fontColor={'#333333'}
          width={42}
          align='center'
          text={this.props.setY+1}
          />
          <Text
          x={this.props.setX+258}
          y={this.props.setY*102+77}
          fontSize={21}
          fontFamily={'Daum'}
          fontStyle={'normal'}
          fontColor={'#333333'}
          width={124}
          align='center'
          text={this.props.stat[1]['val']+'%'}
          />
        </Group>
      );
    }
  }
}