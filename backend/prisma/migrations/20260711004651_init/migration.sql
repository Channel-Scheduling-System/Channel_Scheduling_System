-- CreateEnum
CREATE TYPE "system_user_role" AS ENUM ('admin', 'client', 'worker');

-- CreateEnum
CREATE TYPE "appointment_status" AS ENUM ('pending', 'rejected', 'scheduled', 'in_progress', 'cancelled', 'completed', 'no_show');

-- CreateEnum
CREATE TYPE "appointment_user_role" AS ENUM ('client', 'worker');

-- CreateEnum
CREATE TYPE "time_interval" AS ENUM ('hour', 'day', 'period');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "alias" VARCHAR(50) NOT NULL,
    "firstName" VARCHAR(80) NOT NULL,
    "lastName" VARCHAR(80) NOT NULL,
    "phone" VARCHAR(15),
    "email" VARCHAR(250) NOT NULL,
    "passwordHash" VARCHAR(60) NOT NULL,
    "role" "system_user_role" NOT NULL DEFAULT 'client',
    "mustChangePwd" BOOLEAN NOT NULL DEFAULT false,
    "resetVersion" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "services" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(300),
    "colorHex" CHAR(7) NOT NULL,
    "defaultDurationMin" SMALLINT NOT NULL,
    "defaultPrice" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "workerId" INTEGER NOT NULL,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appointments" (
    "id" SERIAL NOT NULL,
    "startAt" TIMESTAMP(0) NOT NULL,
    "endAt" TIMESTAMP(0) NOT NULL,
    "status" "appointment_status" NOT NULL DEFAULT 'pending',
    "createdBy" "appointment_user_role" NOT NULL DEFAULT 'client',
    "notes" VARCHAR(300),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "workerId" INTEGER NOT NULL,
    "clientId" INTEGER NOT NULL,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appointments_services" (
    "id" SERIAL NOT NULL,
    "customDurationMin" SMALLINT NOT NULL,
    "customPrice" INTEGER NOT NULL,
    "appointmentId" INTEGER NOT NULL,
    "serviceId" INTEGER NOT NULL,

    CONSTRAINT "appointments_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" SERIAL NOT NULL,
    "type" "appointment_status" NOT NULL DEFAULT 'pending',
    "title" VARCHAR(100) NOT NULL,
    "message" VARCHAR(200) NOT NULL,
    "sent_email" BOOLEAN NOT NULL,
    "sending_date" TIMESTAMP(0) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,
    "appointmentId" INTEGER NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blocked_times" (
    "id" SERIAL NOT NULL,
    "type" "time_interval" NOT NULL DEFAULT 'hour',
    "startDate" DATE NOT NULL,
    "endDate" DATE,
    "startTime" TIME,
    "endTime" TIME,
    "dayOfWeek" SMALLINT,
    "reason" VARCHAR(200),
    "workerId" INTEGER NOT NULL,

    CONSTRAINT "blocked_times_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "working_hours" (
    "id" SERIAL NOT NULL,
    "dayOfWeek" SMALLINT NOT NULL,
    "startTime" TIME NOT NULL,
    "endTime" TIME NOT NULL,
    "workerId" INTEGER NOT NULL,

    CONSTRAINT "working_hours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reset_codes" (
    "id" SERIAL NOT NULL,
    "codeHash" CHAR(64) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "expireAt" TIMESTAMP(0) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "reset_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" SERIAL NOT NULL,
    "tokenHash" CHAR(64) NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "expireAt" TIMESTAMP(0) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_alias_key" ON "users"("alias");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE UNIQUE INDEX "services_workerId_name_key" ON "services"("workerId", "name");

-- CreateIndex
CREATE INDEX "appointments_startAt_endAt_idx" ON "appointments"("startAt", "endAt");

-- CreateIndex
CREATE INDEX "appointments_status_idx" ON "appointments"("status");

-- CreateIndex
CREATE INDEX "appointments_services_appointmentId_idx" ON "appointments_services"("appointmentId");

-- CreateIndex
CREATE INDEX "appointments_services_serviceId_idx" ON "appointments_services"("serviceId");

-- CreateIndex
CREATE INDEX "notifications_type_idx" ON "notifications"("type");

-- CreateIndex
CREATE INDEX "blocked_times_workerId_type_idx" ON "blocked_times"("workerId", "type");

-- CreateIndex
CREATE INDEX "working_hours_workerId_dayOfWeek_idx" ON "working_hours"("workerId", "dayOfWeek");

-- CreateIndex
CREATE INDEX "reset_codes_userId_used_idx" ON "reset_codes"("userId", "used");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_tokenHash_key" ON "refresh_tokens"("tokenHash");

-- CreateIndex
CREATE INDEX "refresh_tokens_userId_revoked_idx" ON "refresh_tokens"("userId", "revoked");

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments_services" ADD CONSTRAINT "appointments_services_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "appointments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments_services" ADD CONSTRAINT "appointments_services_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "appointments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blocked_times" ADD CONSTRAINT "blocked_times_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "working_hours" ADD CONSTRAINT "working_hours_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reset_codes" ADD CONSTRAINT "reset_codes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
