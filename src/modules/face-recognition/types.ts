
export interface DetectionEvent {
  entity_id: string;
  confidence: number;
}

export interface FaceMatch {
  label: string;
  distance: number;
}
