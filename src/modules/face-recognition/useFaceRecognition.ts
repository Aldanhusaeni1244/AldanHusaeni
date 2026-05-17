
import { useEffect } from 'react';
import { FaceEvents } from './FaceEventSystem';
import { Customer } from '../../../types';

export const useFaceRecognition = (customers: Customer[], onFound: (c: Customer) => void) => {
  useEffect(() => {
    const unsubscribe = FaceEvents.subscribe((data) => {
      const member = customers.find(c => c.id === data.member_id);
      if (member) {
        onFound(member);
      }
    });
    return unsubscribe;
  }, [customers, onFound]);
};
