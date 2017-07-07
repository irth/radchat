import { autorun } from 'mobx';

import { ConnectionState } from './state';

const API_URL = 'http://localhost:3000';
const WS_URL = 'ws://localhost:3000/socket';

export class Client {
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
          auth_token: this.state.googleAuthToken,
        }),
      })
        .then(r => r.json())
        .then((r) => {
          this.state.setAuthToken(r.auth_token);
          this.state.setUser(r.user);
          this.state.setFirstTimeSetup(r.first_time);
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
      if (this.state.workQueue.length > 0) {
        this.execWork(this.state.workQueue.pop());
      }
    });
  }

  execWork(ch) {
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
      case 'updateProfile':
        fetch(`${API_URL}/profile/me`, {
          method: 'PATCH',
          body: JSON.stringify(ch.profile),
        }).then((r) => {
          if (r.status === 422) {
            this.state.setWorkResult();
          }
        });
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

export default function runClient() {
  // return new Client(state);
}
