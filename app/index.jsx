import React from 'react';
import ReactDOM from 'react-dom';

import { Provider } from 'mobx-react';

import { Div } from 'glamorous';

import App from './components/App';
import AppState from './state';

import runClient from './client';

const state = new AppState();
window.state = state;

runClient(state);

ReactDOM.render(
  <Provider state={state}>
    <Div fontFamily="Roboto" fontWeight={300}>
      <App />
    </Div>
  </Provider>,
  document.getElementById('app'),
);
