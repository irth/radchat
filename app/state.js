import { observable, action, computed } from 'mobx';
import { persist } from 'mobx-persist';

import uniqueId from 'lodash.uniqueid';

export const API_URL = 'http://localhost:3000';
export const WS_URL = 'ws://localhost:3000/socket';

export class ConnectionState {
  static LOGGING_IN = 'LOGGING_IN';
  static LOGGED_IN = 'LOGGED_IN';
  static LOGIN_FAILED = 'LOGIN_FAILED';
  static DISCONNECTED = 'DISCONNECTED';
  static CONNECTING = 'CONNECTING';
  static CONNECTED = 'CONNECTED';
  static WS_ERROR = 'WS_ERROR';

  static isLoggedIn(state) {
    return (
      [
        ConnectionState.LOGGED_IN,
        ConnectionState.CONNECTING,
        ConnectionState.CONNECTED,
        ConnectionState.WS_ERROR,
      ].indexOf(state) !== -1
    );
  }
}

class SocketConnection {
  constructor(authToken) {
    this.sock = null;
    this.authToken = authToken;
    this.eventHandlers = {
      connected: [],
      connectionError: [],
      inputBufferUpdate: [],
      statusUpdate: [],
      message: [],
    };
  }

  on(ev, handler) {
    if (this.eventHandlers[ev] != null) {
      this.eventHandlers[ev].push(handler);
      return () => {
        const h = this.eventHandlers[ev];
        const i = h.indexOf(handler);
        if (i > -1) h.splice(i, 1);
      };
    }
    return null;
  }

  callHandlers(ev, ...args) {
    if (this.eventHandlers[ev] != null) {
      this.eventHandlers[ev].forEach(handler => handler(...args));
    }
  }

  connect() {
    this.sock = new WebSocket(`${WS_URL}?auth_token=${this.authToken}`);
    const s = this.sock;
    s.onmessage = this.onSocketMessage.bind(this);
    s.onopen = this.onSocketOpen.bind(this);
    s.onerror = this.onSocketError.bind(this);
  }

  onSocketOpen() {
    this.callHandlers('connected');
  }

  onSocketError(e) {
    this.callHandlers('connectionError', e);
  }

  onSocketMessage(event) {
    const data = JSON.parse(event.data);
    console.log(data);
    this.callHandlers(data.type, data);
  }
}

export default class AppState {
  @persist
  @observable
  authToken = null;

  /* state.hydrated is a workaround for https://github.com/anthonyjgrove/react-google-login/issues/86 */
  @observable hydrated = false;
  @action
  setHydrated() {
    this.hydrated = true;
  }

  @computed
  get firstTimeSetupComplete() {
    return this.user && this.user.username;
  }

  @computed
  get loggedIn() {
    return ConnectionState.isLoggedIn(this.connectionState);
  }

  @action
  setAuthToken(token) {
    this.authToken = token;
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

  @observable activeChat = null;
  @computed
  get activeChatUser() {
    const user = this.friends.find(f => f.id === this.activeChat);
    return user || {};
  }

  @action
  setActiveChat(userId) {
    this.activeChat = userId;
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
        this.setConnectionState(ConnectionState.LOGGED_IN);
        this.fetchFriends();
        if (!r.first_time) this.connect();
      })
      .catch(() => {
        this.logOut();
        this.setConnectionState(ConnectionState.LOGIN_FAILED);
      });
  }

  @action
  checkLogin() {
    if (this.authToken == null) {
      this.logOut();
      return;
    }

    if (!this.isLoggedIn) this.setConnectionState(ConnectionState.LOGGING_IN);

    fetch(`${API_URL}/profile?auth_token=${this.authToken}`).then((r) => {
      if (r.status === 200) {
        r.json().then((data) => {
          this.setUser(data);
          if (!this.loggedIn) this.setConnectionState(ConnectionState.LOGGED_IN);
          this.fetchFriends();
          if (this.firstTimeSetupComplete) this.connect();
        });
      } else {
        this.logOut();
      }
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
    if (!this.loggedIn) {
      this.checkLogin();
      return;
    }
    this.setConnectionState(ConnectionState.CONNECTING);

    this.sock = new SocketConnection(this.authToken);

    this.sock.on('connected', () => {
      this.setConnectionState(ConnectionState.CONNECTED);
    });
    this.sock.on('connectionError', () => this.setConnectionState(ConnectionState.WS_ERROR));
    this.sock.on('statusUpdate', data => this.setFriendStatus(data.id, data.status));
    this.sock.on('message', data => this.addMessage(data.from, data.message));
    this.sock.connect();
  }

  @observable user = {};

  @action
  setUser(user) {
    this.user = user;
  }

  @observable friends = [];

  @action
  fetchFriends() {
    fetch(`${API_URL}/friends?auth_token=${this.authToken}`)
      .then(r => r.json())
      .then(j => this.setFriends(j.friends));
  }

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

  @action
  setFriendStatus(id, status) {
    if (id === this.user.id) {
      this.user.status = status;
    } else {
      const friend = this.friends.find(x => x.id === id);
      if (friend != null) friend.status = status;
    }
  }

  @action
  setStatus(status) {
    fetch(`${API_URL}/profile`, {
      method: 'PATCH',
      body: JSON.stringify({
        auth_token: this.authToken,
        status,
      }),
    }).then((r) => {
      if (r.status === 200) r.json().then(j => this.setUser(j));
    });
  }

  messages = observable.map({});

  @action
  sendMessage(id, message) {
    const messageId = uniqueId('msg');
    if (!this.messages.has(id.toString())) {
      this.messages.set(id.toString(), []);
    }

    this.messages
      .get(id.toString())
      .push({ messageId, sender: this.user.id, target: id, sent: false, message });

    fetch(`${API_URL}/send`, {
      method: 'POST',
      body: JSON.stringify({ auth_token: this.authToken, id, message }),
    });
  }

  @action
  addMessage(id, message) {
    if (!this.messages.has(id.toString())) {
      this.messages.set(id.toString(), []);
    }
    this.messages.get(id.toString()).push({ sender: id, target: this.user.id, message });
  }

  @action
  markMessageAsSent(id, messageId) {
    const msg = this.messages.get(id.toString()).find(m => m.messageId === messageId);
    if (msg != null) msg.sent = true;
  }
}
