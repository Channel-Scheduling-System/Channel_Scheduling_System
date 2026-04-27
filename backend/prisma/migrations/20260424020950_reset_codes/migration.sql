/*
  Warnings:

  - You are about to alter the column `startAt` on the `appointments` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `endAt` on the `appointments` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `sending_date` on the `notifications` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `expireAt` on the `refresh_tokens` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to drop the `recovery_codes` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `recovery_codes` DROP FOREIGN KEY `recovery_codes_userId_fkey`;

-- AlterTable
ALTER TABLE `appointments` MODIFY `startAt` DATETIME NOT NULL,
    MODIFY `endAt` DATETIME NOT NULL;

-- AlterTable
ALTER TABLE `notifications` MODIFY `sending_date` DATETIME NOT NULL;

-- AlterTable
ALTER TABLE `refresh_tokens` MODIFY `expireAt` DATETIME NOT NULL;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `resetVersion` INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE `recovery_codes`;

-- CreateTable
CREATE TABLE `reset_codes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `codeHash` CHAR(64) NOT NULL,
    `used` BOOLEAN NOT NULL DEFAULT false,
    `attempts` INTEGER NOT NULL DEFAULT 0,
    `expireAt` DATETIME NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `userId` INTEGER NOT NULL,

    INDEX `reset_codes_userId_used_idx`(`userId`, `used`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `reset_codes` ADD CONSTRAINT `reset_codes_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
