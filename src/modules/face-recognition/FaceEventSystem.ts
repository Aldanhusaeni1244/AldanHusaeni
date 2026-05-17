
import { MemberDetectedEvent } from './types';

export const FaceEvents = {
  emit: (data: MemberDetectedEvent) => {
    const event = new CustomEvent('member_detected', { detail: data });
    window.dispatchEvent(event);
  },
  subscribe: (callback: (data: MemberDetectedEvent) => void) => {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<MemberDetectedEvent>;
      callback(customEvent.detail);
    };
    window.addEventListener('member_detected', handler);
    return () => window.removeEventListener('member_detected', handler);
  }
};
