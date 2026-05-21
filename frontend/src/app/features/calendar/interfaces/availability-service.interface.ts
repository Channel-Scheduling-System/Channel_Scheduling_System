import { Observable } from "rxjs";
import { AvailabilityConfigParamsRequest } from "../models/requests/availability-params-request.model";
import { AvailabilityConfigResponse } from "../models/responses/availability-response.model";
import { UpdateWorkingHoursResponse } from "../models/responses/update-working-hours-response.model";
import { UpdateWorkingHoursRequest } from "../models/requests/update-working-hours-request.model";
import { SetTimeBlockResponse } from "../models/responses/set-time-off-response.model";
import { SetTimeBlockRequest } from "../models/requests/set-time-off-request.model";

export interface IAvailabilityService {
    updateWorkingHours(workerId: number, request: UpdateWorkingHoursRequest): Observable<UpdateWorkingHoursResponse>;
    setTimeBlock(workerId: number, request: SetTimeBlockRequest): Observable<SetTimeBlockResponse>;
    getAvailabilityConfig(workerId: number, params: AvailabilityConfigParamsRequest): Observable<AvailabilityConfigResponse>;
}