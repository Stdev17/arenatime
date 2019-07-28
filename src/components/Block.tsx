import * as React from 'react';
import {
  Image
} from 'react-konva';

var char = require('../util/char').char;

interface coord {
  XCoord: number, YCoord: number
}

interface IBlockProps {
  character: string,
  setX: number,
  setY: number,
  party: string[] | any
}

interface IBlockState {
  image: any,
  x: number,
  y: number,
  str: number,
  opacity: number
}

let scale = 38;

export class Block extends React.Component<IBlockProps, IBlockState> {
  constructor(props: any) {
    super(props);
    this.ClickChar = this.ClickChar.bind(this);
    let c: string = this.props.character;

    this.state = {
      image: null,
      x: getCoord(char.indexOf(c)).XCoord,
      y: getCoord(char.indexOf(c)).YCoord,
      str: 0,
      opacity: 0.5
    }
  }
  componentDidMount() {
    
    const image = new (window as any).Image();
    
    image.src = "./characters.jpg";
    
    image.onload = () => {
      // setState will redraw layer
      // because "image" property is changed
      this.setState({
        image: image
      }/*,
      () => {
        this.state.image.cache();
        this.state.image.getLayer().draw();
      }*/);
    };
    let p = this.props.party;
    if (p.includes(this.props.character)) {
      this.setState({
        str: 4,
        opacity: 1
      });
    }
  }

  componentDidUpdate(oldProps: any) {
    let newProps = this.props;
    if (this.state.str == 4 && newProps.party.length == 0) {
      this.setState({
        str: 0,
        opacity: 0.5
      });
    }
  }
  ClickChar() {
    let p = this.props.party;
    if (p.includes(this.props.character)) {
      this.setState({
        str: 0,
        opacity: 0.5
      });
      p.splice(p.indexOf(this.props.character), 1);
    }
    else if (p.length < 5) {
      p.push(this.props.character);
      this.setState({
        str: 4,
        opacity: 1
      });

    }
  }
  render() {
    return (
      <Image
      x={this.props.setX+8}
      y={this.props.setY+5}
      width={scale}
      height={scale}
      image={this.state.image}
      opacity={this.state.opacity}
      crop = {{
        x: this.state.x,
        y: this.state.y,
        width: 76,
        height: 76
      }}
      stroke={'#bb3333'}
      strokeWidth={this.state.str}
      onClick={this.ClickChar}
      />
    );
  }
}

export function getCoord(num: number) {
  let x: number = (((num-1) % 8) * 76) * 2;
  let y: number = (Math.floor((num-1) / 8) % 8) * 76;
  let res: coord = {XCoord: x, YCoord: y};
  return res;
}