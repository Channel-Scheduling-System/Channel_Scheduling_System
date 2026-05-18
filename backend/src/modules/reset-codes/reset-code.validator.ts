import { z } from 'zod';

import { userEmail } from '../users/user.validator.js';

// RESET CODE REQUEST
//* -----------------------------
export const resetCodeRequestDTO = z.object({ email: userEmail }).strict();

