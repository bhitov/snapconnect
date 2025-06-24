/**
 * @file App.tsx
 * @description Main application entry point for SnapConnect.
 * Sets up providers, navigation, and global app configuration.
 * 
 * @example
 * ```tsx
 * // This is the root component - no direct usage
 * ```
 */

import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

/**
 * Main application component
 * 
 * @returns {JSX.Element} The root application component
 */
export default function App(): JSX.Element {
  console.log('🚀 SnapConnect App starting...');
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>SnapConnect</Text>
      <Text style={styles.subtitle}>Phase 1.1 - Project Initialization Complete!</Text>
      <Text style={styles.description}>
        Expo 53 • TypeScript • React Native
      </Text>
      <StatusBar style="auto" />
    </View>
  );
}

/**
 * Component styles
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFC00', // Snapchat yellow
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 20,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
  },
}); 