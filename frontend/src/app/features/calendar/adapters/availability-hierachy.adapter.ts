import { Injectable } from '@angular/core';
import { IRange, RawTimeBlock, ResolvedTimeBlock } from '../interfaces/availability.interface';
import { RawResolved } from '../types/raw.types';
import { subtractRanges } from '../utils/time.util';
@Injectable()
export class AvailabilityHierarchyAdapter {
    resolveTimeBlocks(
        specifics: RawTimeBlock[],
        recurrings: RawTimeBlock[],
        jornadaStartMin: number,
        jornadaEndMin: number
    ): ResolvedTimeBlock[] {
        const sortedSpec = [...specifics].sort((a, b) => a.startMin - b.startMin || a.id - b.id);
        const sortedRec = [...recurrings].sort((a, b) => a.startMin - b.startMin || a.id - b.id);
        const specClaimed: IRange[] = [];
        const raw: RawResolved[] = [];
        for (const s of sortedSpec) {
            const start = Math.max(s.startMin, jornadaStartMin);
            const end = Math.min(s.endMin, jornadaEndMin);
            if (start >= end) continue;
            for (const frag of subtractRanges({ start, end }, specClaimed)) {
                raw.push({ startMin: frag.start, endMin: frag.end, id: s.id, groupId: s.id, reason: s.reason, kind: 'specific' });
                specClaimed.push(frag);
            }
        }
        const recClaimed: IRange[] = [];
        for (const r of sortedRec) {
            const start = Math.max(r.startMin, jornadaStartMin);
            const end = Math.min(r.endMin, jornadaEndMin);
            if (start >= end) continue;
            const occupied = [...specClaimed, ...recClaimed];
            for (const frag of subtractRanges({ start, end }, occupied)) {
                raw.push({ startMin: frag.start, endMin: frag.end, id: r.id, groupId: r.id, reason: r.reason, kind: 'recurring' });
                recClaimed.push(frag);
            }
        }
        raw.sort((a, b) => a.startMin - b.startMin);
        const byGroup = new Map<number, RawResolved[]>();
        for (const b of raw) {
            const arr = byGroup.get(b.groupId) ?? [];
            arr.push(b);
            byGroup.set(b.groupId, arr);
        }
        return raw.map(b => {
            const frags = byGroup.get(b.groupId)!;
            const fragmentIndex = frags.indexOf(b);
            const fragmentId = `${b.groupId}-frag${fragmentIndex}`;
            return { ...b, fragmentId, isGroupStart: frags[0] === b, isGroupEnd: frags[frags.length - 1] === b };
        });
    }
}