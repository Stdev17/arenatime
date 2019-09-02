import React from 'react';
import {
  Button
} from 'react-bootstrap';
import {
  Stage,
  Layer,
  Text
} from 'react-konva';
import { Redirect } from 'react-router-dom';
import { CharSet } from './CharSet';
import { TeamSet } from './TeamSet';

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

let team = 'char';
let deck = [];
let text = '';

export function setRank(str, d, txt) {
  team = str;
  deck = d;
  text = txt;
}

export class MobRank extends React.Component {

  constructor(props) {
    super(props);

    this.getBack = this.getBack.bind(this);
    this.goLink = this.goLink.bind(this);

    this.state = {
      link: false
    }
  }

  getBack() {
    this.setState({
      link: true
    });
  }

  goLink() {
    if (this.state.link) {
      return <Redirect to='/stat'/>
    }
  }
  
  showResult() {
    if (team === 'char') {
      return (
      <div>
        <Stage width={400} height={2100}>
          <Layer>
          <Text
            x={28}
            y={2}
            fontSize={19}
            fontFamily={'Daum'}
            fontStyle={'normal'}
            fontColor={'#333333'}
            width={210}
            align='center'
            text={text}
          />
          {deck.map((value, index) => {
            return <CharSet stat={value} setX={70} setY={deck.indexOf(value)} key={index}/>
          })}
          </Layer>
        </Stage>
      </div>
      );
    } else if (team === 'duo') {
      return (
        <div>
        <Stage width={400} height={2100}>
          <Layer>
          <Text
            x={28}
            y={2}
            fontSize={19}
            fontFamily={'Daum'}
            fontStyle={'normal'}
            fontColor={'#333333'}
            width={210}
            align='center'
            text={text}
          />
          {deck.map((value, index) => {
            return <TeamSet stat={value} setX={40} setY={deck.indexOf(value)} isDuo={true} scale={76} key={index}/>
          })}
          </Layer>
        </Stage>
      </div>
      );
    } else {
      return (
        <div>
        <Stage width={400} height={2100}>
          <Layer>
          <Text
            x={28}
            y={2}
            fontSize={19}
            fontFamily={'Daum'}
            fontStyle={'normal'}
            fontColor={'#333333'}
            width={210}
            align='center'
            text={text}
          />
          {deck.map((value, index) => {
            return <TeamSet stat={value} setX={8} setY={deck.indexOf(value)} isDuo={false} scale={60} key={index}/>
          })}
          </Layer>
        </Stage>
      </div>
      );
    }
  }
  render() {
    if (deck.length === 0) {
      return (
        <div className="text">
          <h1 style={topicText}>
            결과 로드 중
          </h1>
        <h2 style={subText} className="twenty">
          잠시만 기다려 주세요.
        </h2>
        </div>
      )
    }
    return (
      <div className="text">
        {this.goLink()}
        <p style={topicText}>
          {'통계 결과'}
        </p>
        {this.showResult()}
        <p style={subText}>
          <Button variant='success' onClick={this.getBack}>
            {'돌아가기'}
          </Button>
        </p>
      </div>
    );
  }
}