import React, {Component} from 'react';
import {
  Card
} from 'react-bootstrap';
import {
  Stage,
  Layer,
  Rect,
  Image
} from 'react-konva';
import { Konva } from 'konva';
import { Block } from './Block.tsx';
import { getChar } from '../util/distance.ts';
import { party } from './SetParty';

import '../css/cutter.css';

var netX = 0;
var netY = 0;

function getX() {
  netX += 1;
  return (((netX-1) % 10) * (38+8));
}

function getY() {
  netY += 1;
  return (Math.floor((netY-1) / 10)) * (38+8);
}



export class Cutter extends Component {

  render() {
    let c = getChar();
    netX = 0;
    netY = 0;
    return (
      <Stage width={480} height={240}>
        <Layer>
          {c.map((value, index) => {
            return <Block character={value} setX={getX()} setY={getY()} key={index}/>
          })}
        </Layer>
      </Stage>
    );
  }
}