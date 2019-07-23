import React from 'react';
import { nav } from './Nav';
import {
  container,
  setSearch
} from './Container';

import '../css/App.css';

setSearch();

const page = (
  <div>
    <h1>
      {nav}
    </h1>
    <h2>
      {container}
    </h2>
  </div>
);

function App() {
  return (
    page
  );
}

export default App;
