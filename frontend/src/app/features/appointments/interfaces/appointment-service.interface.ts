import { Observable } from 'rxjs';
import { CreateAppointmentRequest, VerifyOverlapRequest } from '../models/requests/create-appointment-request.model';
import { CreateAppointmentResponse, VerifyOverlapResponse } from '../models/responses/create-appointment-response';
import { AppointmentsActiveParamsRequest, AppointmentsParamsHistoryRequest, GetQuantityStatusAppointmentsParamsRequest } from '../models/requests/appointments-params-request.model';
import { Appointment } from '../../../shared/models/entities/appointment.schema';
import { AppointmentsListActiveResponse, AppointmentsListHistoryResponse } from '../models/responses/appointments-list-response.model';
import { RescheduleAppointmentResponse, UpdateAppointmentResponse } from '../models/responses/update-appointment-response.model';
import { RescheduleAppointmentRequest, UpdateAppointmentRequest } from '../models/requests/update-appointment-request.model';
import { ApproveAppointmentResponse, CancelAppointmentResponse, RejectAppointmentResponse, SetAppointmentStateResponse } from '../models/responses/manage-appointment-state-response.model';
import { CancelAppointmentRequest, SetAppointmentStateRequest } from '../models/requests/manage-appointment-state-request.model';
import { GetQuantityStatusAppointmentsResponse } from '../models/responses/get-quantity-status-appointment-response.model';

export interface IAppointmentsService {
  
    verifyOverlap(request: VerifyOverlapRequest): Observable<VerifyOverlapResponse>;

    createAppointment(request: CreateAppointmentRequest): Observable<CreateAppointmentResponse>;
    
    getAppointmentsBy(params: AppointmentsParamsHistoryRequest): Observable<AppointmentsListHistoryResponse>;

    getActiveAppointments(params: AppointmentsActiveParamsRequest): Observable<AppointmentsListActiveResponse>;

    updateAppointment(appointmentId: number, request: UpdateAppointmentRequest): Observable<UpdateAppointmentResponse>;

    rescheduleAppointment(appointmentId: number, request: RescheduleAppointmentRequest): Observable<RescheduleAppointmentResponse>;

    getQuantityStatusAppointments(params: GetQuantityStatusAppointmentsParamsRequest): Observable<GetQuantityStatusAppointmentsResponse>;
    
    approveAppointment(appointmentId: number): Observable<ApproveAppointmentResponse>;

    rejectAppointment(appointmentId: number): Observable<RejectAppointmentResponse>;

    setAppointmentState(appointmentId: number, request: SetAppointmentStateRequest): Observable<SetAppointmentStateResponse>;

    cancelAppointment(appointmentId: number, request: CancelAppointmentRequest): Observable<CancelAppointmentResponse>;
    
}