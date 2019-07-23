import React from 'react';
import {
  Stage,
  Layer,
  Rect,
  Image
} from 'react-konva';
import { Konva } from 'konva';
import { dist } from '../util/distance.ts';
import { getCoord } from './Block.tsx';
import { char } from '../util/char.js';

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
    if (this.props.character === "Empty") {
      image.src = "./gray.jpeg";
    } else {
      image.src = "./characters.jpg";
    }
    image.onload = () => {
      // setState will redraw layer
      // because "image" property is changed
      this.setState({
        image: image
      });
    };
  }
  render() {
    //console.log(this.props.character, this.state.image);
    return (
      <Image
      x={this.props.setX+8}
      y={0}
      width={scale}
      height={scale}
      image={this.state.image}
      crop = {{
        x: this.state.x,
        y: this.state.y,
        width: 76,
        height: 76
      }}
      />
    );
  }
}

export class Party extends React.Component {
  constructor(props) {
    super(props);
    this.state = {

    };
  }
  render() {
    let c = sort(this.props.party);
    return (
      <Stage width={480} height={80}>
        <Layer>
          {c.map((value, index) => {
            return <Slot character={value} setX={getX()} key={index}/>
          })}
        </Layer>
      </Stage>
    );
  }
}

let netX = 0;

function getX() {
  netX += 1;
  return (((netX-1) % 5) * (76+12));
}

function sort(arr) {
  let tmp = arr.slice();
  let dummy = tmp.slice();
  let res = [];
  for (let i=0; i < dummy.length; i++) {
    let max = 0;
    let slot = "";
    for (let j=0; j < tmp.length; j++) {
      if (max < dist[tmp[j]]) {
        max = dist[tmp[j]];
        slot = tmp[j];
      }
    }
    res.push(slot);
    tmp.splice(tmp.indexOf(slot), 1);
  }
  for (let i=res.length; i<5; i++) {
    res.unshift("Empty");
  }
  return res;
}