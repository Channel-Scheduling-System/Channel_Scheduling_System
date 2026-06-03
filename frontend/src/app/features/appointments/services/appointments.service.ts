import { map, Observable } from "rxjs";
import { IAppointmentsService } from "../interfaces/appointment-service.interface";
import { AppointmentsParamsHistoryRequest, AppointmentsActiveParamsRequest, GetQuantityStatusAppointmentsParamsRequest } from "../models/requests/appointments-params-request.model";
import { VerifyOverlapRequest, CreateAppointmentRequest } from "../models/requests/create-appointment-request.model";
import { UpdateAppointmentRequest, RescheduleAppointmentRequest } from "../models/requests/update-appointment-request.model";
import {
    AppointmentsListHistoryResponse,
    AppointmentsListHistoryResponseSchema,
    AppointmentsListActiveResponse,
    AppointmentsListActiveResponseSchema
} from "../models/responses/appointments-list-response.model";
import { VerifyOverlapResponse, CreateAppointmentResponse, VerifyOverlapResponseSchema, CreateAppointmentResponseSchema } from "../models/responses/create-appointment-response";
import { ApproveAppointmentResponse, RejectAppointmentResponse, CancelAppointmentResponse, ApproveAppointmentResponseSchema, RejectAppointmentResponseSchema, CancelAppointmentResponseSchema, SetAppointmentStateResponse, SetAppointmentStateResponseSchema } from "../models/responses/manage-appointment-state-response.model";
import { UpdateAppointmentResponse, RescheduleAppointmentResponse, UpdateAppointmentResponseSchema, RescheduleAppointmentResponseSchema } from "../models/responses/update-appointment-response.model";
import { Injectable } from "@angular/core";
import { ResponseHandler } from "../../../core/utils/handlers/response.handler";
import { HttpClient } from "@angular/common/http";
import { API_ENDPOINTS } from "../../../shared/constants/api-endpoints.constants";
import { buildAppointmentsHistoryHttpParams, buildAppointmentsActiveHttpParams, buildAppointmentsQuantityStatusHttpParams } from "../utils/appointments-params.util";
import { SetAppointmentStateRequest } from "../models/requests/manage-appointment-state-request.model";
import { GetQuantityStatusAppointmentsResponse, GetQuantityStatusAppointmentsResponseSchema } from "../models/responses/get-quantity-status-appointment-response.model";

@Injectable({ providedIn: 'root' })
export class AppointmentsService implements IAppointmentsService {
    constructor(
        private http: HttpClient,
        private responseHandler: ResponseHandler
    ) { }

    public verifyOverlap(request: VerifyOverlapRequest): Observable<VerifyOverlapResponse> {
        return this.http.post(API_ENDPOINTS.APPOINTMENTS.VERIFY_OVERLAP, request).pipe(
            map(response => this.responseHandler.handleSuccess(response, VerifyOverlapResponseSchema))
        );
    }

    public createAppointment(request: CreateAppointmentRequest): Observable<CreateAppointmentResponse> {
        return this.http.post(API_ENDPOINTS.APPOINTMENTS.CREATE, request).pipe(
            map(response => this.responseHandler.handleSuccess(response, CreateAppointmentResponseSchema))
        );
    }

    public getAppointmentsBy(params: AppointmentsParamsHistoryRequest): Observable<AppointmentsListHistoryResponse> {
        const httpParams = buildAppointmentsHistoryHttpParams(params);
        return this.http.get(API_ENDPOINTS.APPOINTMENTS.LIST_HISTORY, { params: httpParams }).pipe(
            map(response => this.responseHandler.handleSuccess(response, AppointmentsListHistoryResponseSchema))
        );
    }

    public getActiveAppointments(params: AppointmentsActiveParamsRequest): Observable<AppointmentsListActiveResponse> {
        const httpParams = buildAppointmentsActiveHttpParams(params);
        return this.http.get(API_ENDPOINTS.APPOINTMENTS.LIST, { params: httpParams }).pipe(
            map(response => this.responseHandler.handleSuccess(response, AppointmentsListActiveResponseSchema))
        );
    }
    public updateAppointment(appointmentId: number, request: UpdateAppointmentRequest): Observable<UpdateAppointmentResponse> {
        return this.http.put(API_ENDPOINTS.APPOINTMENTS.UPDATE(appointmentId), request).pipe(
            map(response => this.responseHandler.handleSuccess(response, UpdateAppointmentResponseSchema))
        );
    }
    public rescheduleAppointment(appointmentId: number, request: RescheduleAppointmentRequest): Observable<RescheduleAppointmentResponse> {
        return this.http.put(API_ENDPOINTS.APPOINTMENTS.RESCHEDULE(appointmentId), request).pipe(
            map(response => this.responseHandler.handleSuccess(response, RescheduleAppointmentResponseSchema))
        );
    }
    public getQuantityStatusAppointments(params: GetQuantityStatusAppointmentsParamsRequest): Observable<GetQuantityStatusAppointmentsResponse> {
        const httpParams = buildAppointmentsQuantityStatusHttpParams(params);

        return this.http.get(API_ENDPOINTS.APPOINTMENTS.GET_STATUS_QUANTITY, { params: httpParams }).pipe(
            map(response => this.responseHandler.handleSuccess(response, GetQuantityStatusAppointmentsResponseSchema))
        );
    }
    public approveAppointment(appointmentId: number): Observable<ApproveAppointmentResponse> {
        return this.http.patch(API_ENDPOINTS.APPOINTMENTS.APPROVE(appointmentId), {}).pipe(
            map(response => this.responseHandler.handleSuccess(response, ApproveAppointmentResponseSchema))
        );
    }
    public rejectAppointment(appointmentId: number): Observable<RejectAppointmentResponse> {
        return this.http.patch(API_ENDPOINTS.APPOINTMENTS.REJECT(appointmentId), {}).pipe(
            map(response => this.responseHandler.handleSuccess(response, RejectAppointmentResponseSchema))
        );
    }
    public setAppointmentState(appointmentId: number, request: SetAppointmentStateRequest): Observable<SetAppointmentStateResponse> {
        return this.http.patch(API_ENDPOINTS.APPOINTMENTS.SET_STATE(appointmentId), request).pipe(
            map(response => this.responseHandler.handleSuccess(response, SetAppointmentStateResponseSchema))
        );
    }
    public cancelAppointment(appointmentId: number): Observable<CancelAppointmentResponse> {
        return this.http.patch(API_ENDPOINTS.APPOINTMENTS.CANCEL(appointmentId), {}).pipe(
            map(response => this.responseHandler.handleSuccess(response, CancelAppointmentResponseSchema))
        );
    }

}