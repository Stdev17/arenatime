import React, {Component} from 'react';
import {
  Stage,
  Layer
} from 'react-konva';
import { Block } from './Block.tsx';
import { getChar } from '../util/distance.ts';

var netX = 0;
var netY = 0;
var col = 9;
var char = 53;

function getX() {
  netX += 1;
  return (((netX-1) % col) * (38+8)) + 23 + Math.floor((netY) / (char-char%col)) * (col-(char%col)) * 23;
}

function getY() {
  netY += 1;
  return (Math.floor((netY-1) / col)) * (38+8);
}

export class Cutter extends Component {

  constructor(props) {
    super(props);
    this.state = {
      p: this.props.party
    };
  }

  render() {
    let c = getChar();
    netX = 0;
    netY = 0;
    return (
      <Stage width={480} height={280}>
        <Layer>
          {c.map((value, index) => {
            return <Block character={value} party={this.state.p} setX={getX()} setY={getY()} key={index}/>
          })}
        </Layer>
      </Stage>
    );
  }
}