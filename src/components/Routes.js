import React from "react";
import { Route, Switch } from "react-router-dom";
import {
  pageRegister,
  pageSearch
} from "./Container";

export class Routes extends React.Component {
  render() {
    return (
      <Switch>
      <Route path="/" exact component={pageRegister} />
      <Route path="/search" component={pageSearch} />
      <Route path="/register" component={pageRegister} />
    </Switch>
    );
  }
}