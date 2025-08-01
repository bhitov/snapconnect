/**
 * @file types.ts
 * @description Navigation type definitions for SnapConnect.
 * Provides type-safe navigation throughout the application.
 */

// Helper types for navigation props
import type { NavigationProp, RouteProp } from '@react-navigation/native';

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined | { screen?: keyof MainTabParamList };
  SnapPreview: {
    uri: string;
    type: 'photo';
  };
  RecipientSelection: {
    mediaUri: string;
    mediaType: 'photo';
    textOverlay?: string;
  };
  ViewSnap: {
    snapId: string;
  };
  Profile: {
    userId?: string;
  };
  ProfileSettings: undefined;
  CreateGroup: undefined;
  GroupInfo: {
    groupId: string;
  };
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ProfileSetup: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Chats:
    | undefined
    | {
        screen: keyof ChatStackParamList;
        params?: ChatStackParamList[keyof ChatStackParamList];
      };
  Camera: undefined;
  Friends: undefined;
  Stories: undefined;
  Groups: undefined;
};

export type ChatStackParamList = {
  ChatsList: undefined;
  ChatScreen: {
    conversationId: string;
    otherUser?: {
      uid: string;
      username: string;
      displayName: string;
      photoURL?: string;
    };
    // Group chat params
    isGroup?: boolean;
    groupTitle?: string;
    groupId?: string;
    // Coach-specific params
    isCoach?: boolean;
    parentCid?: string;
    coachChatId?: string;
  };
};

export type FriendsStackParamList = {
  FriendsList: undefined;
  AddFriends: undefined;
  FriendRequests:
    | {
        initialTab?: 'received' | 'sent' | 'partner';
      }
    | undefined;
  AddPartner: undefined;
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
    mediaType: 'photo';
  };
};

export type GroupsStackParamList = {
  GroupsList: undefined;
  CreateGroup: undefined;
  GroupInfo: {
    groupId: string;
  };
  ManageGroupMembers: {
    groupId: string;
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
