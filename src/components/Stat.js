import React from 'react';
import {
  Form,
  Col,
  Button
} from 'react-bootstrap';
import {
  Stage,
  Layer,
  Image,
  Text
} from 'react-konva';
import { Redirect } from 'react-router-dom';

import '../css/daum.css';
import '../css/text.css';

import { path } from '../util/dummy';
import { CharSet } from './CharSet';
import { TeamSet } from './TeamSet';
import { setRank } from './Rank';

var axios = require('axios');

let loaded = false;
let charset = [];
let duoset = [];
let trioset = [];
let chartext = '';
let duotext = '';
let triotext = '';

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

export class Stat extends React.Component {
  constructor(props) {
    super(props);

    this.getStat = this.getStat.bind(this);
    this.getValue = this.getValue.bind(this);
    this.getSort = this.getSort.bind(this);
    this.result = this.result.bind(this);
    this.getText = this.getText.bind(this);
    this.getSearch = this.getSearch.bind(this);
    this.inputHandler = this.inputHandler.bind(this);
    this.goLink = this.goLink.bind(this);
    this.goChar = this.goChar.bind(this);
    this.goDuo = this.goDuo.bind(this);
    this.goTrio = this.goTrio.bind(this);

    this.state = {
      stats: null,
      error: false,
      mag_img: null,
      form: {
        target: '방어',
        type: '적폐',
        arena: '전체'
      }
    };
  }

  componentDidMount() {
    this.getStat();
    const mag = new window.Image();
    mag.src = '/arenatime/mag.png';
    mag.onload = () => {
      this.setState({
        mag_img: mag
      });
    };
  }

  getSearch() {
    this.getText();
    this.getSort();
  }

  inputHandler(e) {
    let eName = e.target.name;
    let eVal = e.target.value;
    this.setState({form: {...this.state.form, [eName]: eVal}});
  }

  goChar() {
    setRank('char', charset, chartext);
    this.setState({
      link: true
    });
  }

  goDuo() {
    setRank('duo', duoset, duotext);
    this.setState({
      link: true
    });
  }

  goTrio() {
    setRank('trio', trioset, triotext);
    this.setState({
      link: true
    });
  }

  goLink() {
    if (this.state.link) {
      return <Redirect to='/rank'/>
    }
  }

  getText() {
    chartext = '';
    duotext = '';
    triotext = '';
    if (this.state.form.target === '공격') {
      chartext += '공덱 ';
      duotext += '공덱 ';
      triotext += '공덱 ';
    } else {
      chartext += '방덱 ';
      duotext += '방덱 ';
      triotext += '방덱 ';
    }
    if (this.state.form.arena === '배틀 아레나') {
      chartext += '배레나 ';
      duotext += '배레나 ';
      triotext += '배레나 ';
    } else if (this.state.form.arena === '프린세스 아레나') {
      chartext += '프레나 ';
      duotext += '프레나 ';
      triotext += '프레나 ';
    } else {
      chartext += '전체 ';
      duotext += '전체 ';
      triotext += '전체 ';
    }
    if (this.state.form.type === '적폐') {
      chartext += '적폐 캐릭터';
      duotext += '적폐 듀오';
      triotext += '적폐 트리오';
    } else {
      chartext += '사기 캐릭터';
      duotext += '사기 듀오';
      triotext += '사기 트리오';
    }
  }

  getValue(obj) {
    if (this.state.form.type === '적폐') {
      let allbattle = 0;
      let allprincess = 0;
      for (let i in this.state.stats['Items']) {
        if (this.state.stats['Items'][i]['PropertyName']['S'] === 'net') {
          allbattle = Number(this.state.stats['Items'][i]['Stats']['L'][0]['M']['BattleCnt']['N']);
          allprincess = Number(this.state.stats['Items'][i]['Stats']['L'][0]['M']['PrincessCnt']['N']);
        }
      }
      if (this.state.form.arena === '배틀 아레나') {
        return Math.ceil(10000*Number(obj['BattleCnt']['N'])/allbattle)/100;
      } else if (this.state.form.arena === '프린세스 아레나') {
        return Math.ceil(10000*Number(obj['PrincessCnt']['N'])/allprincess)/100;
      } else {
        let cnt = Number(obj['BattleCnt']['N']) + Number(obj['PrincessCnt']['N']);
        let net = allbattle + allprincess;
        return Math.ceil(10000*cnt/net)/100;
      }
    } else {
      if (this.state.form.arena === '배틀 아레나') {
        return Math.ceil(10000*Number(obj['BattleWin']['N'])/Number(obj['BattleCnt']['N']))/100;
      } else if (this.state.form.arena === '프린세스 아레나') {
        return Math.ceil(10000*Number(obj['PrincessWin']['N'])/Number(obj['PrincessCnt']['N']))/100;
      } else {
        let cnt = Number(obj['BattleCnt']['N']) + Number(obj['PrincessCnt']['N']);
        let net = Number(obj['BattleWin']['N']) + Number(obj['PrincessWin']['N']);
        return Math.ceil(10000*net/cnt)/100;
      }
    }
  }

  getSort() {
    let res = this.state.stats['Items'];
    let achar = {};
    let aduo = {};
    let atrio = {};
    let dchar = {};
    let dduo = {};
    let dtrio = {};
    if (this.state.form.target === '공격') {
      for (let i in res) {
        let tmp;
        switch (res[i]['PropertyName']['S']) {
          case 'attackChars':
            tmp = res[i]['Stats']['L'];
            for (let s in tmp) {
              achar[tmp[s]['M']['Character']['S']] = {
                entity: tmp[s]['M']['Character']['S'],
                val: this.getValue(tmp[s]['M'])
              };
            }
            charset = sortProperties(achar, 'val', true, true);
            break;
          case 'attackDuos':
            tmp = res[i]['Stats']['L'];
            for (let s in tmp) {
              aduo[tmp[s]['M']['Deck']['S']] = {
                entity: tmp[s]['M']['Deck']['S'],
                val: this.getValue(tmp[s]['M'])
              };
            }
            duoset = sortProperties(aduo, 'val', true, true);
            break;
          case 'attackTrios':
            tmp = res[i]['Stats']['L'];
            for (let s in tmp) {
              atrio[tmp[s]['M']['Deck']['S']] = {
                entity: tmp[s]['M']['Deck']['S'],
                val: this.getValue(tmp[s]['M'])
              };
            }
            trioset = sortProperties(atrio, 'val', true, true);
            break;
        }
      }
    }
    if (this.state.form.target === '방어') {
      for (let i in res) {
        let tmp;
        switch (res[i]['PropertyName']['S']) {
          case 'defenseChars':
            tmp = res[i]['Stats']['L'];
            for (let s in tmp) {
              dchar[tmp[s]['M']['Character']['S']] = {
                entity: tmp[s]['M']['Character']['S'],
                val: this.getValue(tmp[s]['M'])
              };
            }
            charset = sortProperties(dchar, 'val', true, true);
            break;
          case 'defenseDuos':
            tmp = res[i]['Stats']['L'];
            for (let s in tmp) {
              dduo[tmp[s]['M']['Deck']['S']] = {
                entity: tmp[s]['M']['Deck']['S'],
                val: this.getValue(tmp[s]['M'])
              };
            }
            duoset = sortProperties(dduo, 'val', true, true);
            break;
          case 'defenseTrios':
            tmp = res[i]['Stats']['L'];
            for (let s in tmp) {
              dtrio[tmp[s]['M']['Deck']['S']] = {
                entity: tmp[s]['M']['Deck']['S'],
                val: this.getValue(tmp[s]['M'])
              };
            }
            trioset = sortProperties(dtrio, 'val', true, true);
            break;
        }
      }
    }
    loaded = true;
    this.forceUpdate();
  }



  async getStat() {
    let mPath = path + 'api/get-stat';
    let dummy = await (async _ => {
      let res = await axios({
        method: 'get',
        url: mPath,
        headers: {
          "Accept": "application/json"
        }
      });
      if (res.data.message === 'Getting Stats Failed') {
        console.log('Stat Error');
        this.setState({
          error: true
        });
        return;
      } else {
        this.setState({
          stats: res.data.message
        });
      }
    })();
    this.getText();
    this.getSort();
  }

  result() {
    if (!loaded) {
      return (
        <div>

        </div>
      );
    } else {
      //
      let cutchar = charset.slice();
      cutchar.splice(5, cutchar.length-5);
      let cutduo = duoset.slice();
      cutduo.splice(5, cutduo.length-5);
      let cuttrio = trioset.slice();
      cuttrio.splice(5, cuttrio.length-5);
      //
      return (
        <div>
        <Stage width={1076} height={560}>
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
            text={chartext}
          />
          <Text
            x={318}
            y={2}
            fontSize={19}
            fontFamily={'Daum'}
            fontStyle={'normal'}
            fontColor={'#333333'}
            width={210}
            align='center'
            text={duotext}
          />
          <Text
            x={698}
            y={2}
            fontSize={19}
            fontFamily={'Daum'}
            fontStyle={'normal'}
            fontColor={'#333333'}
            width={210}
            align='center'
            text={triotext}
          />
          </Layer>
          <Layer>
          {cutchar.map((value, index) => {
            return <CharSet stat={value} setX={50} setY={cutchar.indexOf(value)} key={index}/>
          })}
          {cutduo.map((value, index) => {
            return <TeamSet stat={value} setX={320} setY={cutduo.indexOf(value)} isDuo={true} key={index}/>
          })}
          {cuttrio.map((value, index) => {
            return <TeamSet stat={value} setX={660} setY={cuttrio.indexOf(value)} isDuo={false} key={index}/>
          })}
          <Image
            x={248}
            y={0}
            width={24}
            height={24}
            image={this.state.mag_img}
            onClick={this.goChar}
          />
          <Image
            x={528}
            y={0}
            width={24}
            height={24}
            image={this.state.mag_img}
            onClick={this.goDuo}
          />
          <Image
            x={913}
            y={0}
            width={24}
            height={24}
            image={this.state.mag_img}
            onClick={this.goTrio}
          />
          </Layer>
        </Stage>
        </div>
      );
    }
  }

  render() {
    return (
      <div className="text">
      {this.goLink()}
      <h1 style={topicText}>
        메타 통계
      </h1>
      <h2 style={subText} className="ten">
        검색 설정
      </h2>
      <h3 style={smallText} className="ten">
        <Form ref="form">
          <Form.Row className="stat" align="left">
            <Form.Group as={Col} controlId="formGridPosition">
              <Form.Label>덱 유형</Form.Label>
              <Form.Control name="target" onChange={this.inputHandler} as="select">
                <option>방어</option>
                <option>공격</option>
              </Form.Control>
            </Form.Group>
            <Form.Group as={Col} controlId="formGridPosition">
              <Form.Label>결과</Form.Label>
              <Form.Control name="type" onChange={this.inputHandler} as="select">
                <option>적폐</option>
                <option>사기</option>
              </Form.Control>
            </Form.Group>
            <Form.Group as={Col} controlId="formGridPosition">
              <Form.Label>아레나</Form.Label>
              <Form.Control name="arena" onChange={this.inputHandler} as="select">
                <option>전체</option>
                <option>배틀 아레나</option>
                <option>프린세스 아레나</option>
              </Form.Control>
            </Form.Group>
          </Form.Row>
        </Form>
      </h3>
      <p style={subText} className="twenty">
        <Button variant='success' onClick={this.getSearch}>
          결과 확인
        </Button>
      </p>
      {this.result()}
      </div>
    );
  }
}

function sortProperties(obj, sortedBy, isNumericSort, reverse) {
  sortedBy = sortedBy || 1; // by default first key
  isNumericSort = isNumericSort || false; // by default text sort
  reverse = reverse || false; // by default no reverse

  var reversed = (reverse) ? -1 : 1;

  var sortable = [];
  for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
          sortable.push([key, obj[key]]);
      }
  }
  if (isNumericSort)
      sortable.sort(function (a, b) {
          return reversed * (a[1][sortedBy] - b[1][sortedBy]);
      });
  else
      sortable.sort(function (a, b) {
          var x = a[1][sortedBy].toLowerCase(),
              y = b[1][sortedBy].toLowerCase();
          return x < y ? reversed * -1 : x > y ? reversed : 0;
      });
  return sortable; // array in format [ [ key1, val1 ], [ key2, val2 ], ... ]
}