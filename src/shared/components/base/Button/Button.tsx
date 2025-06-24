/**
 * @file Button.tsx
 * @description Primary button component with multiple variants and states.
 * Supports loading, disabled, and pressed states with proper accessibility.
 * 
 * @example
 * ```tsx
 * <Button 
 *   variant="primary" 
 *   onPress={handleSubmit}
 *   loading={isSubmitting}
 * >
 *   Submit
 * </Button>
 * ```
 */

import { memo, useCallback } from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';

import { useTheme } from '../../../hooks/useTheme';

export interface ButtonProps {
  /** Button content */
  children: string;
  /** Press handler */
  onPress?: () => void;
  /** Button visual variant */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  /** Button size */
  size?: 'small' | 'medium' | 'large';
  /** Loading state */
  loading?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Test ID for testing */
  testID?: string;
  /** Full width button */
  fullWidth?: boolean;
}

const ANIMATION_CONFIG = {
  damping: 15,
  stiffness: 150,
};

/**
 * Primary button component for user actions
 * 
 * @param {ButtonProps} props - Component props
 */
export const Button = memo<ButtonProps>(({
  children,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  testID,
  fullWidth = false,
  ...rest
}) => {
  const theme = useTheme();
  
  /**
   * Handle button press with animation
   */
  const handlePress = useCallback(() => {
    if (!loading && !disabled) {
      onPress?.();
    }
  }, [loading, disabled, onPress]);
  
  // Animation for press feedback
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(disabled ? 0.95 : 1, ANIMATION_CONFIG) }],
  }));
  
  const styles = StyleSheet.create({
    container: {
      borderRadius: theme.borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      width: fullWidth ? '100%' : undefined,
      // Size-based padding
      paddingVertical: size === 'small' ? theme.spacing[2] : 
                      size === 'large' ? theme.spacing[5] : theme.spacing[3],
      paddingHorizontal: size === 'small' ? theme.spacing[4] : 
                        size === 'large' ? theme.spacing[8] : theme.spacing[6],
    },
    
    // Variant styles
    primary: {
      backgroundColor: disabled ? theme.colors.gray300 : theme.colors.primary,
      ...theme.shadows.sm,
    },
    secondary: {
      backgroundColor: disabled ? theme.colors.gray200 : theme.colors.secondary,
      ...theme.shadows.sm,
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: disabled ? theme.colors.gray300 : theme.colors.primary,
    },
    ghost: {
      backgroundColor: 'transparent',
    },
    
    // Text styles
    text: {
      ...theme.typography.button,
      textAlign: 'center',
    },
    primaryText: {
      color: disabled ? theme.colors.gray500 : theme.colors.black,
    },
    secondaryText: {
      color: disabled ? theme.colors.gray500 : theme.colors.white,
    },
    outlineText: {
      color: disabled ? theme.colors.gray400 : theme.colors.primary,
    },
    ghostText: {
      color: disabled ? theme.colors.gray400 : theme.colors.textPrimary,
    },
    
    // Size-based text
    smallText: {
      ...theme.typography.buttonSmall,
    },
    largeText: {
      ...theme.typography.buttonLarge,
    },
    
    disabled: {
      opacity: 0.6,
    },
  });
  
  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        style={[
          styles.container,
          styles[variant],
          disabled && styles.disabled,
        ]}
        onPress={handlePress}
        disabled={disabled || loading}
        activeOpacity={0.8}
        testID={testID}
        accessible
        accessibilityRole="button"
        accessibilityState={{ disabled: disabled || loading }}
        {...rest}
      >
        {loading ? (
          <ActivityIndicator 
            color={variant === 'primary' ? theme.colors.black : 
                   variant === 'secondary' ? theme.colors.white : 
                   theme.colors.primary} 
            size="small"
          />
        ) : (
          <Text style={[
            styles.text,
            styles[`${variant}Text`],
            size === 'small' && styles.smallText,
            size === 'large' && styles.largeText,
          ]}>
            {children}
          </Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
});

Button.displayName = 'Button'; 