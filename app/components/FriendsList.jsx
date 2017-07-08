import React from 'react';
import { observable, computed } from 'mobx';
import { inject, observer } from 'mobx-react';
import glamorous from 'glamorous';

import User, { Status } from './User';
import Dialog, { DialogContent, DialogTitle, DialogActions, DialogAction } from './Dialog';

const Container = glamorous.div({
  minWidth: '13em',
  background: '#333',
  color: 'white',
});

const FriendsListUl = glamorous.ul({
  listStyleType: 'none',
  padding: 0,
  margin: 0,
});

const Friend = glamorous(User)(({ active }) => ({
  ':hover': active || {
    background: '#242424',
    cursor: 'pointer',
  },
  background: active && 'white',
  color: active && 'black',
}));

const Top = glamorous.div({
  background: 'black',
  marginBottom: '.4em',
});

const Filter = glamorous.input({
  width: '100%',
  boxSizing: 'border-box',
  padding: '.5em 1em',
  background: '#555',
  border: 'none',
  color: 'white',
  ':focus': {
    outline: 'none',
  },
  '::placeholder': {
    color: '#ccc',
  },
});

const StatusSelect = glamorous.ul({ listStyleType: 'none', padding: 0 });
const StatusLi = glamorous.li({
  padding: '1em',
  borderRadius: 3,
  ':hover': { background: '#eaeaea' },
});
const StatusPadded = glamorous(Status)({
  marginRight: '.5em',
});

const StatusList = ({ onSelect }) =>
  (<DialogContent>
    <DialogTitle>Choose your status</DialogTitle>
    <StatusSelect>
      <StatusLi onClick={() => onSelect('available')}>
        <StatusPadded status="available" /> Available
      </StatusLi>
      <StatusLi onClick={() => onSelect('busy')}>
        <StatusPadded status="busy" /> Busy
      </StatusLi>
      <StatusLi onClick={() => onSelect('away')}>
        <StatusPadded status="away" /> Away
      </StatusLi>
      <StatusLi onClick={() => onSelect('unavailable')}>
        <StatusPadded status="unavailable" /> Unavailable
      </StatusLi>
    </StatusSelect>
  </DialogContent>);

@inject('state')
@observer
export default class FriendsList extends React.Component {
  @observable statusDialog = false;
  @observable filter = '';

  @computed
  get friends() {
    return this.props.state.friends.filter(
      f =>
        f.display_name.toLocaleLowerCase().indexOf(this.filter.toLocaleLowerCase()) !== -1 ||
        f.username.toLocaleLowerCase().indexOf(this.filter.toLocaleLowerCase()) !== -1,
    );
  }

  render() {
    return (
      <Container>
        <Top>
          <User onClickStatus={() => (this.statusDialog = true)} user={this.props.state.user} />
          {this.statusDialog &&
            <Dialog onOverlayClick={() => (this.statusDialog = false)}>
              <StatusList
                onSelect={(status) => {
                  this.props.state.setStatus(status);
                  this.statusDialog = false;
                }}
              />
              <DialogActions>
                <DialogAction onClick={() => (this.statusDialog = false)}>Cancel</DialogAction>
              </DialogActions>
            </Dialog>}
          <Filter placeholder="search friends..." onChange={e => (this.filter = e.target.value)} />
        </Top>
        {this.friends.length > 0
          ? <FriendsListUl>
            {this.friends.map(f =>
                (<li key={f.id}>
                  <Friend
                    active={f.id === this.props.state.activeChat}
                    onClick={() => this.props.state.setActiveChat(f.id)}
                    user={f}
                  />
                </li>),
              )}
          </FriendsListUl>
          : <glamorous.Div padding="1em">
            {this.props.state.friends.length === 0
                ? 'You have no friends yet :('
                : 'No friends found...'}
          </glamorous.Div>}
      </Container>
    );
  }
}
