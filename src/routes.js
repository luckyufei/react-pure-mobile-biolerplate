import React from 'react';
import {Route, IndexRoute} from 'react-router';

import {
  Todo,
  Hello
} from './containers';

export default () => {

  // function handleShowIssueDetail(router, replaceState, cb) 
  return (
    <Route path="/">
      <IndexRoute component={Todo}/>
      <Route path="hello" component={Hello}/>
    </Route >
  );
};
