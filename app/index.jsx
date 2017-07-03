import React from 'react';
import ReactDOM from 'react-dom';
import IO from 'socket.io-client';

import App from './components/App';

const sock = IO.connect();
sock.on('news', () => alert('hurray'));

ReactDOM.render(<App />, document.getElementById('app'));
