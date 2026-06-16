/*
  Warnings:

  - You are about to alter the column `startAt` on the `appointments` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `endAt` on the `appointments` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to drop the column `endHour` on the `blocked_times` table. All the data in the column will be lost.
  - You are about to drop the column `startHour` on the `blocked_times` table. All the data in the column will be lost.
  - The values [vacation] on the enum `blocked_times_type` will be removed. If these variants are still used in the database, this will fail.
  - You are about to alter the column `sending_date` on the `notifications` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `expireAt` on the `refresh_tokens` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `expireAt` on the `reset_codes` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - Made the column `startDate` on table `blocked_times` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `appointments` MODIFY `startAt` DATETIME NOT NULL,
    MODIFY `endAt` DATETIME NOT NULL;

-- AlterTable
ALTER TABLE `blocked_times` DROP COLUMN `endHour`,
    DROP COLUMN `startHour`,
    ADD COLUMN `endTime` TIME NULL,
    ADD COLUMN `startTime` TIME NULL,
    MODIFY `type` ENUM('hour', 'day', 'period') NOT NULL DEFAULT 'hour',
    MODIFY `startDate` DATE NOT NULL;

-- AlterTable
ALTER TABLE `notifications` MODIFY `sending_date` DATETIME NOT NULL;

-- AlterTable
ALTER TABLE `refresh_tokens` MODIFY `expireAt` DATETIME NOT NULL;

-- AlterTable
ALTER TABLE `reset_codes` MODIFY `expireAt` DATETIME NOT NULL;
