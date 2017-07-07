import React from 'react';
import { inject, observer } from 'mobx-react';

import Landing from './Landing';
import Chat from './Chat';

export default inject('state')(
  observer(({ state }) => {
    if (!state.loggedIn) {
      return <Landing />;
    }
    return <Chat />;
  }),
);
