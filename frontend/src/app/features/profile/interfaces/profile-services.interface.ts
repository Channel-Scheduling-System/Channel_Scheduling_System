import { Observable } from "rxjs";
import { GetProfileResponse } from "../models/responses/get-profile-response.model";
import { ResetUserPasswordRequest } from "../models/requests/reset-password-request.model";
import { ResetUserPasswordResponse } from "../models/responses/reset-password-response.model";


export interface IProfileService {

    getProfile(userId: number): Observable<GetProfileResponse>;

    resetProfilePassword(
    userId: number,
    request: ResetUserPasswordRequest
  ): Observable<ResetUserPasswordResponse>

}