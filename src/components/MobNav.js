import React from 'react';
import {
  Stage,
  Layer,
  Image,
  Group,
  Text
} from 'react-konva';
import { Link, HashRouter } from 'react-router-dom';
import { LinkContainer} from "react-router-bootstrap";
import { Routes } from './Routes';

import '../css/daum.css';
import '../css/text.css';

export class MobNav extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      fav: null,
      bg: null,
      brand: null,
      search: null,
      register: null,
      part: null,
      stat: null
    };
  }

  componentDidMount() {
    const image = new window.Image();
    image.src = "/arenatime/favicon.jpg";
    image.onload = () => {
      // setState will redraw layer
      // because "image" property is changed
      this.setState({
        fav: image
      });
    };
    const back = new window.Image();
    back.src = "/arenatime/back.png";
    back.onload = () => {
      // setState will redraw layer
      // because "image" property is changed
      this.setState({
        bg: back
      });
    };
    const brand = new window.Image();
    brand.src = "/arenatime/brand.png";
    brand.onload = () => {
      // setState will redraw layer
      // because "image" property is changed
      this.setState({
        brand: brand
      });
    };
    const search = new window.Image();
    search.src = "/arenatime/search.png";
    search.onload = () => {
      // setState will redraw layer
      // because "image" property is changed
      this.setState({
        search: search
      });
    };
    const register = new window.Image();
    register.src = "/arenatime/register.png";
    register.onload = () => {
      // setState will redraw layer
      // because "image" property is changed
      this.setState({
        register: register
      });
    };
    const part = new window.Image();
    part.src = "/arenatime/part.png";
    part.onload = () => {
      // setState will redraw layer
      // because "image" property is changed
      this.setState({
        part: part
      });
    };
    const stat = new window.Image();
    stat.src = "/arenatime/stat.png";
    stat.onload = () => {
      // setState will redraw layer
      // because "image" property is changed
      this.setState({
        stat: stat
      });
    };
  }

  render() {
    return (
      <HashRouter>
      <Stage width={412} height={120}>
      <Layer>
      <Image
        x={0}
        y={0}
        width={412}
        height={120}
        image={this.state.bg}
      />
      </Layer>
      <Layer>
      <Group>
      <Image
        x={12}
        y={8}
        width={50}
        height={50}
        image={this.state.fav}
      />
      <Image
        x={68}
        y={16}
        width={218}
        height={37}
        image={this.state.brand}
      />
      </Group>
      <Group>
      <Image
        x={16}
        y={74}
        width={81}
        height={23}
        image={this.state.search}
      />
      <Image
        x={111}
        y={74}
        width={81}
        height={23}
        image={this.state.register}
      />
      <Image
        x={206}
        y={74}
        width={81}
        height={23}
        image={this.state.part}
      />
      <Image
        x={301}
        y={73}
        width={81}
        height={23}
        image={this.state.stat}
      />
      </Group>
      </Layer>
    </Stage>
    <Routes/>
    </HashRouter>
    );
  }
}