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
  // const [myState, setMyState] = useState<State>({
  //   appId: 'e7539fde070a4d7b9967a7063d5b125a',
  //   channelName: 'chanelTeste',
  //   token:
  //     '006e7539fde070a4d7b9967a7063d5b125aIAC+2/4MCUAmluVi/mSxK5gBY5VBXu1dAgAbBHcUgjSMLEofF6kAAAAAEAB2eXH6tTXdXwEAAQC0Nd1f', //'006e7539fde070a4d7b9967a7063d5b125aIAD+5XGz+sB/pwXoeZNoTwyhKm77mE5gtbN5HSA0raCwt0ofF6kAAAAAEABT0NwW2z7cXwEAAQDbPtxf',
  //   joinSucceed: false,
  //   peerIds: [],
  // });
  const appId = 'e7539fde070a4d7b9967a7063d5b125a';
  const channelName = 'chanelTeste';
  const token =
    '006e7539fde070a4d7b9967a7063d5b125aIAC+2/4MCUAmluVi/mSxK5gBY5VBXu1dAgAbBHcUgjSMLEofF6kAAAAAEAB2eXH6tTXdXwEAAQC0Nd1f';

  const [joinSucceed, setJoinSucesseed] = useState<boolean>(false);
  const [peerIds, setPeerIds] = useState<number[]>([]);

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
    engine = await RtcEngine.create(appId);
    await engine.enableVideo();
    await engine.enableAudio();

    engine.addListener('UserJoined', (uid, elapsed) => {
      console.log('UserJoined', uid, elapsed);
      if (peerIds.indexOf(uid) === -1) {
        setPeerIds([...peerIds, uid]);
      }
    });

    engine.addListener('UserOffline', (uid, reason) => {
      console.log('UserOffline', uid, reason);
      setPeerIds([...peerIds.filter((p) => p !== uid)]);
    });

    engine.addListener('JoinChannelSuccess', (channel, uid, elapsed) => {
      console.log('JoinChannelSuccess', channel, uid, elapsed);
      setJoinSucesseed(true);
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
    await engine.joinChannel(token, channelName, null, 0);
  };

  const endCall = async () => {
    try {
      await engine.leaveChannel();
    } catch (error) {
      console.log('Falha ao encerrar chamada', error);
    }
    setPeerIds([]);
    setJoinSucesseed(false);
  };

  const _renderRemoteVideos = () => {
    return (
      <ScrollView
        style={styles.remoteContainer}
        contentContainerStyle={{paddingHorizontal: 2.5}}
        horizontal={true}>
        {peerIds.map((value, index, array) => {
          return (
            // Set the rendering mode of the video view as Hidden,
            // which uniformly scales the video until it fills the visible boundaries.
            <RtcRemoteView.SurfaceView
              style={styles.remote}
              key={index}
              uid={value}
              channelId={channelName}
              renderMode={VideoRenderMode.Hidden}
              zOrderMediaOverlay={true}
            />
          );
        })}
      </ScrollView>
    );
  };

  const _renderVideos = () => {
    return joinSucceed ? (
      <View style={styles.fullView}>
        <Text>Video Conectado</Text>
        <RtcLocalView.SurfaceView
          style={styles.max}
          channelId={channelName}
          renderMode={VideoRenderMode.Hidden}
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
