import { Observable } from "rxjs";
import { AvailabilityConfigParamsRequest } from "../models/requests/availability-params-request.model";
import { AvailabilityConfigResponse } from "../models/responses/availability-response.model";

export interface IAvailabilityService {
    getAvailabilityConfig(workerId: number, params: AvailabilityConfigParamsRequest): Observable<AvailabilityConfigResponse>;
}