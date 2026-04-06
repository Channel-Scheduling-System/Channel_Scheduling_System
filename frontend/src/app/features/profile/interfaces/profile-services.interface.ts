import { Observable } from "rxjs";
import { GetProfileResponse } from "../models/responses/get-profile/get-profile-response.model";


export interface IProfileService {

    getProfile(userId: number): Observable<GetProfileResponse>;

}