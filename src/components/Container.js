import React from 'react';
import {
  Container,
  Card
} from 'react-bootstrap';
import { register } from './Register';
import { search } from './Search';

import '../css/container.css';

var card = register;
export var container;

export function setRegister() {
  card = register;
}

export function setSearch() {
  card = search;
  setContainer(card);
}

function setContainer(c) {
  container = (
  <Container>
    <Card>
      {c}
    </Card>
  </Container>
  );
}