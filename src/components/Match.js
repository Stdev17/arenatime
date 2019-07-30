import React from 'react';
import {
  Modal,
  Form,
  Col,
  Button
} from 'react-bootstrap';
import {
  Stage,
  Layer,
  Image,
  Group,
  Text
} from 'react-konva';
import { char } from '../util/char.js';
import { dist } from '../util/distance.ts';
import { getCoord } from './Block.tsx';

import '../css/daum.css';
import '../css/text.css';

var axios = require('axios');
let path = 'http://localhost:4000/';

var isSearched = false;
var fire = false;
var searchPath = "";

const topicText = {
  fontFamily: 'Daum',
  fontStyle: 'normal',
  fontSize: 36,
  fontColor: '#333333'
}

const subText = {
  fontFamily: 'Daum',
  fontStyle: 'normal',
  fontSize: 28,
  fontColor: '#333333'
}

const smallText = {
  fontFamily: 'Daum',
  fontStyle: 'normal',
  fontSize: 16,
  fontColor: '#333333'
}

export function setSearched() {
  isSearched = true;
  fire = true;
}

export function setSearchPath(str) {
  searchPath = str;
}


let scale = 72;
let attackDeckX = 111;
let defenseDeckX = 642;

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
      y={2+5+scale}
      fontSize={14}
      width={scale}
      align='center'
      fill={'#aaaa44'}
      text={this.state.star}
      />
      </Group>
    );
  }
}

export class Match extends React.Component {
  constructor(props) {
    super(props);

    this.getResult = this.getResult.bind(this);
    this.state = {
      //
      attackImage: null,
      defenseImage: null,
      upImage: null,
      downImage: null,
      resultImage: null,
      resultImageFile: null,
      upvotes: "",
      downvotes: "",
      attackPower: "",
      defensePower: "",
      attackSorted: [],
      defenseSorted: [],
      match: {},
      date: ""
    };
  }

  getResult() {
    //
    fire = false;
    (async _ => {
      let mPath = path + 'api/get-match';
      let str = searchPath;
      let res = await axios({
        method: 'get',
        url: mPath,
        params: str,
        headers: {
          "Accept": "application/json"
        }
      });
      if (res.data.message == 'Getting Item Failed') {
        this.setState({
          msg: "데이터 검색에 오류가 발생했습니다."
        });
        return;
      } else {
        let msg = res.data.message;        
        this.setState({
          match: msg['Item']
        });
      }
      //
      if (this.state.match['imagePath']['S'] !== undefined) {
        let sPath = path + 'api/get-image';
        let str2 = this.state.match['imagePath'];
        let img = await axios({
          method: 'get',
          url: sPath,
          params: str2
        });
        if (res.data.message == 'Getting Image Failed') {
          //
          return;
        } else {
          this.setState({
            resultImageFile: res.data.message
          });
        }
      }
      //
      const aImage = new window.Image();
      const dImage = new window.Image();
      const up = new window.Image();
      const down = new window.Image();
      const resImg = new window.Image();
      //
      let uv, dv;
      if (this.state.match['upvotes']['N'] > 99) {
        uv = "99+";
      } else {
        uv = this.state.match['upvotes']['N'].toString()
      }
      if (this.state.match['downvotes']['N'] > 99) {
        dv = "99+";
      } else {
        dv = this.state.match['downvotes']['N'].toString()
      }
      let ap = "투력 " + this.state.match['attackPower']['N'].toString();
      let dp = "투력 " + this.state.match['defensePower']['N'].toString();
      this.setState({
        upvotes: uv,
        downvotes: dv,
        attackPower: ap,
        defensePower: dp
      });
      //
      let attackParty = [];
      let defenseParty = [];
      //
      let attd = this.state.match['attackDeck']['M'];
      let defd = this.state.match['defenseDeck']['M'];
      for (let a in attd) {
        attackParty.push(attd[a]['S']);
      }
      for (let d in defd) {
        defenseParty.push(defd[d]['S']);
      }
      //
      let atts = this.state.match['attackStar']['M'];
      let defs = this.state.match['defenseStar']['M'];
      this.setState({
        attackSorted: sort(attackParty.slice(), atts),
        defenseSorted: sort(defenseParty.slice(), defs)
      });

      let result = this.state.match['matchResult']['S'];
      if (result === 'attackWin') {
        aImage.src = './win.png';
        dImage.src = './lose.png';
      } else {
        aImage.src = './lose.png';
        dImage.src = './win.png';
      }
      up.src = './thumb-up.png';
      down.src = './thumb-down.png';
      //
      if (this.state.match['imagePath']['S'] !== undefined) {
        let fr = new FileReader();
        fr.readAsDataURL(resultImageFile);
        resImg.src = fr.result;
        resImg.onload = () => {
          this.setState({
            resultImage: resImg
          });
        };
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
      this.setState({
        date: (this.state.match['uploadedDate']['S']).replace(/\s(\S)+/, "")
      });
      this.forceUpdate();
    })();
  }

  showResult() {
    if (this.state.match['imagePath']['S'] !== undefined) {
      return (
        <div>
        <p style={subText} className="ten">
          {'결과 이미지'}
        </p>
        <Stage width={1124} height={150}>
          <Layer>
            <Image
              x={1}
              y={0}
              width={1122}
              height={150}
              image={this.state.resultImage}
            />
          </Layer>
        </Stage>
        </div>
      );
    }
  }

  render() {
    if (!isSearched) {
      return (
        <div className="text">
          <h1 style={topicText}>
            404 Not Found
          </h1>
        <h2 style={subText} className="twenty">
          대전 결과를 찾을 수 없습니다.
        </h2>
        </div>
      )
    }
    if (fire) {
      this.getResult();
    }
    return (
      <div className="text">
        <p style={topicText}>
          {'대전 결과'}
        </p>
        <Stage width={1124} height={122}>
        <Layer>
          {this.state.attackSorted.map((value, index) => {
            return <Slot character={value} setX={getX()+attackDeckX} key={index}/>
          })}
          {this.state.defenseSorted.map((value, index) => {
            return <Slot character={value} setX={getX()+defenseDeckX} key={index}/>
          })}
        </Layer>
        <Layer>
        <Image
          x={0}
          y={2}
          width={110}
          height={48}
          image={this.state.attackImage}
        />
        <Image
          x={525}
          y={2}
          width={110}
          height={48}
          image={this.state.defenseImage}
        />
        <Text
          x={-5}
          y={58}
          fontSize={18}
          width={120}
          align='center'
          text={this.state.attackPower}
        />
        <Text
          x={520}
          y={58}
          fontSize={18}
          width={120}
          align='center'
          text={this.state.defensePower}
        />
        <Text
          x={846}
          y={103}
          fontSize={16}
          width={160}
          align='center'
          text={this.state.date}
        />
        <Image
          x={969}
          y={101}
          width={16}
          height={16}
          image={this.state.upImage}
        />
        <Image
          x={1029}
          y={101}
          width={16}
          height={16}
          image={this.state.downImage}
        />
        <Text
          x={982}
          y={101}
          fontSize={16}
          width={48}
          align='center'
          text={this.state.upvotes}
        />
        <Text
          x={1040}
          y={101}
          fontSize={16}
          width={48}
          align='center'
          text={this.state.downvotes}
        />
        </Layer>
        </Stage>
        {this.showResult()}
      </div>
    );
  }
}


let netX = 0;

function getX() {
  netX += 1;
  return (((netX-1) % 5) * (72+10));
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