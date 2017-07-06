import { autorun } from 'mobx';

import { ConnectionState } from './state';

const API_URL = 'http://localhost:3000';
const WS_URL = 'ws://localhost:3000/socket';

class Client {
  constructor(state) {
    this.state = state;
    this.sock = null;
    this.connectDisposer = autorun(() => this.connect());
    this.queueDisposer = () => {};
  }

  connect() {
    if (this.state.googleAuthToken != null) {
      this.connectDisposer();
      fetch(`${API_URL}/auth/google`, {
        method: 'POST',
        body: JSON.stringify({
          authToken: this.state.googleAuthToken,
        }),
      })
        .then(r => r.json())
        .then((r) => {
          this.state.authToken = r.authToken;
          this.fetchProfile();
          this.connectWebsocket();
        });
    }
  }

  connectWebsocket() {
    this.state.setConnectionState(ConnectionState.CONNECTING);
    this.sock = new WebSocket(WS_URL);
    const s = this.sock;
    s.onmessage = this.onSocketMessage.bind(this);
    s.onopen = this.onSocketOpen.bind(this);
    s.onerror = () => this.state.setConnectionState(ConnectionState.ERROR);
  }

  onSocketOpen() {
    this.sock.send(JSON.stringify({ type: 'auth', authToken: this.state.authToken }));
  }

  onAuthorized() {
    this.sock.send(JSON.stringify({ type: 'getFriends' }));
    this.queueDisposer = autorun(() => {
      if (this.state.changeQueue.length > 0) {
        this.execChange(this.state.changeQueue.pop());
      }
    });
  }

  execChange(ch) {
    switch (ch.type) {
      case 'change':
        this.sock.send(
          JSON.stringify({
            type: 'inputBufferUpdate',
            id: ch.id,
            value: ch.val,
          }),
        );
        break;
      default:
        break;
    }
  }

  onSocketMessage(event) {
    const data = JSON.parse(event.data);
    console.log(data);
    switch (data.type) {
      case 'auth':
        this.state.setConnectionState(ConnectionState.CONNECTED);
        this.onAuthorized();
        break;
      case 'friendsList':
        this.state.setFriends(data.friends);
        break;
      case 'inputBufferUpdate':
        console.log(data);
        break;
      default:
        break;
    }
  }

  fetchProfile() {
    fetch(`${API_URL}/profile/me`, {
      method: 'POST',
      body: JSON.stringify({
        authToken: this.state.authToken,
      }),
    })
      .then(r => r.json())
      .then((r) => {
        this.state.setUser(r);
      });
  }
}

export default function runClient(state) {
  return new Client(state);
}
