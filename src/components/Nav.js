import React from 'react';
import {
  Navbar,
  Nav
} from 'react-bootstrap';
import '../css/daum.css';

const brandText = {
  fontFamily: 'Daum',
  fontStyle: 'normal',
  fontSize: 30,
  fontColor: 'White'
}

const menuText = {
  fontFamily: 'Daum',
  fontStyle: 'normal',
  fontSize: 24,
  fontColor: 'White'
}

export const nav = (
  <Navbar bg="dark" variant="dark">
    <Navbar.Brand href="#main">
    <div style={brandText}>
    <img
      alt=""
      src="/favicon.jpg"
      width="40"
      height="40"
      className="d-inline-block align-top"
      float="left"
    />
    {' ArenaTime'}
    </div>
    </Navbar.Brand>
    <Navbar.Toggle aria-controls="basic-navbar-nav" />
    <Navbar.Collapse id="basic-navbar-nav">
    <Nav className="mr-auto" style={menuText}>
    <Nav.Link href="#search">대전 검색</Nav.Link>
    <Nav.Link href="#register">대전 등록</Nav.Link>
    </Nav>
    </Navbar.Collapse>
    <div align="right">
    <a href="https://github.com/Stdev17/arenatime-client"><img
      src="/github-logo.svg"
      width="30"
      height="30"
      class="github"
    /></a>
    <a href="https://discord.gg/KpENFp7"><img
      src="/discord.svg"
      width="40"
      height="40"
      class="discord"
    /></a>
    </div>
  </Navbar>
);