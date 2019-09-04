import React from 'react';
import {
  Image,
  Text,
  Stage,
  Layer
} from 'react-konva';
import {
  Button,
  Modal
} from 'react-bootstrap';

import '../css/daum.css';
import '../css/text.css';

import { getCoord } from './Block.tsx';
import { char } from '../util/char.js';
import { path } from '../util/dummy';

var axios = require('axios');

let parse = require('../util/char_parse.js').char;
let scale = 60;

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
    image.src = "/arenatime/characters.jpg";
    if (this.props.character === "Empty") {
      this.setState({
        x: 1100,
        y: 760
      });
    } else {
      let c = this.props.character;
      this.setState({
        x: getCoord(char.indexOf(c)).XCoord,
        y: getCoord(char.indexOf(c)).YCoord
      });
    }
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
      if (newProps.character === "Empty") {
        this.setState({
          x: 1100,
          y: 760
        });
      } else {
        let c = newProps.character;
        this.setState({
          x: getCoord(char.indexOf(c)).XCoord,
          y: getCoord(char.indexOf(c)).YCoord
        });
      }
    }
  }
  render() {
    return (
      <Image
      x={this.props.setX}
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
    );
  }
}

export class Comment extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      errShow: false,
      modalShow: false,
      title_msg: "덧글 삭제",
      msg: "정말 삭제하시겠습니까?",
      deleted: false
    };

    this.errorHide = this.errorHide.bind(this);
    this.errorShow = this.errorShow.bind(this);

    this.deleteComment = () => {
      (async _ => {
        let dat = {
          matchId: this.props.matchId,
          commentId: this.props.comment.commentId['S'],
          memo: 'PlaceHolder',
          action: 'delete'
        }
        let mPath = path + 'api/put-comment';
        let res = await axios({
          method: 'put',
          url: mPath,
          data: dat,
          headers: {
            Accept: "application/json"
          }
        });
        if (res.data.message === 'Forbidden Comment Deletion') {
          this.setState({
            modalShow: true,
            errShow: false,
            title_msg: "삭제 실패",
            msg: "권한이 없습니다.",
            deleted: false
          });
          return;
        }
        this.setState({
          modalShow: true,
          errShow: false,
          title_msg: "삭제 완료",
          msg: "덧글이 삭제되었습니다.",
          deleted: true
        });
      })();
    };

    this.modalHide = () => {
      this.setState({ modalShow: false });
    };
  }

  errorShow() {
    if (this.state.deleted) {
      this.setState({
        modalShow: true,
        title_msg: "삭제 불가",
        msg: "이미 삭제된 덧글입니다."
      });
    } else {
      this.setState({
        errShow: true,
        title_msg: "덧글 삭제",
        msg: "정말 삭제하시겠습니까?"
      });
    }
  }

  errorHide() {
    this.setState({ errShow: false });
  }

  componentDidMount() {
    const del = new window.Image();
    del.src = '/arenatime/cancel.png';
    del.onload = () => {
      this.setState({
        image: del
      });
    };
  }

  render() {
    return (
      <div>
      <Stage width={1124} height={74}>
      <Layer>
      <Slot character={parse[this.props.comment.charName['S']]} setX={2} setY={this.props.setY}/>
      
      <Text
      x={75}
      y={2}
      fontSize={16}
      fontFamily={'Daum'}
      fontStyle={'normal'}
      fontColor={'#333333'}
      width={810}
      height={68}
      text={this.props.comment.memo['S']}
      />
      <Text
      x={828}
      y={28}
      fontSize={16}
      fontColor={'#333333'}
      width={256}
      align='center'
      text={this.props.comment.uploadedDate['S']}
      />
      <Image
        x={1045}
        y={22}
        width={24}
        height={24}
        image={this.state.image}
        onClick={this.errorShow}
      />
      </Layer>
      </Stage>
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
            <Button variant="primary" onClick={this.errorHide}>취소</Button>
            <Button variant="danger" onClick={this.deleteComment}>삭제</Button>
          </Modal.Footer>

      </Modal>
      <Modal
        show={this.state.modalShow}
        onHide={this.modalHide}
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
            <Button variant="success" onClick={this.modalHide}>확인</Button>
          </Modal.Footer>

      </Modal>
      </div>
    );
  }
}