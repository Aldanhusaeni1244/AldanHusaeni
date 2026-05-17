
import { DetectionEvent } from './types';

export const FaceEvents = {
  emit: (data: DetectionEvent) => {
    const event = new CustomEvent('entity_detected', { detail: data });
    window.dispatchEvent(event);
  },
  subscribe: (callback: (data: DetectionEvent) => void) => {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<DetectionEvent>;
      callback(customEvent.detail);
    };
    window.addEventListener('entity_detected', handler);
    return () => window.removeEventListener('entity_detected', handler);
  }
};
