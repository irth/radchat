import React from 'react';
import glamorous from 'glamorous';

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
  color: 'black',
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

export const DialogContent = glamorous.div({
  flex: 1,
  overflowY: 'auto',
});

export const DialogTitle = glamorous.div({
  fontWeight: 400,
  fontSize: '120%',
  marginBottom: '.5em',
});

export const DialogSubtitle = glamorous.div({
  marginBottom: '1.5em',
});

export const DialogActions = glamorous.div({
  flexGrow: 0,
  flexShrink: 0,
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-end',
  marginTop: '.5em',
  bottom: 0,
});

export const DialogAction = glamorous.a(({ color, disabled }) => ({
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

export default ({ onOverlayClick, children }) =>
  (<DialogOverlay onClick={onOverlayClick}>
    <Dialog onClick={e => e.stopPropagation()}>
      {children}
    </Dialog>
  </DialogOverlay>);
