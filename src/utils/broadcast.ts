import { nanoid } from 'nanoid';

const tabId = nanoid();
const channel = new BroadcastChannel('flow-board-sync');

export interface BroadcastMessage {
  tabId: string;
  type: 'add' | 'update' | 'delete' | 'delete-all' | 'move';
  entity: 'board' | 'column' | 'card';
  payload: any;
  timestamp: number;
}

export const broadcastUpdate = (
  type: BroadcastMessage['type'],
  entity: BroadcastMessage['entity'],
  payload: any
) => {
  const message: BroadcastMessage = {
    tabId,
    type,
    entity,
    payload,
    timestamp: Date.now(),
  };
  channel.postMessage(message);
};

export const subscribeToUpdates = (handler: (msg: BroadcastMessage) => void) => {
  channel.onmessage = (event) => {
    const msg: BroadcastMessage = event.data;
    if (msg.tabId === tabId) return;
    handler(msg);
  };
  return () => (channel.onmessage = null);
};
