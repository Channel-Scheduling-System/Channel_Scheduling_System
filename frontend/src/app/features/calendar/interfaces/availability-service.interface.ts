import { Observable } from "rxjs";
import { AvailabilityConfigParamsRequest } from "../models/requests/availability-params-request.model";
import { AvailabilityConfigResponse } from "../models/responses/availability-response.model";
import { WorkerAvailabilityParamsRequest } from "../models/requests/worker-availability-params-request.model";
import { WorkerAvailabilityResponse } from "../models/responses/worker-availability-response.model";
import { UpdateWorkingHoursResponse } from "../models/responses/update-working-hours-response.model";
import { UpdateWorkingHoursRequest } from "../models/requests/update-working-hours-request.model";
import { SetTimeOffResponse } from "../models/responses/set-time-off-response.model";
import { SetTimeOffRequest } from "../models/requests/set-time-off-request.model";
import { SetDayOffRequest } from "../models/requests/set-day-off-request.model";
import { SetDayOffResponse } from "../models/responses/set-day-off-response.model";
import { SetPeriodOffRequest } from "../models/requests/set-period-off-request.model";
import { SetPeriodOffResponse } from "../models/responses/set-period-off-response.model";
import { DeleteBlockResponse } from "../models/responses/delete-block-response.model";
export interface IAvailabilityService {
    updateWorkingHours(workerId: number, request: UpdateWorkingHoursRequest): Observable<UpdateWorkingHoursResponse>;
    setDayOff(workerId: number, request: SetDayOffRequest): Observable<SetDayOffResponse>;
    setTimeOff(workerId: number, request: SetTimeOffRequest): Observable<SetTimeOffResponse>;
    setPeriodOff(workerId: number, request: SetPeriodOffRequest): Observable<SetPeriodOffResponse>;
    getAvailabilityConfig(workerId: number, params: AvailabilityConfigParamsRequest): Observable<AvailabilityConfigResponse>;
    getWorkerAvailability(workerId: number, params: WorkerAvailabilityParamsRequest): Observable<WorkerAvailabilityResponse>;
    deleteBlock(blockId: number): Observable<DeleteBlockResponse>;
}