import React from 'react';
import { observable } from 'mobx';
import { inject, observer } from 'mobx-react';

import glamorous from 'glamorous';

import { API_URL } from '../state';

const DialogOverlay = glamorous.div({
  position: 'fixed',
  width: '100%',
  height: '100%',
  left: 0,
  top: 0,
  background: 'rgba(0,0,0,0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});

const Dialog = glamorous.div({
  display: 'flex',
  flexDirection: 'column',
  background: 'white',
  boxSizing: 'border-box',
  borderRadius: 2,
  paddingTop: '1em',
  paddingLeft: '1em',
  paddingRight: '1em',
  paddingBottom: '.5em',
  minWidth: 480,
  maxWidth: '75%',
  boxShadow: '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)',
  maxHeight: '75%',
  '@media(max-width: 480px)': {
    borderRadius: 0,
    width: '100%',
    minWidth: 0,
    maxWidth: '100%',
    maxHeight: '100%',
  },
});

const DialogContent = glamorous.div({
  flex: 1,
  overflowY: 'auto',
});

const DialogTitle = glamorous.div({
  fontWeight: 400,
  fontSize: '120%',
  marginBottom: '.5em',
});

const DialogSubtitle = glamorous.div({
  marginBottom: '1.5em',
});

const Input = glamorous.input({
  display: 'block',
  boxSizing: 'border-box',
  width: '100%',
  padding: '.5em',
  background: 'white',
  border: 'none',
  borderBottom: 'solid 1px gray',
  marginTop: '.1em',
  paddingBottom: 'calc(1px + .5em)',
  transition: 'all .5s',
  ':focus': {
    outline: 'none',
    borderBottom: 'solid 2px teal',
    paddingBottom: '.5em',
  },
});

const Error = glamorous.div({
  color: 'red',
  textAlign: 'center',
  marginTop: '.7em',
  fontSize: '90%',
});

const Label = glamorous.label({
  display: 'block',
  marginTop: '1em',
  marginBottom: 0,
  paddingBottom: 0,
});

const DialogActions = glamorous.div({
  flexGrow: 0,
  flexShrink: 0,
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-end',
  marginTop: '.5em',
  bottom: 0,
});

const DialogAction = glamorous.a(({ color, disabled }) => ({
  textTransform: 'uppercase',
  padding: '.6em 1.2em',
  fontWeight: 400,
  fontSize: '90%',
  color: !disabled ? color || 'teal' : 'gray',
  borderRadius: 3,
  transition: 'all .3s',
  cursor: !disabled ? 'pointer' : 'default',
  ':hover': !disabled
    ? {
      background: '#e8e8e8',
    }
    : {},
}));
@inject('state')
@observer
export default class SetupDialog extends React.Component {
  @observable displayName = this.props.state.user.display_name;
  @observable username = '';
  @observable error = null;

  save() {
    fetch(`${API_URL}/profile/me`, {
      method: 'PATCH',
      body: JSON.stringify({
        auth_token: this.props.state.authToken,
        display_name: this.displayName,
        username: this.username,
      }),
    }).then((r) => {
      console.log(r.status);
      if (r.status === 422) {
        this.error = 'constraint';
      } else if (r.status !== 200) {
        this.error = 'unknown';
      } else {
        r.json().then((j) => {
          this.props.state.setUser(j);
          this.props.state.setFirstTimeSetup(true);
        });
      }
    });
  }

  render() {
    return (
      !this.props.state.firstTimeSetupComplete &&
      <DialogOverlay>
        <Dialog>
          <DialogContent>
            <DialogTitle>Profile setup</DialogTitle>
            <DialogSubtitle>
              We need some information from you to finish setting up your profile.
            </DialogSubtitle>
            <div>
              <Label for="display_name">The name that others will see in their friends list:</Label>
              <Input
                id="display_name"
                placeholder="Display name"
                onChange={(e) => {
                  this.displayName = e.target.value;
                }}
                defaultValue={this.props.state.user.display_name}
              />
              <Label for="username">
                Your very own username that will allow your friends to find you:
                {this.error === 'constraint' && <Error>this username has been taken</Error>}
              </Label>
              <Input
                id="username"
                placeholder="Username"
                onChange={(e) => {
                  this.username = e.target.value;
                  this.error = null;
                }}
              />
            </div>
            {this.error === 'unknown' &&
              <Error>Something went wrong. Please try again later.</Error>}
          </DialogContent>
          <DialogActions>
            <DialogAction color="#333" onClick={() => this.props.state.logOut()}>
              Log out
            </DialogAction>
            <DialogAction onClick={() => this.save()}>Save</DialogAction>
          </DialogActions>
        </Dialog>
      </DialogOverlay>
    );
  }
}
