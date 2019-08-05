/* ***************** 
*
* fileName: Match
* author: Leta
* latestModified: 2019-07-30
* Contact: https://github.com/Stdev17
*
********************/

import React from 'react';
import {
  Button
} from 'react-bootstrap';
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

import '../css/daum.css';
import '../css/text.css';

import { path } from '../util/dummy';

var fileType = require('file-type');
var axios = require('axios');


var searchPath = "";
var resultImageFile = null;

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
    this.setCoord = this.setCoord.bind(this);
    this.state = {
      image: null,
      x: getCoord(char.indexOf(c['char'])).XCoord,
      y: getCoord(char.indexOf(c['char'])).YCoord,
      star: ""
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
    if (this.props.character['star'] < 6) {
      this.setState({
        star: s
      });
    }
  }
  componentDidMount() {
    const image = new window.Image();
    image.src = "/arenatime/characters.jpg";
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
    this.showResult = this.showResult.bind(this);
    this.getBack = this.getBack.bind(this);
    this.showMemo = this.showMemo.bind(this);
    this.upClicked = this.upClicked.bind(this);
    this.downClicked = this.downClicked.bind(this);
    this.setVotes = this.setVotes.bind(this);
    this.vote = this.vote.bind(this);
    this.checkImg = this.checkImg.bind(this);
    this.state = {
      //
      attackImage: null,
      defenseImage: null,
      upImage: null,
      downImage: null,
      resultImage: null,
      upHighlighted: 0.5,
      downHighlighted: 0.5,
      upvotes: "",
      downvotes: "",
      attackPower: "",
      defensePower: "",
      attackSorted: [],
      defenseSorted: [],
      link: false,
      fire: false,
      match: {},
      date: ""
    };
  }

  checkImg() {
    if (this.props.match['imagePath']['S'] !== 'PlaceHolder') {
      return (
        <Image
        x={1009}
        y={54}
        width={24}
        height={24}
        image={this.state.magImage}
        onClick={this.goProfile}
        onTap={this.goProfile}
      />
      );
    }
  }

  getBack() {
    this.setState({
      link: true
    });
  }

  setVotes() {
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
    this.setState({
      upvotes: uv,
      downvotes: dv
    });
  }

  getResult() {
    //
    this.setState({
      fire: false
    });
    if (searchPath === "") {
      return;
    }
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
      if (res.data.message === 'Getting Item Failed') {
        searchPath = "";
        return;
      } else {
        let msg = res.data.message;        
        this.setState({
          match: msg['Item']
        });
        if (res.data.vote === 'Upvoted') {
          this.setState({
            upHighlighted: 1
          });
        } else if (res.data.vote === 'Downvoted') {
          this.setState({
            downHighlighted: 1
          });
        }
      }
      //
      if (this.state.match['imagePath']['S'] !== 'PlaceHolder') {
        let sPath = path + 'api/get-image';
        let str2 = this.state.match['imagePath']['S'];
        let img = await axios({
          method: 'get',
          url: sPath,
          params: str2
        });
        if (img.data.message === 'Getting Image Failed') {
          //
          return;
        } else {
          resultImageFile = new Buffer(img.data.message.Body.data);
        }
      }
      //
      const aImage = new window.Image();
      const dImage = new window.Image();
      const up = new window.Image();
      const down = new window.Image();
      const resImg = new window.Image();
      //
      let ap = "";
      let dp = "";
      if (this.state.match['attackPower']['N'] > 0) {
        ap = "투력 " + this.state.match['attackPower']['N'].toString();
        dp = "투력 " + this.state.match['defensePower']['N'].toString();
      }
      this.setState({
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
      this.setVotes();
      //
      let atts = this.state.match['attackStar']['M'];
      let defs = this.state.match['defenseStar']['M'];
      this.setState({
        attackSorted: sort(attackParty.slice(), atts),
        defenseSorted: sort(defenseParty.slice(), defs)
      });

      let result = this.state.match['matchResult']['S'];
      if (result === 'attackWin') {
        aImage.src = '/arenatime/win.png';
        dImage.src = '/arenatime/lose.png';
      } else {
        aImage.src = '/arenatime/lose.png';
        dImage.src = '/arenatime/win.png';
      }
      up.src = '/arenatime/thumb-up.png';
      down.src = '/arenatime/thumb-down.png';
      //
      if (this.state.match['imagePath']['S'] !== 'PlaceHolder') {
        let fileMime = fileType(resultImageFile);
        if (fileMime.ext === 'png') {
          resImg.src = 'data:image/png;base64,' + resultImageFile.toString('base64');
        } else {
          resImg.src = 'data:image/jpeg;base64,' + resultImageFile.toString('base64');
        }
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
    })();
  }


  showResult() {
    if (this.state.link) {
      return <Redirect to='/arenatime/search'/>
    }
    if (this.state.match['imagePath']['S'] !== 'PlaceHolder') {
      return (
        <div>
        <p style={subText} className="ten">
          {'결과 이미지'}
        </p>
        <Stage width={1002} height={134}>
          <Layer>
            <Image
              x={1}
              y={0}
              width={1000}
              height={134}
              image={this.state.resultImage}
            />
          </Layer>
        </Stage>
        </div>
      );
    }
  }

  showMemo() {
    if (this.state.match['memo'] !== undefined) {
      if (this.state.match['memo']['S'] !== 'PlaceHolder') {
        return (
          <div>
            <p style={subText} className="ten">
              {'참고사항'}
            </p>
            <p style={smallText} className="ten">
              {this.state.match['memo']['S']}
            </p>
          </div>
        );
      }
    }
    return;
  }

  upClicked() {
    this.vote("up");
  }

  downClicked() {
    this.vote("down");
  }

  vote(param) {
    let dat = {
      matchId: this.state.match['matchId']['S'],
      vote: param
    }
    let mPath = path + 'api/vote';
    (async _ => { 
      let res = await axios({
        method: 'put',
        url: mPath,
        data: dat,
        headers: {
          Accept: "application/json"
        }
      });
      console.log(res.data);
      if (res.data.message === 'Vote Succeeded') {
        let v = res.data.vote;
        let m = this.state.match;
        console.log(v);
        if (v.up === 'vote') {
          m['upvotes']['N'] = Number(m['upvotes']['N']) + 1;
          this.setState({
            upHighlighted: 1,
            match: m
          });
        } else if (v.up === 'unvote') {
          m['upvotes']['N'] = Number(m['upvotes']['N']) - 1;
          this.setState({
            upHighlighted: 0.5,
            match: m
          });
        }
        if (v.down === 'vote') {
          m['downvotes']['N'] = Number(m['downvotes']['N']) + 1;
          this.setState({
            downHighlighted: 1,
            match: m
          });
        } else if (v.down === 'unvote') {
          m['downvotes']['N'] = Number(m['downvotes']['N']) - 1;
          this.setState({
            downHighlighted: 0.5,
            match: m
          });
        }
        this.setVotes();

      }
    })();
  }

  componentDidMount() {
    this.getResult();
  }

  componentDidUpdate(oldProps, oldStates) {
    if (oldStates.fire !== this.state.fire) {
      this.getResult();
    }
  }

  render() {
    if (searchPath === "" || this.state.match['matchId'] === undefined) {
      return (
        <div className="text">
          <h1 style={topicText}>
            대전 로드 중
          </h1>
        <h2 style={subText} className="twenty">
          잠시만 기다려 주세요.
        </h2>
        </div>
      )
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
          x={804}
          y={105}
          fontSize={16}
          width={160}
          align='center'
          text={this.state.date}
        />
        <Image
          x={940}
          y={103}
          width={16}
          height={16}
          opacity={this.state.upHighlighted}
          image={this.state.upImage}
          onClick={this.upClicked}
          onTap={this.upClicked}
        />
        <Image
          x={1000}
          y={105}
          width={16}
          height={16}
          opacity={this.state.downHighlighted}
          image={this.state.downImage}
          onClick={this.downClicked}
          onTap={this.downClicked}
        />
        <Text
          x={953}
          y={103}
          fontSize={16}
          width={48}
          align='center'
          text={this.state.upvotes}
        />
        <Text
          x={1011}
          y={103}
          fontSize={16}
          width={48}
          align='center'
          text={this.state.downvotes}
        />
        </Layer>
        </Stage>
        {this.showResult()}
        {this.showMemo()}
        <p style={subText}>
          <Button variant='success' onClick={this.getBack}>
            {'돌아가기'}
          </Button>
        </p>
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