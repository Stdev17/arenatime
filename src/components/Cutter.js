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
import { getChar } from '../util/distance';

import '../css/cutter.css';
import { getMaxListeners } from 'cluster';

var netX = 0;
var netY = 0;

function getX() {
  netX += 1;
  return (((netX-1) % 8) * (76+20));
}

function getY() {
  netY += 1;
  return (Math.floor((netY-1) / 8) % 8) * (76+20);
}

export class Cutter extends Component {

  render() {
    let c = getChar();
    netX = 0;
    netY = 0;
    return (
      <Stage width={720} height={540}>
        <Layer>
          <For each="char" of={c}>
            <Block character={char} x={getX} y={getY}/>
          </For>
        </Layer>
      </Stage>
    );
  }
}



const char = [
  'Empty',
  'Makoto',
  'Mitsuki',
  'Jyun'
];