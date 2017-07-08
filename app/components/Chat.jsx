import React from 'react';

import glamorous from 'glamorous';

import SetupDialog from './SetupDialog';
import FriendsList from './FriendsList';
import Conversation from './Conversation';

const ChatLayout = glamorous.div({
  display: 'flex',
  flexDirection: 'row',
  height: '100%',
});

export default () =>
  (<glamorous.Div height="100%">
    <SetupDialog />
    <ChatLayout>
      <FriendsList />
      <glamorous.Div flex={2}>
        <Conversation />
      </glamorous.Div>
    </ChatLayout>
  </glamorous.Div>);
