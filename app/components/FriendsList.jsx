import React from 'react';
import { observable, computed } from 'mobx';
import { inject, observer } from 'mobx-react';
import glamorous from 'glamorous';

import User from './User';

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

const Top = glamorous.div({ background: 'black' });

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

@inject('state')
@observer
export default class FriendsList extends React.Component {
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
          <User user={this.props.state.user} />
          <Filter placeholder="search friends..." onChange={e => (this.filter = e.target.value)} />
        </Top>
        {this.friends.length > 0
          ? <FriendsListUl>
            {this.friends.map(f =>
                (<li>
                  <Friend key={f.id} user={f} />
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
