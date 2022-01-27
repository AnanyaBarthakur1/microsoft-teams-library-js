import { DOMMessageEvent } from '../../src/internal/interfaces';
import { meetingRoom } from '../../src/private/meetingRoom';
import { app } from '../../src/public/app';
import { FramelessPostMocks } from '../framelessPostMocks';
import { Utils } from '../utils';

describe('meetingRoom', () => {
  const mobilePlatformMock = new FramelessPostMocks();
  const desktopPlatformMock = new Utils();
  const meetingRoomInfo: meetingRoom.MeetingRoomInfo = {
    endpointId: '123-456',
    deviceName: 'conference room 001',
    clientType: 'norden',
    clientVersion: 'v-2020-09-28',
  };
  const meetingRoomCapability: meetingRoom.MeetingRoomCapability = {
    mediaControls: ['toggleMute', 'toggleCamera'],
    stageLayoutControls: ['showVideoGallery', 'showContent'],
    meetingControls: [],
  };
  const meetingRoomState: meetingRoom.MeetingRoomState = {
    toggleMute: true,
    toggleCamera: false,
    toggleCaptions: false,
    stageLayout: 'Gallery',
    leaveMeeting: false,
  };
  const errorMessage = 'error occurs';

  beforeEach(() => {
    mobilePlatformMock.messages = [];
    desktopPlatformMock.messages = [];

    // Set a mock window for testing
    app._initialize(mobilePlatformMock.mockWindow);
  });

  afterEach(() => {
    // Reset the object since it's a singleton
    if (app._uninitialize) {
      app._uninitialize();
    }
  });

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const emptyHandler = (): void => {};

  describe('getPairedMeetingRoomInfo', () => {
    it('should not allow calls before initialization', () => {
      return expect(meetingRoom.getPairedMeetingRoomInfo()).rejects.toMatchObject(
        new Error('The library has not yet been initialized'),
      );
    });

    it('should successfully get meeting room info on mobile', async () => {
      await mobilePlatformMock.initializeWithContext('content');

      const promise = meetingRoom.getPairedMeetingRoomInfo();

      const message = mobilePlatformMock.findMessageByFunc('meetingRoom.getPairedMeetingRoomInfo');
      expect(message).not.toBeNull();
      expect(message.args.length).toBe(0);

      const callbackId = message.id;
      mobilePlatformMock.respondToMessage({
        data: {
          id: callbackId,
          args: [null, meetingRoomInfo],
        },
      } as DOMMessageEvent);

      const returnedMeetingRoomInfo = await promise;
      expect(returnedMeetingRoomInfo.endpointId).toBe(meetingRoomInfo.endpointId);
      expect(returnedMeetingRoomInfo.deviceName).toBe(meetingRoomInfo.deviceName);
      expect(returnedMeetingRoomInfo.clientType).toBe(meetingRoomInfo.clientType);
      expect(returnedMeetingRoomInfo.clientVersion).toBe(meetingRoomInfo.clientVersion);
    });

    it('pass sdkError while get meeting room info on mobile', async () => {
      await mobilePlatformMock.initializeWithContext('content');

      const promise = meetingRoom.getPairedMeetingRoomInfo();

      const message = mobilePlatformMock.findMessageByFunc('meetingRoom.getPairedMeetingRoomInfo');
      expect(message).not.toBeNull();
      expect(message.args.length).toBe(0);

      const callbackId = message.id;
      mobilePlatformMock.respondToMessage({
        data: {
          id: callbackId,
          args: [{ errorCode: 500, message: errorMessage }],
        },
      } as DOMMessageEvent);

      return expect(promise).rejects.toEqual({ errorCode: 500, message: errorMessage });
    });

    it('should allow getPairedMeetingRoomInfo calls on desktop', async () => {
      await desktopPlatformMock.initializeWithContext('content');

      meetingRoom.getPairedMeetingRoomInfo();

      const message = desktopPlatformMock.findMessageByFunc('meetingRoom.getPairedMeetingRoomInfo');
      expect(message).not.toBeNull();
      expect(message.args.length).toBe(0);
    });
  });

  describe('sendCommandToPairedMeetingRoom', () => {
    it('should not allow calls before initialization', () => {
      return expect(meetingRoom.sendCommandToPairedMeetingRoom('mute')).rejects.toMatchObject(
        new Error('The library has not yet been initialized'),
      );
    });

    it('should not allow calls with null command name', async () => {
      await mobilePlatformMock.initializeWithContext('content');
      return expect(meetingRoom.sendCommandToPairedMeetingRoom(null)).rejects.toMatchObject(
        new Error('[meetingRoom.sendCommandToPairedMeetingRoom] Command name cannot be null or empty'),
      );
    });

    it('should not allow calls with empty command name', async () => {
      await mobilePlatformMock.initializeWithContext('content');
      return expect(meetingRoom.sendCommandToPairedMeetingRoom('')).rejects.toMatchObject(
        new Error('[meetingRoom.sendCommandToPairedMeetingRoom] Command name cannot be null or empty'),
      );
    });

    it('should successfully send commands on mobile', async () => {
      await mobilePlatformMock.initializeWithContext('content');

      const promise = meetingRoom.sendCommandToPairedMeetingRoom('mute');

      const message = mobilePlatformMock.findMessageByFunc('meetingRoom.sendCommandToPairedMeetingRoom');
      expect(message).not.toBeNull();
      expect(message.args.length).toBe(1);
      expect(message.args[0]).toBe('mute');

      const callbackId = message.id;
      mobilePlatformMock.respondToMessage({
        data: {
          id: callbackId,
          args: [{ errorCode: 1, message: 'command failed' }],
        },
      } as DOMMessageEvent);

      return expect(promise).rejects.toEqual({ errorCode: 1, message: 'command failed' });
    });

    it('should successfully send commands on desktop', async () => {
      await desktopPlatformMock.initializeWithContext('content');

      meetingRoom.sendCommandToPairedMeetingRoom('mute');

      const message = desktopPlatformMock.findMessageByFunc('meetingRoom.sendCommandToPairedMeetingRoom');
      expect(message).not.toBeNull();
      expect(message.args.length).toBe(1);
      expect(message.args[0]).toBe('mute');
    });
  });

  describe('registerMeetingRoomCapabilitiesUpdateHandler', () => {
    it('should not allow calls with null callback ', () => {
      expect(() => meetingRoom.registerMeetingRoomCapabilitiesUpdateHandler(null)).toThrowError(
        '[meetingRoom.registerMeetingRoomCapabilitiesUpdateHandler] Handler cannot be null',
      );
    });

    it('should not allow calls before initialization ', () => {
      expect(() => meetingRoom.registerMeetingRoomCapabilitiesUpdateHandler(emptyHandler)).toThrowError(
        'The library has not yet been initialized',
      );
    });

    it('should successful register capabilities update handler on mobile', async () => {
      await mobilePlatformMock.initializeWithContext('content');

      let handlerInvoked = false;
      let returnedCapabilities;
      meetingRoom.registerMeetingRoomCapabilitiesUpdateHandler((capabilities: meetingRoom.MeetingRoomCapability) => {
        handlerInvoked = true;
        returnedCapabilities = capabilities;
      });

      const messageForRegister = mobilePlatformMock.findMessageByFunc('registerHandler');
      expect(messageForRegister).not.toBeNull();
      expect(messageForRegister.args.length).toBe(1);
      expect(messageForRegister.args[0]).toBe('meetingRoom.meetingRoomCapabilitiesUpdate');

      mobilePlatformMock.respondToMessage({
        data: {
          func: 'meetingRoom.meetingRoomCapabilitiesUpdate',
          args: [meetingRoomCapability],
        },
      } as DOMMessageEvent);

      expect(handlerInvoked).toBeTruthy();
      expect(returnedCapabilities.mediaControls).toBe(meetingRoomCapability.mediaControls);
      expect(returnedCapabilities.stageLayoutControls).toBe(meetingRoomCapability.stageLayoutControls);
      expect(returnedCapabilities.meetingControls).toBe(meetingRoomCapability.meetingControls);
    });

    it('should successful register capabilities update handler on desktop', async () => {
      await desktopPlatformMock.initializeWithContext('content');

      meetingRoom.registerMeetingRoomCapabilitiesUpdateHandler(emptyHandler);

      const messageForRegister = desktopPlatformMock.findMessageByFunc('registerHandler');
      expect(messageForRegister).not.toBeNull();
      expect(messageForRegister.args.length).toBe(1);
      expect(messageForRegister.args[0]).toBe('meetingRoom.meetingRoomCapabilitiesUpdate');
    });
  });

  describe('registerMeetingRoomStatesUpdateHandler', () => {
    it('should not allow calls with null callback ', () => {
      expect(() => meetingRoom.registerMeetingRoomStatesUpdateHandler(null)).toThrowError(
        '[meetingRoom.registerMeetingRoomStatesUpdateHandler] Handler cannot be null',
      );
    });

    it('should not allow calls before initialization ', () => {
      expect(() => meetingRoom.registerMeetingRoomStatesUpdateHandler(emptyHandler)).toThrowError(
        'The library has not yet been initialized',
      );
    });

    it('should successful register states update handler on mobile', async () => {
      await mobilePlatformMock.initializeWithContext('content');

      let handlerInvoked = false;
      let returnedStates;
      meetingRoom.registerMeetingRoomStatesUpdateHandler((states: meetingRoom.MeetingRoomState) => {
        handlerInvoked = true;
        returnedStates = states;
      });

      const messageForRegister = mobilePlatformMock.findMessageByFunc('registerHandler');
      expect(messageForRegister).not.toBeNull();
      expect(messageForRegister.args.length).toBe(1);
      expect(messageForRegister.args[0]).toBe('meetingRoom.meetingRoomStatesUpdate');

      mobilePlatformMock.respondToMessage({
        data: {
          func: 'meetingRoom.meetingRoomStatesUpdate',
          args: [meetingRoomState],
        },
      } as DOMMessageEvent);

      expect(handlerInvoked).toBeTruthy();
      expect(returnedStates.toggleMute).toBe(meetingRoomState.toggleMute);
      expect(returnedStates.toggleCamera).toBe(meetingRoomState.toggleCamera);
      expect(returnedStates.toggleCaptions).toBe(meetingRoomState.toggleCaptions);
      expect(returnedStates.stageLayout).toBe(meetingRoomState.stageLayout);
      expect(returnedStates.leaveMeeting).toBe(meetingRoomState.leaveMeeting);
    });

    it('should successful register states update handler on desktop', async () => {
      await desktopPlatformMock.initializeWithContext('content');

      meetingRoom.registerMeetingRoomStatesUpdateHandler(emptyHandler);

      const messageForRegister = desktopPlatformMock.findMessageByFunc('registerHandler');
      expect(messageForRegister).not.toBeNull();
      expect(messageForRegister.args.length).toBe(1);
      expect(messageForRegister.args[0]).toBe('meetingRoom.meetingRoomStatesUpdate');
    });
  });
});
