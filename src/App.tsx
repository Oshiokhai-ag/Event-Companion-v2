// src/App.tsx
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, StyleSheet } from 'react-native';
import { RootNavigator } from './navigation/RootNavigator';

export default function App() {
  return (
    // ✅ FIX: GestureHandlerRootView wraps a RN View, not a <div>
    // style={{ flex: 1 }} ensures it fills the viewport
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        {/*
          ✅ FIX: The max-width mobile container is applied as a RN View style,
          not as a Tailwind class on a <div> — this keeps RN and DOM trees separate.
          The background and centering are achieved via StyleSheet below.
        */}
        <View style={styles.container}>
          <RootNavigator />
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#1A1E24', // obsidian — prevents white flash during load
    alignItems: 'center',        // center the mobile-width container on wide screens
  },
  container: {
    flex: 1,
    width: '100%',
    maxWidth: 448,               // ~max-w-md equivalent (28rem = 448px)
    backgroundColor: '#1A1E24', // obsidian
    overflow: 'hidden',
  },
});
