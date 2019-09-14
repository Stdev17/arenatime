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
import char from '../util/char';

import primeChar from '../util/prime';

let parse = require('../util/rev_parse.js');

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
    let comp = 0;
    if (this.props.scale === 60) {
      comp = 20;
    }
    return (
      <Group>
      <Image
      x={this.props.setX+98-this.props.scale-comp*0.5}
      y={this.props.setY*102+42+this.props.mob+comp*0.5}
      width={this.props.scale}
      height={this.props.scale}
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
      x={this.props.setX+74-this.props.scale-comp}
      y={this.props.setY*102+198+this.props.mob-this.props.scale-comp}
      fontSize={16}
      fontFamily={'GyeonggiTitleM'}
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

  render() {
    let x = [this.props.setX, this.props.setX+86];
    //
    let team = [];
    for (let p in primeChar) {
      if (this.props.duos % primeChar[p] === 0) {
        team.push(p);
      }
    }
    let sorted = sort(team).splice(3, 2);
    return (
      <Group>
      {sorted.map((value, index) => {
        return <Slot character={value} setX={x[sorted.indexOf(value)]} setY={this.props.setY} scale={this.props.scale} mob={this.props.mob} key={index}/>
      })}
      </Group>
    );    
  }

}

class Trio extends React.Component {

  render() {
    let x = [this.props.setX, this.props.setX+86, this.props.setX+172];
    if (this.props.scale === 60) {
      x = [this.props.setX, this.props.setX+80, this.props.setX+160];
    }
    //
    let team = [];
    for (let p in primeChar) {
      if (this.props.trios % primeChar[p] === 0) {
        team.push(p);
      }
    }
    let sorted = sort(team).splice(2, 3);
    return (
      <Group>
      {sorted.map((value, index) => {
        return <Slot character={value} setX={x[sorted.indexOf(value)]} setY={this.props.setY} mob={this.props.mob} scale={this.props.scale} key={index}/>
      })}
      </Group>
    );    
  }
}

export class TeamSet extends React.Component {

  render() {
    if (this.props.isDuo) {
      let mob = 0;
      if (this.props.mob === undefined) {
        //
      } else {
        mob = this.props.mob;
      }
      return (
        <Group>
          <Duo duos={this.props.stat[0]} setX={this.props.setX} setY={this.props.setY} mob={mob} scale={this.props.scale}/>
          <Text
          x={this.props.setX-22}
          y={this.props.setY*102+77+mob}
          fontSize={20}
          fontFamily={'GyeonggiTitleM'}
          fontStyle={'normal'}
          fontColor={'#333333'}
          width={42}
          align='center'
          text={this.props.setY+1}
          />
          <Text
          x={this.props.setX+172}
          y={this.props.setY*102+77+mob}
          fontSize={21}
          fontFamily={'GyeonggiTitleM'}
          fontStyle={'normal'}
          fontColor={'#333333'}
          width={124}
          align='center'
          text={this.props.stat[1]['val']+'%'}
          />
        </Group>
      );
    } else {
      let mob = 0;
      if (this.props.mob === undefined) {
        //
      } else {
        mob = this.props.mob;
      }
      return (
        <Group>
          <Trio trios={this.props.stat[0]} setX={this.props.setX} setY={this.props.setY} mob={mob} scale={this.props.scale}/>
          <Text
          x={this.props.setX-22}
          y={this.props.setY*102+77+mob}
          fontSize={20}
          fontFamily={'GyeonggiTitleM'}
          fontStyle={'normal'}
          fontColor={'#333333'}
          width={42}
          align='center'
          text={this.props.setY+1}
          />
          <Text
          x={this.props.setX+143+this.props.scale*1.5}
          y={this.props.setY*102+77+mob}
          fontSize={21}
          fontFamily={'GyeonggiTitleM'}
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