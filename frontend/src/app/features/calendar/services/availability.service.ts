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
import { SetTimeOffRequest } from "../models/requests/set-time-off-request.model";
import { SetTimeOffResponse, SetTimeOffResponseSchema } from "../models/responses/set-time-off-response.model";
import { SetDayOffRequest } from "../models/requests/set-day-off-request.model";
import { SetDayOffResponse, SetDayOffResponseSchema } from "../models/responses/set-day-off-response.model";
import { SetPeriodOffRequest } from "../models/requests/set-period-off-request.model";
import { SetPeriodOffResponse, SetPeriodOffResponseSchema } from "../models/responses/set-period-off-response.model";
import { DeleteBlockResponse, DeleteBlockResponseSchema } from "../models/responses/delete-block-response.model";
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
    public setDayOff(workerId: number, request: SetDayOffRequest): Observable<SetDayOffResponse> {
        return this.http
            .post(API_ENDPOINTS.CALENDAR.SET_DAY_OFF(workerId), request)
            .pipe(
                map(response =>
                    this.responseHandler.handleSuccess(response, SetDayOffResponseSchema)
                )
            );
    }
    public setTimeOff(workerId: number, request: SetTimeOffRequest): Observable<SetTimeOffResponse> {
        return this.http
            .post(API_ENDPOINTS.CALENDAR.SET_TIME_OFF(workerId), request)
            .pipe(
                map(response =>
                    this.responseHandler.handleSuccess(response, SetTimeOffResponseSchema)
                )
            );
    }
    public setPeriodOff(workerId: number, request: SetPeriodOffRequest): Observable<SetPeriodOffResponse> {
        return this.http
            .post(API_ENDPOINTS.CALENDAR.SET_PERIOD_OFF(workerId), request)
            .pipe(
                map(response =>
                    this.responseHandler.handleSuccess(response, SetPeriodOffResponseSchema)
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
    deleteBlock(blockId: number): Observable<DeleteBlockResponse> {
        return this.http
            .delete(API_ENDPOINTS.CALENDAR.DELETE_BLOCK(blockId))
            .pipe(
                map(response =>
                    this.responseHandler.handleSuccess(response, DeleteBlockResponseSchema)
                )
            );
    }
}