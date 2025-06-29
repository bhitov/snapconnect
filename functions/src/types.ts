import type { TextMessage, TextMessageWithUserInfo } from './db';

export type RelationshipType = 'romantic' | 'platonic' | 'group';

export interface FetchedData {
  uid: string;
  coachCid: string;
  parentCid: string;
  displayName: string;
  username: string;
  relationshipType: RelationshipType;
  coachMessages?: TextMessage[];
  parentMessages?: TextMessageWithUserInfo[];
}
