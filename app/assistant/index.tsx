import {
  StyleSheet,
  View,
  Text,
  useColorScheme,
  Image,
  Pressable,
  ScrollView,
} from 'react-native';

import React, { useEffect } from 'react';
import {
  AudioSession,
  BarVisualizer,
  LiveKitRoom,
  useIOSAudioManagement,
  useLocalParticipant,
  useParticipantTracks,
  useRoomContext,
  useTrackTranscription,
  useVoiceAssistant,
} from '@livekit/react-native';
import { useConnectionDetails } from '@/hooks/useConnectionDetails';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Track } from 'livekit-client';
import { useRouter } from 'expo-router';

export default function AssistantScreen() {
  // Start the audio session first.
  useEffect(() => {
    let start = async () => {
      await AudioSession.startAudioSession();
    };

    start();
    return () => {
      AudioSession.stopAudioSession();
    };
  }, []);

  const connectionDetails = useConnectionDetails();

  return (
    <SafeAreaView>
      <LiveKitRoom
        serverUrl={connectionDetails?.url}
        token={connectionDetails?.token}
        connect={true}
        audio={true}
        video={false}
      >
        <RoomView />
      </LiveKitRoom>
    </SafeAreaView>
  );
}

const RoomView = () => {
  const router = useRouter();

  const room = useRoomContext();
  useIOSAudioManagement(room, true);

  const { isMicrophoneEnabled, localParticipant } = useLocalParticipant();

  // Transcriptions
  const localTracks = useParticipantTracks(
    [Track.Source.Microphone],
    localParticipant.identity
  );
  const { segments: userTranscriptions } = useTrackTranscription(
    localTracks[0]
  );

  const { agentTranscriptions } = useVoiceAssistant();

  const lastUserTranscription = (
    userTranscriptions.length > 0
      ? userTranscriptions[userTranscriptions.length - 1].text
      : ''
  ) as string;
  const lastAgentTranscription = (
    agentTranscriptions.length > 0
      ? agentTranscriptions[agentTranscriptions.length - 1].text
      : ''
  ) as string;

  // Controls
  var micImage = isMicrophoneEnabled
    ? require('../../assets/images/baseline_mic_white_24dp.png')
    : require('../../assets/images/baseline_mic_off_white_24dp.png');

  var exitImage = require('../../assets/images/close_white_24dp.png');

  return (
    <View style={styles.container}>
      <SimpleVoiceAssistant />
      <ScrollView style={styles.logContainer}>
        <UserTranscriptionText text={lastUserTranscription} />
        <AgentTranscriptionText text={lastAgentTranscription} />
      </ScrollView>

      <View style={styles.controlsContainer}>
        <Pressable
          style={({ pressed }) => [
            { backgroundColor: pressed ? 'rgb(210, 230, 255)' : '#007DFF' },
            styles.button,
          ]}
          onPress={() => {
            localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled);
          }}
        >
          <Image style={styles.icon} source={micImage} />
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            {
              backgroundColor: pressed ? 'rgb(210, 230, 255)' : '#FF0000',
            },
            styles.button,
          ]}
          onPress={() => {
            router.back();
          }}
        >
          <Image style={styles.icon} source={exitImage} />
        </Pressable>
      </View>
    </View>
  );
};

const UserTranscriptionText = (props: { text: string }) => {
  let { text } = props;
  const colorScheme = useColorScheme();
  const themeStyle =
    colorScheme === 'light'
      ? styles.userTranscriptionLight
      : styles.userTranscriptionDark;
  const themeTextStyle =
    colorScheme === 'light' ? styles.lightThemeText : styles.darkThemeText;

  return (
    text && (
      <View style={styles.userTranscriptionContainer}>
        <Text style={[styles.userTranscription, themeStyle, themeTextStyle]}>
          {text}
        </Text>
      </View>
    )
  );
};

const AgentTranscriptionText = (props: { text: string }) => {
  let { text } = props;
  const colorScheme = useColorScheme();
  const themeTextStyle =
    colorScheme === 'light' ? styles.lightThemeText : styles.darkThemeText;
  return (
    text && (
      <Text style={[styles.agentTranscription, themeTextStyle]}>{text}</Text>
    )
  );
};

const SimpleVoiceAssistant = () => {
  const { state, audioTrack } = useVoiceAssistant();
  return (
    <BarVisualizer
      state={state}
      barCount={7}
      options={{
        minHeight: 0.5,
      }}
      trackRef={audioTrack}
      style={styles.voiceAssistant}
    />
  );
};
const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
  },
  voiceAssistant: {
    width: '100%',
    height: 100,
  },
  logContainer: {
    width: '100%',
    flex: 1,
    flexDirection: 'column',
  },
  controlsContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  button: {
    width: 60,
    height: 60,
    padding: 10,
    margin: 12,
    borderRadius: 30,
  },
  icon: {
    width: 40,
    height: 40,
  },
  userTranscriptionContainer: {
    width: '100%',
    alignContent: 'flex-end',
  },
  userTranscription: {
    width: 'auto',
    fontSize: 18,
    alignSelf: 'flex-end',
    borderRadius: 6,
    padding: 8,
    margin: 16,
  },
  userTranscriptionLight: {
    backgroundColor: '#B0B0B0',
  },
  userTranscriptionDark: {
    backgroundColor: '#404040',
  },

  agentTranscription: {
    fontSize: 20,
    textAlign: 'left',
    margin: 16,
  },
  lightThemeText: {
    color: '#000000',
  },
  darkThemeText: {
    color: '#FFFFFF',
  },
});
