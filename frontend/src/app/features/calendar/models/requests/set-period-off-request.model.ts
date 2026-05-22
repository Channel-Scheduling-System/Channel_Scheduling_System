import { z } from 'zod';

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const dateErrorMsg = 'Formato de fecha inválido (AAAA-MM-DD)';

export const SetPeriodOffSchema = z
  .object({
    startDate: z.string().regex(dateRegex, dateErrorMsg),
    endDate: z.string().regex(dateRegex, dateErrorMsg),
    reason: z
      .string()
      .max(200, 'La razón no puede exceder los 200 caracteres')
      .optional(),
  })
  .refine(
    (data) => {
      const start = new Date(data.startDate).getTime();
      const end = new Date(data.endDate).getTime();
      
      return start < end; 
    },
    {
      message: 'La fecha de fin debe ser posterior a la fecha de inicio (mínimo 2 días de rango)',
      path: ['endDate'], 
    }
  );

export type SetPeriodOffRequest = z.infer<typeof SetPeriodOffSchema>;