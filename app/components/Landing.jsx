import React from 'react';
import { inject, observer } from 'mobx-react';

import GoogleLogin from 'react-google-login';

export default inject('state')(
  observer(({ state }) =>
    (<GoogleLogin
      clientId="41009918331-5jiap87h9iaaag4qi597siluelvq3706.apps.googleusercontent.com"
      buttonText="Login"
      onSuccess={(r) => {
        state.setGoogleAuthToken(r.tokenId);
      }}
      onFailure={() => {}}
    />),
  ),
);
