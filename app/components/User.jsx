import React from 'react';
import { observer } from 'mobx-react';
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

const Status = glamorous.div(({ status }) => {
  let color;
  switch (status) {
    case 'available':
      color = 'green';
      break;
    case 'busy':
      color = 'red';
      break;
    case 'away':
      color = 'yellow';
      break;
    default:
      color = 'gray';
  }
  return {
    width: '.7em',
    height: '.7em',
    borderRadius: '.35em',
    background: color,
    margin: '1em',
    marginRight: 0,
  };
});

export default observer(({ className, user }) =>
  (<div className={`${className} ${flex}`}>
    <div>
      <DisplayName>
        {user.display_name}
      </DisplayName>
      <Username>
        @{user.username}
      </Username>
    </div>
    <Status status={user.status} />
  </div>),
);
