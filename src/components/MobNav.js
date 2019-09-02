import React from 'react';
import {
  Stage,
  Layer,
  Image,
  Group,
  Text
} from 'react-konva';
import { HashRouter, Redirect } from 'react-router-dom';
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
      stat: null,
      link: ""
    };

    this.checkLink = this.checkLink.bind(this);
    this.setSearch = this.setSearch.bind(this);
    this.setRegister = this.setRegister.bind(this);
    this.setPart = this.setPart.bind(this);
    this.setStat = this.setStat.bind(this);
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
  setSearch() {
    this.setState({
      link: 'search'
    });
  }

  setRegister() {
    this.setState({
      link: 'register'
    });
  }

  setPart() {
    this.setState({
      link: 'part'
    });
  }

  setStat() {
    this.setState({
      link: 'stat'
    });
  }

  checkLink() {
    if (this.state.link === 'search') {
      return <Redirect to='/search'/>
    }
    if (this.state.link === 'register') {
      return <Redirect to='/register'/>
    }
    if (this.state.link === 'part') {
      return <Redirect to='/part'/>
    }
    if (this.state.link === 'stat') {
      return <Redirect to='/stat'/>
    }
  }

  render() {
    return (
      <HashRouter>
        {this.checkLink()}
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
        onClick={this.setSearch}
      />
      <Image
        x={111}
        y={74}
        width={81}
        height={23}
        image={this.state.register}
        onClick={this.setRegister}
      />
      <Image
        x={206}
        y={74}
        width={81}
        height={23}
        image={this.state.part}
        onClick={this.setPart}
      />
      <Image
        x={301}
        y={73}
        width={81}
        height={23}
        image={this.state.stat}
        onClick={this.setStat}
      />
      </Group>
      </Layer>
    </Stage>
    <Routes/>
    </HashRouter>
    );
  }
}