import React from 'react';
import { inject, observer } from 'mobx-react';

import glamorous from 'glamorous';

const Message = glamorous.div(({ own, live }) => {
  let bg = '#ddd';
  if (own && !live) {
    bg = '#222';
  } else if (live) {
    bg = 'white';
  }
  return {
    borderRadius: 10,
    ...(own ? { borderBottomRightRadius: 0 } : { borderTopLeftRadius: 0 }),
    padding: '.5em',
    background: bg,
    border: live ? 'dashed 1px black' : `solid 1px ${bg}`,
    color: own ? 'white' : 'black',
    display: 'inline-block',
    margin: '0.2em .5em',
    maxWidth: '30em',
    textAlign: 'justify',
    wordBreak: 'break-word',
  };
});

export default inject('state')(
  observer(({ state }) =>
    (<glamorous.Div
      flex={2}
      display="flex"
      flexDirection="column"
      padding=".5em 0"
      overflowY="scroll"
      margin="0 .5em"
      borderBottom="solid 1px #ccc"
    >
      {state.activeChatMessages.map(m =>
        (<glamorous.Div key={m.messageId} textAlign={m.from === state.user.id ? 'right' : 'left'}>
          <Message own={m.from === state.user.id}>
            {m.message}
          </Message>
        </glamorous.Div>),
      )}
      {state.activeChatRemoteInput.length > 0 &&
        <glamorous.Div key="remote" textAlign="left">
          <Message live>
            {state.activeChatRemoteInput}
          </Message>
        </glamorous.Div>}
    </glamorous.Div>),
  ),
);
