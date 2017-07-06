import { observable, action, computed } from 'mobx';

export class ConnectionState {
  static DISCONNECTED = 'DISCONNECTED';
  static CONNECTING = 'CONNECTING';
  static CONNECTED = 'CONNECTED';
  static ERROR = 'ERROR';
}

export default class AppState {
  @observable authToken = null;
  @observable googleAuthToken = null;
  @observable firstTimeSetup = false;

  @computed
  get loggedIn() {
    return this.authToken != null;
  }

  @action
  setAuthToken(token) {
    this.authToken = token;
  }

  @action
  setGoogleAuthToken(token) {
    this.googleAuthToken = token;
  }

  @action
  setFirstTimeSetup(setup) {
    this.firstTimeSetup = setup;
  }

  @observable connectionState = ConnectionState.DISCONNECTED;

  @action
  setConnectionState(state) {
    this.connectionState = state;
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

  @observable changeQueue = [];

  @action
  setInput(id, val) {
    this.changeQueue.push({ type: 'change', id, val });
  }
}
