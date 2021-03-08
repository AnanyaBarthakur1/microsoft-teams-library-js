import React, { ReactElement } from 'react';
import { appInitialization } from '@microsoft/teamsjs-app-sdk';
import BoxAndButton from './BoxAndButton';

const AppInitializationAPIs = (): ReactElement => {
  const [notifyLoadedRes, setNotifyLoadedRes] = React.useState('');
  const [notifySuccessRes, setNotifySuccessRes] = React.useState('');
  const [notifyFailureRes, setNotifyFailureRes] = React.useState('');

  const notifyLoaded = (): void => {
    appInitialization.notifyAppLoaded();
    setNotifyLoadedRes('called');
  };

  const notifySuccess = (): void => {
    appInitialization.notifySuccess();
    setNotifySuccessRes('called');
  };

  const notifyFailure = (): void => {
    appInitialization.notifyFailure({ reason: appInitialization.FailedReason.Other });
    setNotifyFailureRes('called');
  };

  return (
    <>
      <BoxAndButton
        handleClick={notifyLoaded}
        output={notifyLoadedRes}
        hasInput={false}
        title="appInitialization.appLoaded"
        name="appInitializationAppLoaded"
      />
      <BoxAndButton
        handleClick={notifySuccess}
        output={notifySuccessRes}
        hasInput={false}
        title="appInitialization.success"
        name="appInitializationSuccess"
      />
      <BoxAndButton
        handleClick={notifyFailure}
        output={notifyFailureRes}
        hasInput={false}
        title="appInitialization.failure"
        name="appInitializationFailure"
      />
    </>
  );
};

export default AppInitializationAPIs;
