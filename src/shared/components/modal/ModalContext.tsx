/**
 * @file ModalContext.tsx
 * @description Modal context provider for centralized alert/modal management
 * Provides a custom modal system that can replace React Native's Alert.alert
 */

import React, { createContext, useState, useContext, useCallback } from 'react';
import { Alert as RNAlert } from 'react-native';

import { CustomAlertModal } from './CustomAlertModal';

import type { AlertButton, AlertOptions } from 'react-native';

export interface ModalConfig {
  title?: string;
  message?: string;
  buttons?: AlertButton[];
  options?: AlertOptions;
}

interface ModalContextValue {
  show: (config: ModalConfig) => void;
  hide: () => void;
}

const ModalContext = createContext<ModalContextValue>({
  show: () => {},
  hide: () => {},
});

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

export interface ModalProviderProps {
  children: React.ReactNode;
}

export function ModalProvider({ children }: ModalProviderProps) {
  const [currentModal, setCurrentModal] = useState<ModalConfig | null>(null);

  const show = useCallback((config: ModalConfig) => {
    setCurrentModal(config);
  }, []);

  const hide = useCallback(() => {
    setCurrentModal(null);
  }, []);

  return (
    <ModalContext.Provider value={{ show, hide }}>
      {children}
      {currentModal && <CustomAlertModal {...currentModal} onDismiss={hide} />}
    </ModalContext.Provider>
  );
}

// Global reference for monkey patching
let globalShow: ((config: ModalConfig) => void) | null = null;

export function setGlobalShow(show: (config: ModalConfig) => void) {
  globalShow = show;
}

export function getGlobalShow() {
  return globalShow;
}

/**
 * Monkey patch Alert.alert to use our custom modal system
 */
export function patchAlert() {
  const originalAlert = RNAlert.alert.bind(RNAlert);

  RNAlert.alert = (
    title: string,
    message?: string,
    buttons?: AlertButton[],
    options?: AlertOptions
  ) => {
    const show = getGlobalShow();

    if (show) {
      // Use our custom modal
      const modalConfig: ModalConfig = {
        title,
        ...(message !== undefined && { message }),
        buttons: buttons || [{ text: 'OK' }],
        ...(options !== undefined && { options }),
      };
      show(modalConfig);
    } else {
      // Fallback to native alert
      originalAlert(title, message, buttons, options);
    }
  };
}

/**
 * Restore original Alert.alert (useful for testing)
 */
export function unpatchAlert() {
  // React Native doesn't provide a way to restore the original
  // In practice, you'd rarely need this
  console.warn('Alert.alert restoration not implemented');
}
