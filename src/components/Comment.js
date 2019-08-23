import React from 'react';
import {
  Image,
  Text,
  Group
} from 'react-konva';

import '../css/daum.css';
import '../css/text.css';

import { getCoord } from './Block.tsx';
import { char } from '../util/char.js';
import { tsConstructorType } from '@babel/types';

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
    console.log(this.props.character);
    return (
      <Image
      x={this.props.setX}
      y={this.props.setY*74+2}
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
      msg: "정말 삭제하시겠습니까?"
    };

    this.errorShow = () => {
      this.setState({ errShow: true });
    };

    this.errorHide = () => {
      this.setState({ errShow: false });
    };

    this.deleteComment = () => {
      (async _ => {
        let dat = {
          commentId: this.props.comment.commentId['S'],
          memo: 'PlaceHolder',
          action: 'delete'
        }
        let mPath = path + 'api/put-comment';
        await axios({
          method: 'put',
          url: mPath,
          data: dat,
          headers: {
            Accept: "application/json"
          }
        });
        this.setState({
          modalShow: true,
          errShow: false,
          title_msg: "삭제 완료",
          msg: "덧글이 삭제되었습니다.",
          image: null
        });
      })();
    };

    this.modalHide = () => {
      this.setState({ modalShow: false });
    };
  }

  componentDidMount() {
    const del = new window.Image();
    del.src = '/arenatime/cancel.png';
    down.onload = () => {
      this.setState({
        image: down
      });
    };
  }

  render() {
    return (
      <Group>
      <Slot character={parse[this.props.comment.charName['S']]} setX={2} setY={this.props.setY}/>
      
      <Text
      x={80}
      y={this.props.setY*74+2}
      fontSize={16}
      fontFamily={'Daum'}
      fontStyle={'normal'}
      fontColor={'#333333'}
      width={820}
      height={68}
      text={this.props.comment.memo['S']}
      />
      <Text
      x={840}
      y={this.props.setY*74+28}
      fontSize={16}
      fontColor={'#333333'}
      width={256}
      align='center'
      text={this.props.comment.uploadedDate['S']}
      />
      <Image
        x={969}
        y={this.props.setY*74+28}
        width={24}
        height={24}
        image={this.state.deleteImage}
        onClick={this.deleteComment}
      />
      <Modal
        show={this.state.errShow}
        onHide={this.errorHide}
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
      </Group>
    );
  }
}