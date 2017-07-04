import React from 'react';
import ReactDOM from 'react-dom';

import { Provider } from 'mobx-react';

import App from './components/App';
import AppState from './state';

import runClient from './client';

const state = new AppState();
window.state = state;

runClient(state);

ReactDOM.render(
  <Provider state={state}><App /></Provider>,
  document.getElementById('app'),
);
