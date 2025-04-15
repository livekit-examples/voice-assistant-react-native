import { useRouter } from 'expo-router';
import { StyleSheet, Button, View } from 'react-native';

export default function StartScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Button
        onPress={() => router.navigate('../assistant')}
        title="Start Voice Assistant"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
