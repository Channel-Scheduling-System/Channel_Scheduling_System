export interface RawTimeBlock {
    id: number;
    startMin: number;
    endMin: number;
    reason?: string;
    kind: 'specific' | 'recurring';
}
export interface ResolvedTimeBlock {
    startMin: number;
    endMin: number;
    id: number;
    groupId: number;
    fragmentId: string;
    reason?: string;
    kind: 'specific' | 'recurring';
    isGroupStart: boolean;
    isGroupEnd: boolean;
}
export interface IRange { start: number; end: number; }