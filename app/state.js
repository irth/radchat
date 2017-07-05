import { observable, action, computed } from 'mobx';

export default class AppState {
  @observable authToken = null;
  @observable googleAuthToken = null;

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

  @observable connected = false;

  @action
  setConnectionState(state) {
    this.connected = state;
  }

  @observable user = {};

  @action
  setUser(user) {
    this.user = user;
  }
}
