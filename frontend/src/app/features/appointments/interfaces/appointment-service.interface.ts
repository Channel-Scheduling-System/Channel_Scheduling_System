import { Observable } from 'rxjs';
import { CreateAppointmentRequest, VerifyOverlapRequest } from '../models/requests/create-appointment-request.model';
import { CreateAppointmentResponse, VerifyOverlapResponse } from '../models/responses/create-appointment-response';
import { AppointmentsActiveParamsRequest, AppointmentsParamsHistoryRequest } from '../models/requests/appointments-params-request.model';
import { Appointment } from '../../../shared/models/entities/appointment.schema';
import { AppointmentsListActiveResponse, AppointmentsListHistoryResponse } from '../models/responses/appointments-list-response.model';
import { RescheduleAppointmentResponse, UpdateAppointmentResponse } from '../models/responses/update-appointment-response.model';
import { RescheduleAppointmentRequest, UpdateAppointmentRequest } from '../models/requests/update-appointment-request.model';
import { ApproveAppointmentResponse, CancelAppointmentResponse, RejectAppointmentResponse } from '../models/responses/manage-appointment-state-response.model';

export interface IAppointmentsService {
  
    verifyOverlap(request: VerifyOverlapRequest): Observable<VerifyOverlapResponse>;

    createAppointment(request: CreateAppointmentRequest): Observable<CreateAppointmentResponse>;
    
    getAppointmentsBy(params: AppointmentsParamsHistoryRequest): Observable<AppointmentsListHistoryResponse>;

    getActiveAppointments(params: AppointmentsActiveParamsRequest): Observable<AppointmentsListActiveResponse>;

    updateAppointment(appointmentId: number, request: UpdateAppointmentRequest): Observable<UpdateAppointmentResponse>;

    rescheduleAppointment(appointmentId: number, request: RescheduleAppointmentRequest): Observable<RescheduleAppointmentResponse>;

    approveAppointment(appointmentId: number): Observable<ApproveAppointmentResponse>;

    rejectAppointment(appointmentId: number): Observable<RejectAppointmentResponse>;

    cancelAppointment(appointmentId: number): Observable<CancelAppointmentResponse>;
    
}