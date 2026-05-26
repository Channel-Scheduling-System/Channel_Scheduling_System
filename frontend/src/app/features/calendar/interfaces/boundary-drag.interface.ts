interface BoundaryDragState {
  type: 'start' | 'end';
  day: Date;
  originalSlotIndex: number;
  baseSlotIndex: number;
  currentSlotIndex: number;
  snapDone: boolean;
  initialOffsetPct: number;
  startY: number;
  cellHeightPx: number;
  pointerId?: number;
  pointerCaptureEl?: HTMLElement;
}