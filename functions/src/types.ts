import type { TextMessage, TextMessageWithUserInfo } from "./db";

export interface FetchedData {
  uid: string;
  coachCid: string;
  parentCid: string;
  displayName: string;
  username: string;
  coachMessages?: TextMessage[];
  parentMessages?: TextMessageWithUserInfo[];
}
