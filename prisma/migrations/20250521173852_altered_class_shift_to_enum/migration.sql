/*
  Warnings:

  - You are about to alter the column `shift` on the `class` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(1))`.

*/
-- AlterTable
ALTER TABLE `class` MODIFY `shift` ENUM('Morning', 'Afternoon', 'Evening', 'Full') NOT NULL;
