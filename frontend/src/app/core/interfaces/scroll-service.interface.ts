export interface IScrollService {
  requestScrollToTop(): void;
  savePosition(): void;
  restorePosition(): void;
  requestScrollToBottom(): void;
}