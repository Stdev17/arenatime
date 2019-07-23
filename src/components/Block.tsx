import * as React from 'react';
import {
  Stage,
  Layer,
  Rect,
  Image
} from 'react-konva';

import { party } from './SetParty';

import { char } from '../util/char';

interface coord {
  XCoord: number, YCoord: number
}

interface IBlockProps {
  character: string,
  setX: number,
  setY: number,
  reset: boolean
}

interface IBlockState {
  image: any,
  x: number,
  y: number,
  str: number,
  opacity: number
}

let konva = require('konva');
let scale = 38;

export class Block extends React.Component<IBlockProps, IBlockState> {
  constructor(props: any) {
    super(props);
    this.ClickChar = this.ClickChar.bind(this);
    let c: string = this.props.character;

    this.state = {
      image: null,
      x: getCoord(char.indexOf(c)).XCoord,
      y: getCoord(char.indexOf(c)).YCoord,
      str: 0,
      opacity: 0.5
    }
  }
  componentDidMount() {
    
    const image = new (window as any).Image();
    
    image.src = "./characters.jpg";
    
    image.onload = () => {
      // setState will redraw layer
      // because "image" property is changed
      this.setState({
        image: image
      }/*,
      () => {
        this.state.image.cache();
        this.state.image.getLayer().draw();
      }*/);
    };
    if (party.includes(this.props.character)) {
      this.setState({
        str: 4,
        opacity: 1
      });
    }
    if (this.props.reset) {
      this.setState({
        str: 0,
        opacity: 0.5
      });
    }
  }
  ClickChar() {
    if (party.includes(this.props.character)) {
      this.setState({
        str: 0,
        opacity: 0.5
      });
      party.splice(party.indexOf(this.props.character), 1);
    }
    else if (party.length < 5) {
      this.setState({
        str: 4,
        opacity: 1
      });
      party.push(this.props.character);
    }
  }
  render() {
    return (
      <Image
      x={this.props.setX+8}
      y={this.props.setY+5}
      width={scale}
      height={scale}
      image={this.state.image}
      opacity={this.state.opacity}
      crop = {{
        x: this.state.x,
        y: this.state.y,
        width: 76,
        height: 76
      }}
      stroke={'#bb3333'}
      strokeWidth={this.state.str}
      onClick={this.ClickChar}
      />
    );
  }
}

export function getCoord(num: number) {
  let x: number = (((num-1) % 8) * 76) * 2;
  let y: number = (Math.floor((num-1) / 8) % 8) * 76;
  let res: coord = {XCoord: x, YCoord: y};
  return res;
}