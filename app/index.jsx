import React from 'react';
import ReactDOM from 'react-dom';

import { Provider } from 'mobx-react';

import { Div } from 'glamorous';

import DevTools from 'mobx-react-devtools';

import App from './components/App';
import AppState from './state';

const state = new AppState();
window.state = state;

ReactDOM.render(
  <Provider state={state}>
    <Div fontFamily="Roboto" fontWeight={300}>
      <App />
      <DevTools />
    </Div>
  </Provider>,
  document.getElementById('app'),
);
