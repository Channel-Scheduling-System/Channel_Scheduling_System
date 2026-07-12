import prisma from '../../../config/prisma.js';

const BOGOTA_OFFSET_MS = 5 * 60 * 60 * 1000;

export async function runAppointmentStatusTransition(): Promise<void> {
    const now = new Date(Date.now() - BOGOTA_OFFSET_MS);

    await prisma.appointment.updateMany({
        where: { status: 'SCHEDULED', startAt: { lte: now } },
        data: { status: 'IN_PROGRESS' },
    });

    await prisma.appointment.updateMany({
        where: { status: 'IN_PROGRESS', endAt: { lte: now } },
        data: { status: 'COMPLETED' },
    });
}
