/**
 * @file ViewSnapScreen.tsx
 * @description Placeholder for view snap screen.
 * Will be implemented in Phase 2 with full functionality.
 */

import { View, Text } from 'react-native';

import { useTheme } from '../../hooks/useTheme';

export function ViewSnapScreen() {
  const theme = useTheme();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.black,
      }}
    >
      <Text
        style={{
          ...theme.typography.h2,
          color: theme.colors.white,
        }}
      >
        View Snap
      </Text>
      <Text
        style={{
          ...theme.typography.body,
          color: theme.colors.gray300,
        }}
      >
        Coming in Phase 2
      </Text>
    </View>
  );
}
