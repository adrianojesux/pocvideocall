import React, {useEffect, useState} from 'react';
import {
  View,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  PermissionsAndroid,
  Alert,
} from 'react-native';

import RtcEngine, {
  RtcLocalView,
  RtcRemoteView,
  VideoRenderMode,
} from 'react-native-agora';

import styles from './styles';

interface State {
  appId: string;
  channelName: string;
  token: string;
  joinSucceed: boolean;
  peerIds: number[];
}

const Home: React.FC = () => {
  const [myState, setMyState] = useState<State>({
    appId: 'e7539fde070a4d7b9967a7063d5b125a',
    channelName: 'chanelTeste',
    token:
      '006e7539fde070a4d7b9967a7063d5b125aIAD+5XGz+sB/pwXoeZNoTwyhKm77mE5gtbN5HSA0raCwt0ofF6kAAAAAEABT0NwW2z7cXwEAAQDbPtxf',
    joinSucceed: false,
    peerIds: [],
  });
  let engine: RtcEngine;

  useEffect(() => {
    if (Platform.OS == 'android') {
      requestAndroidCameraPermission().then(() => {
        console.log('Requested');
      });
    }
    init();
  }, []);

  const init = async () => {
    engine = await RtcEngine.create(myState?.appId);
    await engine.enableVideo();

    engine.addListener('UserJoined', (uid, elapsed) => {
      console.log('UserJoined', uid, elapsed);
      if (myState.peerIds.indexOf(uid) === -1) {
        setMyState({...myState, peerIds: [...myState.peerIds, uid]});
      }
    });

    engine.addListener('UserOffline', (uid, reason) => {
      console.log('UserOffline', uid, reason);
      setMyState({
        ...myState,
        peerIds: [...myState.peerIds.filter((p) => p !== uid)],
      });
    });

    engine.addListener('JoinChannelSuccess', (channel, uid, elapsed) => {
      console.log('JoinChannelSuccess', channel, uid, elapsed);
      setMyState({...myState, joinSucceed: true});
    });
  };

  const requestAndroidCameraPermission = async () => {
    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      ]);

      if (
        granted['android.permission.CAMERA'] ===
          PermissionsAndroid.RESULTS.GRANTED &&
        granted['android.permission.RECORD_AUDIO'] ===
          PermissionsAndroid.RESULTS.GRANTED
      ) {
        console.log('Você pode acessar a camera');
      } else {
        console.log(
          'Acesso ao recursos do dispositivo não permitido pelo usuário.',
        );
      }
    } catch (e) {
      console.warn(e);
    }
  };

  const startCall = async () => {
    if (!engine) await init();
    await engine.joinChannel(myState.token, myState.channelName, null, 0);
  };

  const endCall = async () => {
    await engine.leaveChannel();
    setMyState({...myState, peerIds: [], joinSucceed: false});
  };

  const _renderRemoteVideos = () => {
    return (
      <ScrollView
        style={styles.remoteContainer}
        contentContainerStyle={{paddingHorizontal: 2.5}}
        horizontal={true}>
        {myState.peerIds.map((value, index, array) => {
          return (
            // Set the rendering mode of the video view as Hidden,
            // which uniformly scales the video until it fills the visible boundaries.
            <RtcRemoteView.SurfaceView
              style={styles.remote}
              uid={value}
              channelId={myState.channelName}
              renderMode={VideoRenderMode.Hidden}
              zOrderMediaOverlay={true}
            />
          );
        })}
      </ScrollView>
    );
  };

  const _renderVideos = () => {
    console.log(myState);
    myState.joinSucceed ? (
      <View style={styles.fullView}>
        <RtcLocalView.SurfaceView
          style={styles.max}
          channelId={myState.channelName}
          renderMode={VideoRenderMode.FILL}
        />
        {_renderRemoteVideos()}
      </View>
    ) : null;
  };

  return (
    <View style={styles.max}>
      <View style={styles.max}>
        <View style={styles.buttonHolder}>
          <TouchableOpacity onPress={startCall} style={styles.button}>
            <Text style={styles.buttonText}> Start Call </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={endCall} style={styles.button}>
            <Text style={styles.buttonText}> End Call </Text>
          </TouchableOpacity>
        </View>
        {_renderVideos()}
      </View>
    </View>
  );
};

export default Home;
