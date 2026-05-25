import { ResolvedTimeBlock } from "../interfaces/availability.interface";
export type RawResolved = Omit<ResolvedTimeBlock, 'isGroupStart' | 'isGroupEnd' | 'fragmentId'>;