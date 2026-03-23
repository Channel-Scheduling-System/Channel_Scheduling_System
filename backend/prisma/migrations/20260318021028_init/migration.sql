-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `alias` VARCHAR(50) NOT NULL,
    `firstName` VARCHAR(80) NOT NULL,
    `lastName` VARCHAR(80) NOT NULL,
    `phone` VARCHAR(15) NULL,
    `email` VARCHAR(250) NULL,
    `passwordHash` VARCHAR(50) NOT NULL,
    `role` ENUM('admin', 'client', 'worker') NOT NULL DEFAULT 'client',
    `mustChangePwd` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_alias_key`(`alias`),
    INDEX `users_alias_idx`(`alias`),
    INDEX `users_firstName_lastName_idx`(`firstName`, `lastName`),
    INDEX `users_role_idx`(`role`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `services` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `description` VARCHAR(300) NULL,
    `colorHex` CHAR(7) NOT NULL,
    `defaultDurationMin` SMALLINT UNSIGNED NOT NULL,
    `defaultPrice` MEDIUMINT UNSIGNED NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `workerId` INTEGER NOT NULL,

    UNIQUE INDEX `services_name_key`(`name`),
    INDEX `services_workerId_idx`(`workerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `appointments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `startAt` DATETIME NOT NULL,
    `endAt` DATETIME NOT NULL,
    `status` ENUM('pending', 'rejected', 'scheduled', 'in_progress', 'cancelled', 'completed', 'no_show') NOT NULL DEFAULT 'pending',
    `createdBy` ENUM('client', 'worker') NOT NULL DEFAULT 'client',
    `notes` VARCHAR(300) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `workerId` INTEGER NOT NULL,
    `clientId` INTEGER NOT NULL,

    INDEX `appointments_workerId_idx`(`workerId`),
    INDEX `appointments_clientId_idx`(`clientId`),
    INDEX `appointments_startAt_endAt_idx`(`startAt`, `endAt`),
    INDEX `appointments_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `appointments_services` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `customDurationMin` SMALLINT UNSIGNED NOT NULL,
    `customPrice` MEDIUMINT UNSIGNED NOT NULL,
    `appointmentId` INTEGER NOT NULL,
    `serviceId` INTEGER NOT NULL,

    INDEX `appointments_services_appointmentId_idx`(`appointmentId`),
    INDEX `appointments_services_serviceId_idx`(`serviceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifications` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` ENUM('pending', 'rejected', 'scheduled', 'in_progress', 'cancelled', 'completed', 'no_show') NOT NULL DEFAULT 'pending',
    `title` VARCHAR(100) NOT NULL,
    `message` VARCHAR(200) NOT NULL,
    `sent_email` BOOLEAN NOT NULL,
    `sending_date` DATETIME NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `userId` INTEGER NOT NULL,
    `appointmentId` INTEGER NOT NULL,

    INDEX `notifications_userId_idx`(`userId`),
    INDEX `notifications_appointmentId_idx`(`appointmentId`),
    INDEX `notifications_type_idx`(`type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `blocked_times` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` ENUM('hour', 'day', 'vacation') NOT NULL DEFAULT 'hour',
    `startDate` DATE NULL,
    `endDate` DATE NULL,
    `startHour` TIME NULL,
    `endHour` TIME NULL,
    `reason` VARCHAR(200) NULL,
    `workerId` INTEGER NOT NULL,

    INDEX `blocked_times_workerId_idx`(`workerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `working_hours` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `dayOfWeek` TINYINT UNSIGNED NOT NULL,
    `startTime` TIME NOT NULL,
    `endTime` TIME NOT NULL,
    `workerId` INTEGER NOT NULL,

    INDEX `working_hours_workerId_idx`(`workerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `recovery_codes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` CHAR(5) NOT NULL,
    `used` BOOLEAN NOT NULL DEFAULT false,
    `expireAt` DATETIME NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `userId` INTEGER NOT NULL,

    INDEX `recovery_codes_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `services` ADD CONSTRAINT `services_workerId_fkey` FOREIGN KEY (`workerId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `appointments` ADD CONSTRAINT `appointments_workerId_fkey` FOREIGN KEY (`workerId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `appointments` ADD CONSTRAINT `appointments_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `appointments_services` ADD CONSTRAINT `appointments_services_appointmentId_fkey` FOREIGN KEY (`appointmentId`) REFERENCES `appointments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `appointments_services` ADD CONSTRAINT `appointments_services_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `services`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_appointmentId_fkey` FOREIGN KEY (`appointmentId`) REFERENCES `appointments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `blocked_times` ADD CONSTRAINT `blocked_times_workerId_fkey` FOREIGN KEY (`workerId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `working_hours` ADD CONSTRAINT `working_hours_workerId_fkey` FOREIGN KEY (`workerId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `recovery_codes` ADD CONSTRAINT `recovery_codes_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
