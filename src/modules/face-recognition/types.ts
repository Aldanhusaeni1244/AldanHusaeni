
export interface MemberDetectedEvent {
  member_id: string;
  confidence: number;
}

export interface FaceMatch {
  label: string;
  distance: number;
}
