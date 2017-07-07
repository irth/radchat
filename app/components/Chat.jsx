import React from 'react';

import { inject, observer } from 'mobx-react';

import SetupDialog from './SetupDialog';

export default inject('state')(
  observer(({ state }) =>
    (<div>
      <SetupDialog />
      <div>
        hello, {state.user.display_name}. You are {state.connectionState}.
      </div>
      <div>
        {state.friends.length === 0
          ? 'You have no friends'
          : <ul>
            {state.friends.map(friend =>
                (<li key={friend.id}>
                  {friend.display_name}{' '}
                  <input
                    onChange={(e) => {
                      state.setInput(friend.id, e.target.value);
                    }}
                  />
                </li>),
              )}
          </ul>}
      </div>
    </div>),
  ),
);
