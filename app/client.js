import { autorun } from 'mobx';

class Client {
  constructor(state) {
    this.state = state;
    autorun(() => this.connect());
  }

  connect() {
    if (this.state.authToken != null) {
      console.log('fetching');
      fetch('http://localhost:3000/auth/google', {
        method: 'POST',
        body: JSON.stringify({
          authToken: this.state.authToken,
        }),
      })
        .then(r => r.json())
        .then((x) => {
          window.y = x;
          console.log(x);
        });
    }
  }
}

export default function runClient(state) {
  return new Client(state);
}
