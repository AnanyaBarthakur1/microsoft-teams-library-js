import { authentication } from '@microsoft/teams-js';
import React from 'react';
import { GoogleLogin } from 'react-google-login';
const CLIENT_ID = '745160075668-08n55u98evukluv1brdrum45q74ajd3s.apps.googleusercontent.com';
const handleSuccess = () => () => {
  authentication.notifySuccess();
  alert('worked');
};
const handleFailure = () => () => {
  authentication.notifyFailure('auth failed');
};
export const GAuthApp: React.FC = () => {
  return (
    <GoogleLogin
      clientId={CLIENT_ID}
      buttonText="Login"
      onSuccess={() => handleSuccess()}
      onFailure={() => handleFailure()}
      cookiePolicy={'single_host_origin'}
    />
  );
};
