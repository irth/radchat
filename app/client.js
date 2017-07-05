import { autorun } from 'mobx';

const API_URL = 'http://localhost:3000';
const WS_URL = 'ws://localhost:3000/socket';

class Client {
  constructor(state) {
    this.state = state;
    this.sock = null;
    this.connectDisposer = autorun(() => this.connect());
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
    this.sock = new WebSocket(WS_URL);
    const s = this.sock;
    s.onmessage = this.onSocketMessage.bind(this);
    s.onopen = () => s.send(JSON.stringify({ type: 'auth', authToken: this.state.authToken }));
  }

  onSocketMessage(event) {
    const data = JSON.parse(event.data);
    console.log(data);
    switch (data.type) {
      case 'auth':
        this.state.setConnectionState(true);
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
