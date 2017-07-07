import React from 'react';
import { observer } from 'mobx-react';
import glamorous from 'glamorous';
import { css } from 'glamor';

const flex = css({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingTop: '.5em',
  paddingLeft: '1em',
  paddingBottom: '.5em',
});

const DisplayName = glamorous.div({ fontWeight: 'normal' });
const Username = glamorous.div();

export const Status = glamorous.div(({ status }) => {
  let color;
  let borderColor;
  switch (status) {
    case 'available':
      color = 'limegreen';
      borderColor = 'darkgreen';
      break;
    case 'busy':
      color = 'red';
      borderColor = 'darkred';
      break;
    case 'away':
      color = 'yellow';
      borderColor = 'orange';
      break;
    default:
      color = 'gray';
      borderColor = '#333';
  }
  return {
    width: '.7em',
    height: '.7em',
    borderRadius: '.7em',
    border: `1px solid ${borderColor}`,
    background: color,
    marginRight: 0,
    display: 'inline-block',
  };
});

const ClickableStatus = glamorous.div(({ clickable }) => ({
  ':hover': clickable && {
    background: '#444',
  },
  background: clickable && '#333',
  cursor: clickable && 'pointer',
  padding: '.5em .25em',
  margin: '.5em .75em',
  borderRadius: 2,
}));

export default observer(({ className, user, onClickStatus }) =>
  (<div className={`${className} ${flex}`}>
    <div>
      <DisplayName>
        {user.display_name}
      </DisplayName>
      <Username>
        @{user.username}
      </Username>
    </div>
    <ClickableStatus clickable={onClickStatus != null} onClick={onClickStatus}>
      <Status status={user.status} />
    </ClickableStatus>
  </div>),
);
