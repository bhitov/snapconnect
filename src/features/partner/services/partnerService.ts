import { database as db } from '../../../shared/services/firebase/config';
import { ref, push, set, get, update, query, orderByChild, equalTo, serverTimestamp } from 'firebase/database';
import { PartnerRequest } from '../types/partnerTypes';

export const partnerService = {
  async sendPartnerRequest(senderId: string, receiverId: string): Promise<string> {
    const requestData = {
      senderId,
      receiverId,
      status: 'pending',
      createdAt: Date.now()
    };

    const newRequestRef = push(ref(db, 'partnerRequests'));
    await set(newRequestRef, { ...requestData, id: newRequestRef.key });
    
    return newRequestRef.key!;
  },

  async getPartnerRequests(userId: string): Promise<PartnerRequest[]> {
    const sentQuery = query(ref(db, 'partnerRequests'), orderByChild('senderId'), equalTo(userId));
    const receivedQuery = query(ref(db, 'partnerRequests'), orderByChild('receiverId'), equalTo(userId));

    const [sentSnapshot, receivedSnapshot] = await Promise.all([
      get(sentQuery),
      get(receivedQuery)
    ]);

    const requests: PartnerRequest[] = [];

    if (sentSnapshot.exists()) {
      Object.values(sentSnapshot.val()).forEach(request => {
        requests.push(request as PartnerRequest);
      });
    }

    if (receivedSnapshot.exists()) {
      Object.values(receivedSnapshot.val()).forEach(request => {
        requests.push(request as PartnerRequest);
      });
    }

    return requests.filter(req => req.status === 'pending');
  },

  async acceptPartnerRequest(requestId: string, senderId: string, receiverId: string): Promise<void> {
    const updates: Record<string, any> = {
      [`partnerRequests/${requestId}/status`]: 'accepted',
      [`users/${senderId}/partnerId`]: receiverId,
      [`users/${receiverId}/partnerId`]: senderId
    };

    await update(ref(db), updates);
  },

  async rejectPartnerRequest(requestId: string): Promise<void> {
    await update(ref(db, `partnerRequests/${requestId}`), {
      status: 'rejected'
    });
  },

  async cancelPartnerRequest(requestId: string): Promise<void> {
    await update(ref(db, `partnerRequests/${requestId}`), {
      status: 'cancelled'
    });
  },

  async breakPartnership(user1Id: string, user2Id: string): Promise<void> {
    const updates: Record<string, any> = {
      [`users/${user1Id}/partnerId`]: null,
      [`users/${user2Id}/partnerId`]: null
    };

    await update(ref(db), updates);
  },

  async hasActivePartnerRequest(userId: string): Promise<boolean> {
    const requests = await this.getPartnerRequests(userId);
    return requests.some(req => req.status === 'pending' && (req.senderId === userId || req.receiverId === userId));
  }
};