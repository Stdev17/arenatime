import React from "react";
import { Route, Switch } from "react-router-dom";
import {
  pageRegister,
  pageSearch,
  pageMatch,
  pagePart,
  pageStat,
  pageRank
} from "./Container";

export class Routes extends React.Component {
  render() {
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
  }
}