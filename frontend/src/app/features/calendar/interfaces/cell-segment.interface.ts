export interface SegmentGroup {
  kind: 'timeoff' | 'periodoff' | 'dayoff';
  id: number;
  fragmentId?: string;
}
export interface CellSegment {
  startPct: number;
  endPct: number;
  startMin: number;
  endMin: number;
  type: 'free' | 'non-working' | 'timeoff' | 'periodoff' | 'dayoff';
  reason?: string;
  blockStartMin?: number;
  blockEndMin?: number;
  group?: SegmentGroup;
  isGroupStart?: boolean;
  isGroupEnd?: boolean;
  isFragmentStart?: boolean;
  isFragmentEnd?: boolean;
  isUpperBoundaryEdge?: boolean;
  isLowerBoundaryEdge?: boolean;
}