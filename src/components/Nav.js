import React from 'react';
import {
  Navbar,
  Nav
} from 'react-bootstrap';
import { Link, HashRouter } from 'react-router-dom';
import { LinkContainer} from "react-router-bootstrap";
import { Routes } from './Routes';
import { MobNav } from './MobNav';

import '../css/daum.css';
import '../css/text.css';

let mobile = require('is-mobile');

const brandText = {
  fontFamily: 'GyeonggiTitleM',
  fontStyle: 'normal',
  fontSize: 32,
  fontColor: 'White'
}

const menuText = {
  fontFamily: 'GyeonggiTitleM',
  fontStyle: 'normal',
  fontSize: 24,
  fontColor: 'White'
}


export class Navi extends React.Component {

  constructor(props) {
    super(props);

    this.getNav = this.getNav.bind(this);
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
  }

  getNav() {
      return (
        <Navbar bg="dark" variant="dark">
        <Navbar.Brand>
        <div className="brand" style={brandText}>
        <Link to="/" className="remove-underline">
        <img
          alt=""
          src="/arenatime/favicon.jpg"
          width="40"
          height="40"
          float="left"
        />
        {' ArenaTime'}
        </Link>
        </div>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="mr-auto" style={menuText}>
          <LinkContainer to="/search">
            <Nav.Link>대전 검색</Nav.Link>
          </LinkContainer>
          <LinkContainer to="/register">
            <Nav.Link>대전 등록</Nav.Link>
          </LinkContainer>
          <LinkContainer to="/part">
            <Nav.Link>부분 검색</Nav.Link>
          </LinkContainer>
          <LinkContainer to="/stat">
            <Nav.Link>메타 통계</Nav.Link>
          </LinkContainer>
        </Nav>
        </Navbar.Collapse>
        <div align="right">
        <a href="https://github.com/Stdev17/arenatime" target="_blank" rel="noopener noreferrer">
        <img
          alt=""
          src="/arenatime/github-logo.svg"
          width="34"
          height="34"
          className="github"
        /></a>
        <a href="https://discord.gg/KpENFp7" target="_blank" rel="noopener noreferrer"><img
          alt=""
          src="/arenatime/discord.svg"
          width="50"
          height="50"
          className="discord"
        /></a>
        </div>
      </Navbar>
      );
  }

  render() {
    if (!mobile()) {
      return (
        <HashRouter>
        {this.getNav()}
        <Routes/>
        </HashRouter>
      );
    } else {
      return (
          <MobNav/>
      );
    }
  }
}