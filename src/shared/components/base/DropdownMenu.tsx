/**
 * @file DropdownMenu.tsx
 * @description Reusable dropdown menu component for action menus
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useTheme } from '@/shared/hooks/useTheme';

export interface DropdownMenuItem {
  id: string;
  title: string;
  onPress: () => void;
}

interface DropdownMenuProps {
  title: string;
  items: DropdownMenuItem[];
  triggerComponent: React.ReactNode;
}

export function DropdownMenu({ title, items, triggerComponent }: DropdownMenuProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [buttonLayout, setButtonLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const buttonRef = useRef<View>(null);
  const theme = useTheme();

  const handleTriggerPress = () => {
    if (buttonRef.current) {
      buttonRef.current.measure((fx, fy, width, height, px, py) => {
        setButtonLayout({ x: px, y: py, width, height });
        setIsVisible(true);
      });
    }
  };

  const handleItemPress = (item: DropdownMenuItem) => {
    setIsVisible(false);
    item.onPress();
  };

  const screenWidth = Dimensions.get('window').width;
  const dropdownWidth = 200;
  const rightMargin = 16;
  
  // Position dropdown to the right of the button, accounting for screen bounds
  const dropdownX = Math.min(
    buttonLayout.x + buttonLayout.width - dropdownWidth,
    screenWidth - dropdownWidth - rightMargin
  );

  return (
    <>
      <TouchableOpacity
        ref={buttonRef}
        onPress={handleTriggerPress}
        activeOpacity={0.7}
      >
        {triggerComponent}
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsVisible(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setIsVisible(false)}
        >
          <View
            style={[
              styles.dropdown,
              {
                backgroundColor: theme.colors.background,
                borderColor: theme.colors.border || '#e0e0e0',
                top: buttonLayout.y + buttonLayout.height + 8,
                left: dropdownX,
              },
            ]}
          >
            <Text
              style={[
                styles.title,
                { color: theme.colors.textSecondary },
              ]}
            >
              {title}
            </Text>
            {items.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.item,
                  index < items.length - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: theme.colors.border || '#f0f0f0',
                  },
                ]}
                onPress={() => handleItemPress(item)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.itemText,
                    { color: theme.colors.text },
                  ]}
                >
                  {item.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  dropdown: {
    position: 'absolute',
    width: 200,
    borderRadius: 8,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    paddingVertical: 8,
    letterSpacing: 0.5,
  },
  item: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  itemText: {
    fontSize: 16,
    fontWeight: '500',
  },
});