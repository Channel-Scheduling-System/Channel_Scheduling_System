import { Injectable } from "@angular/core";
import { AvailabilityConfigResponse, availabilityConfigResponseSchema } from "../models/responses/availability-response.model";
import { map } from "rxjs/internal/operators/map";
import { AvailabilityConfigParamsRequest } from "../models/requests/availability-params-request.model";
import { buildAvailabilityConfigHttpParams } from "../utils/availability-params.util";
import { Observable } from "rxjs";
import { API_ENDPOINTS } from "../../../shared/constants/api-endpoints.constants";
import { ResponseHandler } from "../../../core/utils/handlers/response.handler";
import { HttpClient } from "@angular/common/http";
import { IAvailabilityService } from "../interfaces/availability-service.interface";
import { UpdateWorkingHoursRequest } from "../models/requests/update-working-hours-request.model";
import { UpdateWorkingHoursResponse, UpdateWorkingHoursResponseSchema } from "../models/responses/update-working-hours-response.model";

@Injectable({ providedIn: 'root' })
export class AvailabilityService implements IAvailabilityService {

    constructor(
        private http: HttpClient,
        private responseHandler: ResponseHandler
    ) { }
    public updateWorkingHours(workerId: number, request: UpdateWorkingHoursRequest): Observable<UpdateWorkingHoursResponse> {
        return this.http
            .put(API_ENDPOINTS.CALENDAR.UPDATE_WORKING_HOURS(workerId), request)
            .pipe(
                map(response =>
                    this.responseHandler.handleSuccess(response, UpdateWorkingHoursResponseSchema)
                )
            );
    }

    public getAvailabilityConfig(
        workerId: number,
        params: AvailabilityConfigParamsRequest
    ): Observable<AvailabilityConfigResponse> {
        const httpParams = buildAvailabilityConfigHttpParams(params);
        return this.http
            .get(API_ENDPOINTS.CALENDAR.AVAILABILITY_CONFIG(workerId), { params: httpParams })
            .pipe(
                map(response =>
                    this.responseHandler.handleSuccess(response, availabilityConfigResponseSchema)
                )
            );
    }
}