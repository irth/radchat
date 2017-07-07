import React from 'react';
import { inject, observer } from 'mobx-react';

import Landing from './Landing';
import Chat from './Chat';

export default inject('state')(
  observer(({ state }) => {
    console.log(state.loggedIn);
    if (!state.loggedIn) {
      return <Landing />;
    }
    return <Chat />;
  }),
);
