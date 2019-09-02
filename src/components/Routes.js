import React from "react";
import { Route, Switch } from "react-router-dom";
import {
  pageRegister,
  pageSearch,
  pageMatch,
  pagePart,
  pageStat,
  pageRank,
  pageMobSearch,
  pageMobRegister,
  pageMobMatch,
  pageMobPart,
  pageMobStat,
  pageMobRank
} from "./Container";

let mobile = require('is-mobile');

export class Routes extends React.Component {
  render() {
    if (!mobile()) {
      return (
        <Switch>
        <Route path="/" exact component={pageSearch} />
        <Route path="/search" component={pageSearch} />
        <Route path="/register" component={pageRegister} />
        <Route path="/match" component={pageMatch} />
        <Route path="/part" component={pagePart} />
        <Route path="/stat" component={pageStat} />
        <Route path='/rank' component={pageRank} />
      </Switch>
      );
    } else {
      return (
        <Switch>
        <Route path="/" exact component={pageMobSearch} />
        <Route path="/search" component={pageMobSearch} />
        <Route path="/register" component={pageMobRegister} />
        <Route path="/match" component={pageMobMatch} />
        <Route path="/part" component={pageMobPart} />
        <Route path="/stat" component={pageMobStat} />
        <Route path='/rank' component={pageMobRank} />
      </Switch>
      );
    }
  }
}