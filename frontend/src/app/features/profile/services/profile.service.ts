import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map} from 'rxjs/operators';
import { API_ENDPOINTS } from '../../../shared/constants/api-endpoints.constants';
import { ResponseHandler } from '../../../core/utils/handlers/response.handler';
import { GetProfileResponse, GetProfileResponseSchema} from '../models/responses/get-profile-response.model';
import { IProfileService } from '../interfaces/profile-services.interface';
import { UpdateProfileResponse, UpdateProfileResponseSchema } from '../models/responses/update-profile-response.model';
import { UpdateProfileRequest, UpdateProfileRequestSchema } from '../models/requests/update-profile-request.model';
import { DeactivateProfileResponse, DeactivateProfileResponseSchema } from '../models/responses/deativate-profile-response.model';
import { DeactivateProfileRequest, DeactivateProfileRequestSchema } from '../models/requests/deactivate-profile-request.model';
import { ResetUserPasswordRequest, ResetUserPasswordRequestSchema } from '../models/requests/reset-password-request.model';
import { ResetUserPasswordResponse, ResetUserPasswordResponseSchema } from '../models/responses/reset-password-response.model';

@Injectable({ providedIn: 'root' })
export class ProfileService implements IProfileService {
  constructor(
    private http: HttpClient,
    private responseHandler: ResponseHandler
  ) {}

  getProfile(userId: number): Observable<GetProfileResponse> {
    const url = API_ENDPOINTS.USERS.PROFILE(userId);
    return this.http.get(url).pipe(
      map(response => this.responseHandler.handleSuccess(response, GetProfileResponseSchema))
    );
  }

  updateProfile(userId: number, request: UpdateProfileRequest): Observable<UpdateProfileResponse> {
    const validatedRequest = UpdateProfileRequestSchema.parse(request);
    return this.http.put(API_ENDPOINTS.USERS.UPDATE(userId), validatedRequest).pipe(
      map(response => this.responseHandler.handleSuccess(response, UpdateProfileResponseSchema))
    );
  }

  deactivateAccount(request: DeactivateProfileRequest): Observable<DeactivateProfileResponse> {
    const validatedRequest = DeactivateProfileRequestSchema.parse(request);
    return this.http.patch(API_ENDPOINTS.USERS.DEACTIVATE, validatedRequest, { withCredentials: true }).pipe(
      map(response => this.responseHandler.handleSuccess(response, DeactivateProfileResponseSchema))
    );
  }

  resetProfilePassword(userId: number, request: ResetUserPasswordRequest): Observable<ResetUserPasswordResponse> {
    const validatedRequest = ResetUserPasswordRequestSchema.parse(request);
    return this.http.patch(API_ENDPOINTS.USERS.RESET_PASSWORD(userId), validatedRequest).pipe(
      map(response => this.responseHandler.handleSuccess(response, ResetUserPasswordResponseSchema))
    );
  }

}