/**
 * @file types.ts
 * @description Navigation type definitions for SnapConnect.
 * Provides type-safe navigation throughout the application.
 */

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  SnapPreview: {
    uri: string;
    type: 'photo' | 'video';
  };
  ViewSnap: {
    snapId: string;
  };
  Profile: {
    userId?: string;
  };
  AddFriends: undefined;
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
  Stories: undefined;
};

export type ChatStackParamList = {
  ChatsList: undefined;
  Chat: {
    userId: string;
    username: string;
  };
  FriendRequests: undefined;
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

// Helper types for navigation props
export type StackNavigationProps<
  ParamList extends Record<string, object | undefined>,
  RouteName extends keyof ParamList = keyof ParamList
> = {
  navigation: any; // Will be properly typed with navigation library
  route: {
    params: ParamList[RouteName];
  };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
} 