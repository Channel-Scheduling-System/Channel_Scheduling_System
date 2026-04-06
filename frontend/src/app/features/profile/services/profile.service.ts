import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { API_ENDPOINTS } from '../../../shared/constants/api-endpoints.constants';
import { ResponseHandler } from '../../../core/utils/handlers/response.handler';
import { HttpErrorHandler } from '../../../core/utils/handlers/error.handler';
import { GetProfileResponse, GetProfileResponseSchema, ProfileUser } from '../models/responses/get-profile/get-profile-response.model';
import { IProfileService } from '../interfaces/profile-services.interface';

@Injectable({ providedIn: 'root' })
export class ProfileService implements IProfileService {
  constructor(
    private http: HttpClient,
    private responseHandler: ResponseHandler,
    private errorHandler: HttpErrorHandler
  ) {}

  getProfile(userId: number): Observable<GetProfileResponse> {
    const url = API_ENDPOINTS.USERS.PROFILE(userId);
    return this.http.get(url).pipe(
      map(response => this.responseHandler.handleSuccess(response, GetProfileResponseSchema)),
      catchError(error => this.errorHandler.handleError(error))
    );
  }
}