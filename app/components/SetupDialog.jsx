import React from 'react';
import { observable } from 'mobx';
import { inject, observer } from 'mobx-react';

import glamorous from 'glamorous';

import Dialog, {
  DialogContent,
  DialogTitle,
  DialogSubtitle,
  DialogActions,
  DialogAction,
} from './Dialog';

import { API_URL } from '../state';

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

@inject('state')
@observer
export default class SetupDialog extends React.Component {
  @observable displayName = this.props.state.user.display_name;
  @observable username = '';
  @observable error = null;

  save() {
    fetch(`${API_URL}/profile`, {
      method: 'PATCH',
      body: JSON.stringify({
        auth_token: this.props.state.authToken,
        display_name: this.displayName,
        username: this.username,
      }),
    }).then((r) => {
      if (r.status === 422) {
        this.error = 'constraint';
      } else if (r.status !== 200) {
        this.error = 'unknown';
      } else {
        r.json().then((j) => {
          this.props.state.setUser(j);
        });
      }
    });
  }

  render() {
    return (
      !this.props.state.firstTimeSetupComplete &&
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
          {this.error === 'unknown' && <Error>Something went wrong. Please try again later.</Error>}
        </DialogContent>
        <DialogActions>
          <DialogAction color="#333" onClick={() => this.props.state.logOut()}>
            Log out
          </DialogAction>
          <DialogAction onClick={() => this.save()}>Save</DialogAction>
        </DialogActions>
      </Dialog>
    );
  }
}
