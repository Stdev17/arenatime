import React from 'react';
import {
  Image,
  Text,
  Group
} from 'react-konva';

import '../css/daum.css';
import '../css/text.css';

import { getCoord } from './Block.tsx';
import char from '../util/char';
let parse = require('../util/rev_parse.js');
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
    );
  }
}

export class CharSet extends React.Component {

  render() {
    return (
      <Group>
      <Slot character={this.props.stat[0]} setX={this.props.setX} setY={this.props.setY}/>
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
      x={this.props.setX-2}
      y={this.props.setY*102+122}
      fontSize={16}
      fontFamily={'Daum'}
      fontStyle={'normal'}
      fontColor={'#333333'}
      width={124}
      align='center'
      text={parse[this.props.stat[0]]}
      />
      <Text
      x={this.props.setX+86}
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