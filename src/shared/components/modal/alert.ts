/**
 * @file alert.ts
 * @description Alert utilities and monkey patching for custom modal system
 */

import { useModal } from './ModalContext';

/**
 * Hook to access the custom alert function
 * @returns {Object} Object containing the alert function
 */
export function useAlert() {
  const { show } = useModal();

  const alert = (
    title: string,
    message?: string,
    buttons?: {
      text?: string;
      onPress?: () => void;
      style?: 'default' | 'cancel' | 'destructive';
    }[]
  ) => {
    const modalConfig = {
      title,
      ...(message !== undefined && { message }),
      buttons: buttons || [{ text: 'OK' }],
    };
    show(modalConfig);
  };

  return { alert };
}

/**
 * Global alert function that can be used outside of React components
 * This will be set up after the ModalProvider is mounted
 */
export let globalAlert: typeof import('react-native').Alert.alert = () => {
  console.warn('Global alert called before ModalProvider is mounted');
};

export function setGlobalAlert(alertFn: typeof globalAlert) {
  globalAlert = alertFn;
}
