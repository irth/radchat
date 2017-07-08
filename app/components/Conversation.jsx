import React from 'react';
import { inject, observer } from 'mobx-react';
import glamorous from 'glamorous';

import Messages from './Messages';
import ChatInput from './ChatInput';

const Wrapper = glamorous.div({
  display: 'flex',
  flexDirection: 'column',
  background: '#fefefe',
  height: '100%',
});

const NoConversation = () =>
  (<glamorous.Div
    width="100%"
    height="100%"
    display="flex"
    alignItems="center"
    justifyContent="center"
    flexDirection="column"
    textAlign="center"
  >
    <glamorous.Div fontSize="140%" margin="1em">
      Select a friend from the list and start chatting!
    </glamorous.Div>
    <glamorous.Div margin="1em">
      By the way, if you like our app, would you mind sharing it with your friends?
    </glamorous.Div>
  </glamorous.Div>);

const Title = glamorous.div({
  flexGrow: 0,
  flexShrink: 0,
  padding: '.5em',
  paddingBottom: '1em',
  margin: '.5em',
  marginBottom: 0,
  textAlign: 'center',
  borderBottom: '1px solid #ccc',
  fontWeight: 400,
});

@inject('state')
@observer
export default class Conversation extends React.Component {
  render() {
    return this.props.state.activeChat != null
      ? <Wrapper>
        <Title>
          {this.props.state.activeChatUser.display_name}
        </Title>
        <Messages ref={el => (this.messages = el)} />
        <ChatInput
          onSubmit={(msg) => {
            if (this.messages != null) this.messages.wrappedInstance.enableAutoScroll();
            this.props.state.sendMessage(this.props.state.activeChat, msg);
          }}
          onChange={msg => this.props.state.setInput(this.props.state.activeChat, msg)}
        />
      </Wrapper>
      : <NoConversation />;
  }
}
