import React from 'react';
import ReactDOM from 'react-dom';

import { Provider } from 'mobx-react';
import { create } from 'mobx-persist';

import { Div } from 'glamorous';

import DevTools from 'mobx-react-devtools';

import App from './components/App';
import AppState from './state';

const hydrate = create();
const state = new AppState();
hydrate('appState', state).then((s) => {
  s.setHydrated();
  s.checkLogin();
});
window.state = state;

ReactDOM.render(
  <Provider state={state}>
    <Div fontFamily="Roboto" fontWeight={300} height="100%">
      <App />
      <DevTools />
    </Div>
  </Provider>,
  document.getElementById('app'),
);
