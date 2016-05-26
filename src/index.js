/**
 * THIS IS THE ENTRY POINT FOR THE CLIENT, JUST LIKE server.js IS THE ENTRY POINT FOR THE SERVER.
 */
import './utils/errorHandler';
import React from 'react';
import ReactDOM from 'react-dom';
import { Router, browserHistory, applyRouterMiddleware } from 'react-router';
import useScroll from 'react-router-scroll';
import getRoutes from './routes';
import ApiClient from './helpers/ApiClient';

const TAG = "[client]::";
const dest = document.getElementById('content');
const client = new ApiClient();

ReactDOM.render(
  <Router
    history={browserHistory}
    routes={getRoutes() }
    render={
      // Scroll to top when going to a new page, imitating default browser behaviour
      applyRouterMiddleware(
        useScroll(
          (prevProps, props) => {
            if (!prevProps || !props) {
              return true;
            }

            if (prevProps.location.pathname !== props.location.pathname) {
              return [0, 0];
            }

            return true;
          }
        )
      )
    }/>,
  document.getElementById('root')
)

