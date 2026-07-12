import cron from 'node-cron';
import { runAppointmentStatusTransition } from '../modules/appointments/util/appointment-status-scheduler.js';

// CRON Frequency: Every minute

export function startAppointmentScheduler() {
    runAppointmentStatusTransition().catch((err) =>
        console.error('Error en transición automática de citas:', err),
    );

    return cron.schedule('* * * * *', () => {
        runAppointmentStatusTransition().catch((err) =>
            console.error('Error en transición automática de citas:', err),
        );
    });
}
