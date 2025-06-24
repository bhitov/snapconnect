/**
 * @file types.ts
 * @description Navigation type definitions for SnapConnect.
 * Provides type-safe navigation throughout the application.
 */

// Helper types for navigation props
import type { NavigationProp, RouteProp } from '@react-navigation/native';

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  SnapPreview: {
    uri: string;
    type: 'photo' | 'video';
  };
  RecipientSelection: {
    mediaUri: string;
    mediaType: 'photo' | 'video';
    textOverlay?: string;
  };
  ViewSnap: {
    snapId: string;
  };
  Profile: {
    userId?: string;
  };
  CreateGroup: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ProfileSetup: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Chats: undefined;
  Camera: undefined;
  Friends: undefined;
  Stories: undefined;
};

export type ChatStackParamList = {
  ChatsList: undefined;
  ChatScreen: {
    conversationId: string;
    otherUser: {
      uid: string;
      username: string;
      displayName: string;
      photoURL?: string;
    };
  };
};

export type FriendsStackParamList = {
  FriendsList: undefined;
  AddFriends: undefined;
  FriendRequests: undefined;
  Profile: {
    userId?: string;
  };
};

export type StoriesStackParamList = {
  StoriesList: undefined;
  ViewStory: {
    userId: string;
    storyId: string;
  };
  CreateStory: {
    mediaUri: string;
    mediaType: 'photo' | 'video';
  };
};

export type StackNavigationProps<
  ParamList extends Record<string, object | undefined>,
  RouteName extends keyof ParamList = keyof ParamList,
> = {
  navigation: NavigationProp<ParamList, RouteName>;
  route: RouteProp<ParamList, RouteName>;
};

// Module declaration for React Navigation type safety
declare module '@react-navigation/native' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface RootParamList extends RootStackParamList {}
}
