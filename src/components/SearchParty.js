import React from 'react';
import {
  Stage,
  Layer,
  Image,
  Group,
  Text
} from 'react-konva';
import { Redirect } from 'react-router-dom';
import { char } from '../util/char.js';
import { dist } from '../util/distance.ts';
import { getCoord } from './Block.tsx';
import { setSearchPath } from './Match';
import { switchFire } from './Container.js';

let scale = 64;

let attackDeckX = 101;
let defenseDeckX = 592;

class Slot extends React.Component {
  constructor(props) {
    super(props);
    let c = this.props.character;
    this.setCoord = this.setCoord.bind(this);
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
      <Group>
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
      </Group>
    );
  }
}

export class SearchParty extends React.Component {
  constructor(props) {
    super(props);
    this.goProfile = this.goProfile.bind(this);
    this.getProps = this.getProps.bind(this);
    this.checkLink = this.checkLink.bind(this);
    this.state = {
      attackImage: null,
      defenseImage: null,
      upImage: null,
      downImage: null,
      magImage: null,
      upHighlighted: 0.5,
      downHighlighted: 0.5,
      upvotes: "",
      downvotes: "",
      link: false,
      attackSorted: [],
      defenseSorted: [],
      date: ""
    };
  }

  getProps() {

    const aImage = new window.Image();
    const dImage = new window.Image();
    const up = new window.Image();
    const down = new window.Image();
    const mag = new window.Image();
    //
    let uv, dv;
    if (this.props.match['upvotes']['N'] > 99) {
      uv = "99+";
    } else {
      uv = this.props.match['upvotes']['N'].toString()
    }
    if (this.props.match['downvotes']['N'] > 99) {
      dv = "99+";
    } else {
      dv = this.props.match['downvotes']['N'].toString()
    }
    this.setState({
      upvotes: uv,
      downvotes: dv
    })
    //
    let attackParty = [];
    let defenseParty = [];
    //
    let attd = this.props.match['attackDeck']['M'];
    let defd = this.props.match['defenseDeck']['M'];
    for (let a in attd) {
      attackParty.push(attd[a]['S']);
    }
    for (let d in defd) {
      defenseParty.push(defd[d]['S']);
    }
    //
    let atts = this.props.match['attackStar']['M'];
    let defs = this.props.match['defenseStar']['M'];
    this.setState({
      attackSorted: sort(attackParty.slice(), atts),
      defenseSorted: sort(defenseParty.slice(), defs)
    });

    let result = this.props.match['matchResult']['S'];
    if (result === 'attackWin') {
      aImage.src = './win.png';
      dImage.src = './lose.png';
    } else {
      aImage.src = './lose.png';
      dImage.src = './win.png';
    }
    up.src = './thumb-up.png';
    down.src = './thumb-down.png';
    mag.src = './mag.png';
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
    up.onload = () => {
      this.setState({
        upImage: up
      });
    };
    down.onload = () => {
      this.setState({
        downImage: down
      });
    };
    mag.onload = () => {
      this.setState({
        magImage: mag
      });
    };
    this.setState({
      date: (this.props.match['uploadedDate']['S']).replace(/\s(\S)+/, "")
    });
  }

  goProfile() {
    switchFire();
    setSearchPath(this.props.match['matchId']['S']);
    this.setState({
      link: true
    });
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

  checkLink() {
    if (this.state.link) {
      return <Redirect to='/match'/>
    }
  }

  render() {
    return (
      <div>
        {this.checkLink()}
      <Stage width={1124} height={90}>
        <Layer>
        <Image
          x={-10}
          y={11}
          width={110}
          height={48}
          image={this.state.attackImage}
        />
        </Layer>
        <Layer>
          {this.state.attackSorted.map((value, index) => {
            return <Slot character={value} setX={getX()+attackDeckX} key={index}/>
          })}
        </Layer>
        <Layer>
        <Image
          x={475}
          y={11}
          width={110}
          height={48}
          image={this.state.defenseImage}
        />
        </Layer>
        <Layer>
          {this.state.defenseSorted.map((value, index) => {
            return <Slot character={value} setX={getX()+defenseDeckX} key={index}/>
          })}
        </Layer>
        <Layer>
          <Text
            x={941}
            y={2}
            fontSize={16}
            width={160}
            align='center'
            text={this.state.date}
          />
        <Image
          x={969}
          y={28}
          width={16}
          height={16}
          image={this.state.upImage}
          opacity={this.state.upHighlighted}
          onClick={this.upClicked}
        />
        <Image
          x={1029}
          y={28}
          width={16}
          height={16}
          image={this.state.downImage}
          opacity={this.state.downHighlighted}
          onClick={this.downClicked}
        />
        <Text
          x={982}
          y={30}
          fontSize={16}
          width={48}
          align='center'
          text={this.state.upvotes}
        />
        <Text
          x={1040}
          y={30}
          fontSize={16}
          width={48}
          align='center'
          text={this.state.downvotes}
        />
        <Image
          x={1009}
          y={54}
          width={24}
          height={24}
          image={this.state.magImage}
          onClick={this.goProfile}
        />
        </Layer>
      </Stage>
      </div>
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