import React from 'react';
import { observable, action } from 'mobx';
import glamorous from 'glamorous';

export default class ChatInput extends React.Component {
  onSubmit = () => {
    const input = this.input;
    if (this.props.onSubmit != null) this.props.onSubmit(input);
    this.clearInput();
  };

  @observable input = '';

  @action
  clearInput() {
    if (this.el != null) this.el.value = '';
    this.el.focus();
    this.input = '';
  }

  render() {
    return (
      <glamorous.Div
        display="flex"
        flexDirection="row"
        alignItems="center"
        flexGrow={0}
        flexShrink={0}
      >
        <glamorous.Input
          css={{
            flex: 2,
            border: 'none',
            background: 'white',
            padding: '1.1em 1.6em',
            paddingRight: 0,
            ':focus': { outline: 'none' },
          }}
          autoFocus
          innerRef={el => (this.el = el)}
          onChange={e => (this.input = e.target.value)}
        />
        <glamorous.Div
          role="button"
          css={{
            padding: '.5em 1em',
            margin: '.3em',
            textTransform: 'uppercase',
            fontWeight: 400,
            color: 'teal',
            ':hover': {
              backgroundColor: '#eee',
            },
          }}
          onClick={this.onSubmit}
        >
          Send
        </glamorous.Div>
      </glamorous.Div>
    );
  }
}
