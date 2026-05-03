import { z } from 'zod';

import { UserEmail } from '../users/user.validator.js';

// RESET CODE REQUEST
//* -----------------------------
export const ResetCodeRequestDTO = z.object({ email: UserEmail }).strict();

