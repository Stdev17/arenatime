import * as React from 'react';
import {
  Image
} from 'react-konva';

var char = require('../util/char').char;

interface coord {
  XCoord: number, YCoord: number
}

interface IBlockProps {
  scale: number,
  character: string,
  setX: number,
  setY: number,
  party: string[] | any
}

interface IBlockState {
  scale: number,
  image: any,
  x: number,
  y: number,
  str: number,
  opacity: number
}

export class Block extends React.Component<IBlockProps, IBlockState> {
  constructor(props: any) {
    super(props);
    this.ClickChar = this.ClickChar.bind(this);
    let c: string = this.props.character;

    this.state = {
      scale: this.props.scale,
      image: null,
      x: getCoord(char.indexOf(c)).XCoord,
      y: getCoord(char.indexOf(c)).YCoord,
      str: 0,
      opacity: 0.5
    }
  }
  componentDidMount() {
    
    const image = new (window as any).Image();
    
    image.src = "/arenatime/characters.jpg";
    
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
    if (this.state.str === 4 && newProps.party.length === 0) {
      this.setState({
        str: 0,
        opacity: 0.5
      });
      return;
    }
    if (this.state.str === 0 && newProps.party.includes(this.props.character)) {
      this.setState({
        str: 4,
        opacity: 1
      });
      return;
    }
  }
  ClickChar() {
    let p = this.props.party;
    if (p.includes(this.props.character)) {
      p.splice(p.indexOf(this.props.character), 1);
      this.setState({
        str: 0,
        opacity: 0.5
      });
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
      width={this.props.scale}
      height={this.props.scale}
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
      onTap={this.ClickChar}
      />
    );
  }
}

export function getCoord(num: number) {
  let x: number = (((num-1) % 8) * 76) * 2;
  let y: number = (Math.floor((num-1) / 8) % 11) * 76;
  let res: coord = {XCoord: x, YCoord: y};
  return res;
}