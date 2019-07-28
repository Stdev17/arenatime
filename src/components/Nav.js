import React from 'react';
import {
  Navbar,
  Nav,
  NavItem
} from 'react-bootstrap';
import { Link, Router, BrowserRouter } from 'react-router-dom';
import { LinkContainer} from "react-router-bootstrap";
import { Routes } from './Routes';

import '../css/daum.css';
import '../css/text.css';

const brandText = {
  fontFamily: 'Daum',
  fontStyle: 'normal',
  fontSize: 32,
  fontColor: 'White'
}

const menuText = {
  fontFamily: 'Daum',
  fontStyle: 'normal',
  fontSize: 24,
  fontColor: 'White'
}

export class Navi extends React.Component {
  render() {
  return (
  <BrowserRouter>
  <Navbar bg="dark" variant="dark">
    <Navbar.Brand>
    <div className="brand" style={brandText}>
    <Link to="/" className="remove-underline">
    <img
      alt=""
      src="/favicon.jpg"
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
    </Nav>
    </Navbar.Collapse>
    <div align="right">
    <a href="https://github.com/Stdev17/arenatime" target="_blank" rel="noopener noreferrer">
    <img
      alt=""
      src="/github-logo.svg"
      width="34"
      height="34"
      className="github"
    /></a>
    <a href="https://discord.gg/KpENFp7" target="_blank" rel="noopener noreferrer"><img
      alt=""
      src="/discord.svg"
      width="50"
      height="50"
      className="discord"
    /></a>
    </div>
  </Navbar>
  <Routes/>
  </BrowserRouter>
  );
  }
}