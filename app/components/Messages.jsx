import React from 'react';
import { observable, computed } from 'mobx';
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

@inject('state')
@observer
export default class Messages extends React.Component {
  componentDidMount() {
    this.scrollToBottom();
    this.container.onscroll = (e) => {
      const up = this.oldScrollTop > e.target.scrollTop;
      const atBottom = e.target.scrollTop + e.target.offsetHeight + 32 > e.target.scrollHeight;
      if (up) {
        this.autoScroll = false;
      } else if (atBottom) {
        this.autoScroll = true;
      }
      this.oldScrollTop = e.target.scrollTop;
    };
  }

  componentDidUpdate() {
    if (this.autoScroll) {
      this.scrollToBottom();
    }
  }

  enableAutoScroll = () => {
    this.autoScroll = true;
  };

  scrollToBottom = () => {
    this.container.scrollTop = this.container.scrollHeight;
  };

  @computed
  get messageCount() {
    return this.props.state.activeChatMessages.length;
  }
  @observable oldScrollTop = 0;
  @observable autoScroll = true;

  render() {
    return (
      <glamorous.Div
        flex={2}
        display="flex"
        flexDirection="column"
        padding=".5em 0"
        overflowY="scroll"
        margin="0 .5em"
        borderBottom="solid 1px #ccc"
        innerRef={el => (this.container = el)}
      >
        {this.props.state.activeChatMessages.map(m =>
          (<glamorous.Div
            key={m.localId}
            textAlign={m.sender === this.props.state.user.id ? 'right' : 'left'}
          >
            <Message own={m.sender === this.props.state.user.id}>
              {m.message}
            </Message>
          </glamorous.Div>),
        )}
        {this.props.state.activeChatRemoteInput.length > 0 &&
          <glamorous.Div key="remote" textAlign="left">
            <Message live>
              {this.props.state.activeChatRemoteInput}
            </Message>
          </glamorous.Div>}
      </glamorous.Div>
    );
  }
}
