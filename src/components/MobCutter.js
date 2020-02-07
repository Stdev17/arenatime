import React, {Component} from 'react';
import {
  Stage,
  Layer
} from 'react-konva';
import { Block } from './Block.tsx';
import { getChar } from '../util/distance.ts';

var netX = 0;
var netY = 0;
var col = 7;
var char = 70;

function getX() {
  netX += 1;
  return (((netX-1) % col) * (47+7)) - 7.5 + Math.floor((netY) / (char-char%col)) * (col-(char%col)) * 27;
}

function getY() {
  netY += 1;
  return (Math.floor((netY-1) / col)) * (47+7);
}

export class MobCutter extends Component {

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
      <Stage width={400} height={550}>
        <Layer>
          {c.map((value, index) => {
            return <Block character={value} party={this.state.p} setX={getX()} setY={getY()} scale={47} key={index}/>
          })}
        </Layer>
      </Stage>
    );
  }
}