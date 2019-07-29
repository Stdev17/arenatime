import React from 'react';
import {
  Stage,
  Layer,
  Image,
  Text
} from 'react-konva';
import { char } from '../util/char.js';
import { dist } from '../util/distance.ts';
import { getCoord } from './Block.tsx';

let scale = 64;
let attackDeckX = 112;
let defenseDeckX = 624;

let attackSorted = [];
let defenseSorted = [];

class Slot extends React.Component {
  constructor(props) {
    super(props);
    let c = this.props.character;
    this.state = {
      image: null,
      x: getCoord(char.indexOf(c['char'])).XCoord,
      y: getCoord(char.indexOf(c['char'])).YCoord,
      star: "ddd"
    };
  }
  setCoord() {
    if (this.props.character === "Empty") {
      this.setState({
        x: 1100,
        y: 760
      });
    } else {
      let c = this.props.character;
      this.setState({
        x: getCoord(char.indexOf(c['char'])).XCoord,
        y: getCoord(char.indexOf(c['char'])).YCoord
      });
    }
    let s = "";
    for (let i = 0; i < this.props.character['star']; i++) {
      s += "★";
    }
    this.setState({
      star: s
    });
  }
  componentDidMount() {
    const image = new window.Image();
    image.src = "./characters.jpg";
    this.setCoord();
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
      this.setCoord();
    }
  }
  render() {
    return (
      <Layer>
      <Image
      x={this.props.setX+2}
      y={2}
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
      x={this.props.setX+2}
      y={2+4+scale}
      fontSize={12}
      width={scale}
      align='center'
      fill={'#aaaa44'}
      text={this.state.star}
      />
      </Layer>
    );
  }
}

export class SearchParty extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      attackImage: null,
      defenseImage: null
    };
  }

  getProps() {

    const aImage = new window.Image();
    const dImage = new window.Image();

    let attackParty = [];
    let defenseParty = [];
    let attackStars = [];
    let defenseStars = [];
    //
    let attd = this.props.match['attackDeck']['M'];
    let defd = this.props.match['defenseDeck']['M'];
    for (let a in attd) {
      attackParty.push(attd[a]['S']);
    }
    for (let d in attd) {
      defenseParty.push(defd[d]['S']);
    }
    //
    let atts = this.props.match['attackStar']['M'];
    let defs = this.props.match['defenseStar']['M'];
    attackSorted = sort(attackParty.slice(), atts);
    defenseSorted = sort(defenseParty.slice(), defs);

    let result = this.props.match['matchResult']['S'];
    if (result === 'attackWin') {
      aImage.src = './win.png';
      dImage.src = './lose.png';
    } else {
      aImage.src = './lose.png';
      dImage.src = './win.png';
    }
    aImage.onload = () => {
      this.setState({
        attackImage: aImage
      });
    };
    dImage.onload = () => {
      this.setState({
        defenseImage: dImage
      });
    };
  }

  componentDidMount() {
    this.getProps();
    this.forceUpdate();
  }

  componentDidUpdate(oldProps) {
    const newProps = this.props;
    if (oldProps.match !== newProps.match) {
      this.getProps();
    }
  }

  render() {
    return (
      <Stage width={1024} height={90}>
        <Layer>
        <Image
          x={1}
          y={11}
          width={110}
          height={48}
          image={this.state.attackImage}
        />
        </Layer>
          {attackSorted.map((value, index) => {
            return <Slot character={value} setX={getX()+attackDeckX} key={index}/>
          })}
        <Layer>
        <Image
          x={513}
          y={11}
          width={110}
          height={48}
          image={this.state.defenseImage}
        />
        </Layer>
          {defenseSorted.map((value, index) => {
            return <Slot character={value} setX={getX()+defenseDeckX} key={index}/>
          })}
      </Stage>
    );
  }
}

let netX = 0;

function getX() {
  netX += 1;
  return (((netX-1) % 5) * (64+10));
}

function sort(arr, stars) {
  let tmp = arr.slice();
  let dummy = tmp.slice();
  let res = [];
  let star = [];
  //
  if (stars['fifth']['N'] !== undefined) {
    star.push(stars['fifth']['N']);
  } else {
    star.push(0);
  }
  if (stars['fourth']['N'] !== undefined) {
    star.push(stars['fourth']['N']);
  } else {
    star.push(0);
  }
  if (stars['third']['N'] !== undefined) {
    star.push(stars['third']['N']);
  } else {
    star.push(0);
  }
  if (stars['second']['N'] !== undefined) {
    star.push(stars['second']['N']);
  } else {
    star.push(0);
  }
  if (stars['first']['N'] !== undefined) {
    star.push(stars['first']['N']);
  } else {
    star.push(0);
  }
  //
  for (let i=0; i < dummy.length; i++) {
    let max = 0;
    let slot = "";
    for (let j=0; j < tmp.length; j++) {
      if (max < dist[tmp[j]]) {
        max = dist[tmp[j]];
        slot = tmp[j];
      }
    }
    res.push({'char': slot, 'star': star[i]});
    tmp.splice(tmp.indexOf(slot), 1);
  }
  for (let i=res.length; i<5; i++) {
    res.unshift("Empty");
  }
  return res;
}