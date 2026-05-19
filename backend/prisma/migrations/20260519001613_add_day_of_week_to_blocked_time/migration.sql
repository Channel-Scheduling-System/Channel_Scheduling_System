/*
  Warnings:

  - You are about to alter the column `startAt` on the `appointments` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `endAt` on the `appointments` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `sending_date` on the `notifications` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `expireAt` on the `refresh_tokens` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `expireAt` on the `reset_codes` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.

*/
-- AlterTable
ALTER TABLE `appointments` MODIFY `startAt` DATETIME NOT NULL,
    MODIFY `endAt` DATETIME NOT NULL;

-- AlterTable
ALTER TABLE `blocked_times` ADD COLUMN `dayOfWeek` TINYINT UNSIGNED NULL;

-- AlterTable
ALTER TABLE `notifications` MODIFY `sending_date` DATETIME NOT NULL;

-- AlterTable
ALTER TABLE `refresh_tokens` MODIFY `expireAt` DATETIME NOT NULL;

-- AlterTable
ALTER TABLE `reset_codes` MODIFY `expireAt` DATETIME NOT NULL;
