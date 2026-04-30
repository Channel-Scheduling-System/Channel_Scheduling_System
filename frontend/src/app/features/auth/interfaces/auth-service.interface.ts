import { Observable } from 'rxjs';
import { LoginRequest } from '../models/requests/login-request.model';
import { LoginResponse } from '../models/responses/login-response.model';
import { RegisterClientRequest } from '../models/requests/register-client-request.model';
import { RegisterClientResponse } from '../models/responses/register-client-response.model';
import { RegisterFirstAdminResponse } from '../models/responses/register-first-admin-response.model';
import { RegisterFirstAdminRequest } from '../models/requests/register-first-admin-request.model';
import { SendRecoveryCodeRequest } from '../models/requests/send-code-requests.model';
import { SendRecoveryCodeResponse } from '../models/responses/send-code-response.model';
import { VerifyRecoveryCodeRequest } from '../models/requests/verify-code-request.model';
import { VerifyRecoveryCodeResponse } from '../models/responses/verify-code-response.model';
import { PasswordRecoveryRequest } from '../models/requests/recovery-password-request.model';
import { PasswordRecoveryResponse } from '../models/responses/recovery-password-response.model';

export interface IAuthService {
  
  login(request: LoginRequest): Observable<LoginResponse>;

  registerFirstAdmin(request: RegisterFirstAdminRequest): Observable<RegisterFirstAdminResponse>;

  registerClientAndLogin(request: RegisterClientRequest): Observable<RegisterClientResponse>;

  sendRecoveryCode(request: SendRecoveryCodeRequest): Observable<SendRecoveryCodeResponse>;

  verifyRecoveryCode(request: VerifyRecoveryCodeRequest): Observable<VerifyRecoveryCodeResponse>;

  recoveryPassword(request: PasswordRecoveryRequest): Observable<PasswordRecoveryResponse>;

}