import React from 'react';
import glamorous from 'glamorous';
import { css } from 'glamor';

const flex = css({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '.5em 1em',
});

const DisplayName = glamorous.div({ fontWeight: 'normal' });
const Username = glamorous.div();

const Status = glamorous.div(({ connected }) => ({
  width: '.7em',
  height: '.7em',
  borderRadius: '.35em',
  background: connected ? 'green' : 'gray',
  margin: '1em',
  marginRight: 0,
}));

export default ({ className, user }) =>
  (<div className={`${className} ${flex}`}>
    <div>
      <DisplayName>
        {user.display_name}
      </DisplayName>
      <Username>
        @{user.username}
      </Username>
    </div>
    <Status connected={user.connected} />
  </div>);
