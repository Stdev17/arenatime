import React from "react";
import { Route, Switch } from "react-router-dom";
import {
  pageRegister,
  pageSearch,
  pageMatch,
  pagePart
} from "./Container";

export class Routes extends React.Component {
  render() {
    return (
      <Switch>
      <Route path="/arenatime/" exact component={pageSearch} />
      <Route path="/arenatime/search" component={pageSearch} />
      <Route path="/arenatime/register" component={pageRegister} />
      <Route path="/arenatime/match" component={pageMatch} />
      <Route path="/arenatime/part" component={pagePart} />
    </Switch>
    );
  }
}