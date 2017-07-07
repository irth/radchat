import { observable, action, computed } from 'mobx';

export const API_URL = 'http://localhost:3000';
export const WS_URL = 'ws://localhost:3000/socket';

export class ConnectionState {
  static LOGGING_IN = 'LOGGING_IN';
  static LOGGED_IN = 'LOGGED_IN';
  static LOGIN_FAILED = 'LOGIN_FAILED';
  static DISCONNECTED = 'DISCONNECTED';
  static CONNECTING = 'CONNECTING';
  static CONNECTED = 'CONNECTED';
  static ERROR = 'ERROR';

  static isLoggedIn(state) {
    return (
      [ConnectionState.LOGGED_IN, ConnectionState.CONNECTING, ConnectionState.CONNECTED].indexOf(
        state,
      ) !== -1
    );
  }
}

export default class AppState {
  @observable authToken = null;
  @observable firstTimeSetupComplete = false;

  @computed
  get loggedIn() {
    return ConnectionState.isLoggedIn(this.connectionState);
  }

  @action
  setAuthToken(token) {
    this.authToken = token;
  }

  @action
  setFirstTimeSetup(setup) {
    this.firstTimeSetupComplete = setup;
  }

  @action
  setError(err) {
    this.error = err;
  }

  @observable connectionState = ConnectionState.DISCONNECTED;

  @action
  setConnectionState(state) {
    this.connectionState = state;
  }

  @action
  logIn(googleAuthToken) {
    this.setConnectionState(ConnectionState.LOGGING_IN);
    fetch(`${API_URL}/auth/google`, {
      method: 'POST',
      body: JSON.stringify({
        auth_token: googleAuthToken,
      }),
    })
      .then(r => (r.status === 200 ? r.json() : r.json().then(e => Promise.reject(e))))
      .then((r) => {
        this.setAuthToken(r.auth_token);
        this.setUser(r.user);
        this.setFirstTimeSetup(!r.first_time);
        this.setConnectionState(ConnectionState.LOGGED_IN);
        if (!r.first_time) this.connect();
      })
      .catch((e) => {
        console.log('fail', e);
        this.setAuthToken(null);
        this.setConnectionState(ConnectionState.LOGIN_FAILED);
      });
  }

  @action
  logOut() {
    this.setAuthToken(null);
    this.setConnectionState(ConnectionState.DISCONNECTED);
  }

  sock = null;

  @action
  connect() {
    this.setConnectionState(ConnectionState.CONNECTING);
    this.sock = new WebSocket(WS_URL);
    const s = this.sock;
    s.onmessage = this.onSocketMessage.bind(this);
    s.onopen = this.onSocketOpen.bind(this);
    s.onerror = () => this.setConnectionState(ConnectionState.ERROR);
  }

  onSocketOpen() {
    this.sock.send(JSON.stringify({ type: 'auth', authToken: this.authToken }));
  }

  onAuthorized() {
    this.sock.send(JSON.stringify({ type: 'getFriends' }));
  }

  onSocketMessage(event) {
    const data = JSON.parse(event.data);
    console.log(data);
    switch (data.type) {
      case 'auth':
        this.setConnectionState(ConnectionState.CONNECTED);
        this.onAuthorized();
        break;
      case 'friendsList':
        this.setFriends(data.friends);
        break;
      case 'inputBufferUpdate':
        break;
      default:
        break;
    }
  }

  @observable user = {};

  @action
  setUser(user) {
    this.user = user;
  }

  @observable friends = [];

  @action
  addFriend(friend) {
    this.friends.push(friend);
  }

  @action
  removeFriend(friend) {
    this.friends.remove(friend);
  }

  @action
  setFriends(friends) {
    this.friends = friends;
  }

  @observable workQueue = [];
  @observable workResult = {};

  @action
  setInput(id, val) {
    this.workQueue.push({ type: 'change', id, val });
  }

  @action
  updateProfile(displayName = null, username = null) {
    this.workQueue.push({ type: 'updateProfile', display_name: displayName, username });
  }
}
