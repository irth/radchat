import { observable, action } from 'mobx';

export default class AppState {
  @observable authToken = null;

  @action setAuthToken(token) {
    this.authToken = token;
  }
}
