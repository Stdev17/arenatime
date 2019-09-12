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
  Form,
  Col,
  Button,
  Modal,
  Pagination
} from 'react-bootstrap';
import {
  Stage,
  Layer,
  Image,
  Group,
  Text
} from 'react-konva';
import { Redirect } from 'react-router-dom';
import char from '../util/char';
import { dist } from '../util/distance.ts';
import { getCoord } from './Block.tsx';

import '../css/daum.css';
import '../css/text.css';

import { path } from '../util/dummy';
import { Comment } from './Comment';

var fileType = require('file-type');
var axios = require('axios');

var fromSearch = false;
var searchPath = "";
var resultImageFile = null;
var offset = 1;
var max = 1;
var unit = 5;
var comments = [];

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

export function setSearchPath(str, f) {
  searchPath = str;
  fromSearch = f;
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
    this.showComment = this.showComment.bind(this);
    this.inputHandler = this.inputHandler.bind(this);
    this.putComment = this.putComment.bind(this);
    this.upClicked = this.upClicked.bind(this);
    this.downClicked = this.downClicked.bind(this);
    this.setVotes = this.setVotes.bind(this);
    this.vote = this.vote.bind(this);
    this.checkImg = this.checkImg.bind(this);
    this.setComment = this.setComment.bind(this);
    this.updateOffset = this.updateOffset.bind(this);
    this.state = {
      //
      voting: false,
      attackImage: null,
      defenseImage: null,
      upImage: null,
      downImage: null,
      resultImage: null,
      deleteImage: null,
      upHighlighted: 0.5,
      downHighlighted: 0.5,
      imageWidth: 1124,
      imageHeight: 632,
      upvotes: "",
      downvotes: "",
      attackPower: "",
      defensePower: "",
      attackSorted: [],
      defenseSorted: [],
      link: false,
      fire: false,
      match: {},
      date: "",
      memo: "",
      title_msg: "등록 중",
      msg: "잠시만 기다려 주세요.",
      errShow: false,
      comments: []
    };

    comments = [];

    this.errorShow = () => {
      this.setState({ errShow: true });
    };

    this.errorHide = () => {
      this.setState({ errShow: false });
    };

    this.checkSize = (w, h) => {
      let width, height;
      let ratio = w/h;
      if (w > 1076) {
        width = 1076;
        height = 1076 / ratio;
      } else {
        width = w;
        height = h;
      }
      if (height > 605) {
        height = 605;
      }
      this.setState({
        imageWidth: width,
        imageHeight: height
      })
    };
  }

  updateOffset(num) {
    offset = num;
    comments = [];
    for (let i = offset*unit-unit; i<offset*unit; i++) {
      if (i > this.state.comments.length-1) {
        break;
      }
      comments.push(this.state.comments[i]);
    }
    this.forceUpdate();
  }

  inputHandler(e) {
    let eVal = e.target.value;
    this.setState({
      memo: eVal
    });
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
      const delImg = new window.Image();
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
      delImg.src = '/arenatime/cancel.png';
      //
      if (this.state.match['imagePath']['S'] !== 'PlaceHolder') {
        let fileMime = fileType(resultImageFile);
        if (fileMime.ext === 'png') {
          resImg.src = 'data:image/png;base64,' + resultImageFile.toString('base64');
        } else {
          resImg.src = 'data:image/jpeg;base64,' + resultImageFile.toString('base64');
        }
        resImg.onload = () => {
          this.checkSize(resImg.width, resImg.height);
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
      delImg.onload = () => {
        this.setState({
          deleteImage: delImg
        });
      };
      this.setState({
        date: (this.state.match['uploadedDate']['S']).replace(/\s(\S)+/, "")
      });
      this.setComment();
    })();
  }


  showResult() {
    if (this.state.link) {
      if (fromSearch) {
        return <Redirect to='/search'/>
      } else {
        return <Redirect to='/part'/>
      }
    }
    if (this.state.match['imagePath']['S'] !== 'PlaceHolder') {
      return (
        <div>
        <p style={subText} className="ten">
          {'결과 이미지'}
        </p>
        <Stage width={1076} height={this.state.imageHeight}>
          <Layer>
            <Image
              x={1}
              y={0}
              width={this.state.imageWidth}
              height={this.state.imageHeight}
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

  checkMatch() {

  }

  deleteMatch() {

  }

  setComment() {

    let str = this.state.match['matchId']['S'];
    let mPath = path + 'api/get-comment';
    (async _ => { 
      let res = await axios({
        method: 'get',
        url: mPath,
        params: str,
        headers: {
          Accept: "application/json"
        }
      });
      if (res.data.message['Items'].length === 0) {
        return;
      }
      this.setState({
        comments: res.data.message['Items']
      });
      comments = [];
      max = Math.floor((res.data.message['Items'].length-1) / unit) + 1;
      for (let i = offset*unit-unit; i<offset*unit; i++) {
        if (i > this.state.comments.length-1) {
          break;
        }
        comments.push(this.state.comments[i]);
      }
      this.setState({
        comments: res.data.message['Items']
      });
      this.forceUpdate();
    })();
  }

  showComment() {
    if (comments.length !== 0) {
      let items = [];
      for (let num = offset-2; num <= offset+4; num++) {
        if (num < 1) {
          continue;
        }
        if (num > max || (num > 5 && num > offset+2)) {
          break;
        }
        items.push(
          <Pagination.Item key={num} active={num === offset} onClick={() => this.updateOffset(num)}>
            {num}           
          </Pagination.Item>,
        );
      }
      return (
        <div>
        {comments.map((value, index) => {
            return <Comment comment={value} setY={this.state.comments.indexOf(value)} matchId={this.state.match['matchId']['S']} key={index}/>
        })}
        <Pagination>
        <Pagination.First onClick={() => {
          offset = 1;
          comments = [];
          for (let i = offset*unit-unit; i<offset*unit; i++) {
            if (i > this.state.comments.length-1) {
              break;
            }
            comments.push(this.state.comments[i]);
          }
          this.forceUpdate();
        }}/>
        <Pagination.Prev onClick={() => {
          if (offset > 1) {
            offset -= 1;
          }
          comments = [];
          for (let i = offset*unit-unit; i<offset*unit; i++) {
            if (i > this.state.comments.length-1) {
              break;
            }
            comments.push(this.state.comments[i]);
          }
          this.forceUpdate();
        }}/>
        <Pagination.Ellipsis />
        {items}
        <Pagination.Ellipsis />
        <Pagination.Next onClick={() => {
          if (offset < max) {
            offset += 1;
          }
          comments = [];
          for (let i = offset*unit-unit; i<offset*unit; i++) {
            if (i > this.state.comments.length-1) {
              break;
            }
            comments.push(this.state.comments[i]);
          }
          this.forceUpdate();
        }}/>
        <Pagination.Last onClick={() => {
          offset = max;
          comments = [];
          for (let i = offset*unit-unit; i<offset*unit; i++) {
            if (i > this.state.comments.length-1) {
              break;
            }
            comments.push(this.state.comments[i]);
          }
          this.forceUpdate();
        }}/>
        </Pagination>
        </div>
      );
    }
  }

  putComment() {
    if (this.state.memo !== "") {
      this.doComment('put');
    } else {
      this.setState({
        errShow: true,
        title_msg: "등록 실패",
        msg: "덧글을 입력해 주세요."
      });
    }
  }

  doComment(param) {
    if (this.state.voting) {
      return;
    }
    this.setState({
      voting: true,
      errShow: true
    });
    let dat = {
      matchId: this.state.match['matchId']['S'],
      memo: this.state.memo,
      action: param
    }
    let mPath = path + 'api/put-comment';
    (async _ => { 
      await axios({
        method: 'put',
        url: mPath,
        data: dat,
        headers: {
          Accept: "application/json"
        }
      });
      this.setState({
        voting: false,
        title_msg: "등록 완료",
        msg: "덧글이 등록되었습니다."
      });
      this.setComment();
    })();
    
  }

  upClicked() {
    this.vote("up");
  }

  downClicked() {
    this.vote("down");
  }

  vote(param) {
    if (this.state.voting) {
      return;
    }
    this.setState({
      voting: true
    });
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
      if (res.data.message === 'Vote Succeeded') {
        let v = res.data.vote;
        let m = this.state.match;
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
        this.setState({
          voting: false
        });
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
        <div style={subText}>
          <p className="ten">
            {'덧글 목록'}
          </p>
          {this.showComment()}
        <Form>
          <Form.Row>
            <Form.Group as={Col} controlId="formGridCity">
              <Form.Label>덧글 입력</Form.Label>
                <Form.Control as="textarea" name="memo" onChange={this.inputHandler} maxLength={200}/>
            </Form.Group>
          </Form.Row>
        </Form>
        </div>
        <p style={subText} className="ten">
          <Button variant='primary' onClick={this.putComment}>
            {'덧글 등록'}
          </Button>
          {"  "}
          <Button variant='success' onClick={this.getBack}>
            {'돌아가기'}
          </Button>
        </p>
        <Modal
          show={this.state.errShow}
          onHide={this.errorHide}
          dialogClassName="modal-web"
          aria-labelledby="example-custom-modal-styling-title"
        >

            <Modal.Header>
              <Modal.Title>
                {this.state.title_msg}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {this.state.msg}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="primary" onClick={this.errorHide}>확인</Button>
            </Modal.Footer>

        </Modal>
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