
import { useEffect } from 'react';
import { FaceEvents } from './FaceEventSystem';
import { Employee } from '../../../types';

export const useFaceRecognition = (employees: Employee[], onFound: (e: Employee) => void) => {
  useEffect(() => {
    const unsubscribe = FaceEvents.subscribe((data) => {
      const employee = employees.find(e => e.id === data.entity_id);
      if (employee) {
        onFound(employee);
      }
    });
    return unsubscribe;
  }, [employees, onFound]);
};
