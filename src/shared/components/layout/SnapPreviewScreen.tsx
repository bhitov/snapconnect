/**
 * @file SnapPreviewScreen.tsx
 * @description Placeholder for snap preview screen.
 * Will be implemented in Phase 2 with full functionality.
 */

import { View, Text } from 'react-native';

import { useTheme } from '../../hooks/useTheme';

export function SnapPreviewScreen() {
  const theme = useTheme();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
      }}
    >
      <Text
        style={{
          ...theme.typography.h2,
          color: theme.colors.textPrimary,
        }}
      >
        Snap Preview
      </Text>
      <Text
        style={{
          ...theme.typography.body,
          color: theme.colors.textSecondary,
        }}
      >
        Coming in Phase 2
      </Text>
    </View>
  );
}
