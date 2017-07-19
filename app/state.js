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

  setInput(id, value) {
    this.sock.send(JSON.stringify({ id, value }));
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
    this.sock.on('inputBufferUpdate', data => this.setRemoteInput(data.id, data.value));
    this.sock.on('message', data =>
      this.addReceivedMessage(data.sender, data.id, data.timestamp, data.message),
    );
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

  @computed
  get activeChatMessages() {
    if (this.activeChat != null && this.messages.has(this.activeChat.toString())) {
      return this.messages.get(this.activeChat.toString()).sort((a, b) => {
        if (a.remoteId == null && b.remoteId == null) return a.localId - b.localId;
        if (a.remoteId == null) return 1;
        if (b.remoteId == null) return -1;

        return a.remoteId - b.remoteId;
      });
    }
    return [];
  }

  @action
  sendMessage(target, message) {
    const localId = this.addMessage(
      'msg-local-sent-',
      target.toString(),
      null,
      this.user.id,
      target,
      Date.now(),
      message,
    );

    const conversation = this.messages.get(target.toString());

    fetch(`${API_URL}/send`, {
      method: 'POST',
      body: JSON.stringify({ auth_token: this.authToken, target, message }),
    }).then((r) => {
      if (r.status === 200) {
        r.json().then((j) => {
          const msg = conversation.find(i => i.localId === localId);
          console.dir(JSON.stringify(msg));
          msg.remoteId = j.id;
          console.dir(JSON.stringify(msg));
        });
      }
    });
  }

  @action
  fetchMessages(target, count = 10, before = undefined) {
    fetch(
      `${API_URL}/history?auth_token=${this
        .authToken}&friend=${target}&count=${count}&before=${before || ''}`,
    ).then((r) => {
      if (r.status === 200) {
        r.json().then(msgs =>
          msgs.forEach((m) => {
            this.addMessage(
              'msg-remote-',
              m.sender === this.user.id ? m.target : m.sender,
              m.id,
              m.sender,
              m.target,
              m.timestamp,
              m.message,
            );
          }),
        );
      }
    });
  }

  lastLocalId = 0;

  @action
  addMessage(localIdKey, convoId, remoteId, sender, target, timestamp, message) {
    this.lastLocalId += 1;
    const localId = this.lastLocalId;
    if (!this.messages.has(convoId.toString())) {
      this.messages.set(convoId.toString(), []);
    }

    if (
      remoteId != null &&
      this.messages.get(convoId.toString()).findIndex(m => m.remoteId === remoteId) !== -1
    ) {
      return -1;
    }

    this.messages.get(convoId.toString()).push({
      localId,
      remoteId,
      sender,
      target,
      timestamp,
      message,
    });
    return localId;
  }

  @action
  addReceivedMessage(sender, remoteId, timestamp, message) {
    console.warn(message);
    this.addMessage(
      'msg-local-received-',
      sender,
      remoteId,
      sender,
      this.user.id,
      timestamp,
      message,
    );
  }

  remoteInput = observable.map({});

  @action
  setRemoteInput(id, message) {
    if (id !== this.activeChat) {
      if (message.trim().length > 0) if (this.unread.indexOf(id) === -1) this.unread.push(id);
    }
    this.remoteInput.set(id.toString(), message);
  }

  @computed
  get activeChatRemoteInput() {
    if (this.activeChat == null) return '';
    return this.remoteInput.get(this.activeChat.toString()) || '';
  }

  @action
  setInput(id, message) {
    this.sock.setInput(id, message);
  }

  @observable unread = [];
}
