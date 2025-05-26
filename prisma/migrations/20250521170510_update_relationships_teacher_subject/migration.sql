/*
  Warnings:

  - You are about to drop the column `teacher_class_subject_id` on the `quiz` table. All the data in the column will be lost.
  - You are about to drop the `relationship_teacher_class_subject` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `teacher_subject_class_id` to the `Quiz` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Quiz` DROP FOREIGN KEY `Quiz_teacher_class_subject_id_fkey`;

-- DropForeignKey
ALTER TABLE `Relationship_teacher_class_subject` DROP FOREIGN KEY `Relationship_teacher_class_subject_class_id_fkey`;

-- DropForeignKey
ALTER TABLE `Relationship_teacher_class_subject` DROP FOREIGN KEY `Relationship_teacher_class_subject_subject_id_fkey`;

-- DropForeignKey
ALTER TABLE `Relationship_teacher_class_subject` DROP FOREIGN KEY `Relationship_teacher_class_subject_teacher_id_fkey`;

-- DropIndex
DROP INDEX `Quiz_teacher_class_subject_id_fkey` ON `Quiz`;

-- AlterTable
ALTER TABLE `Quiz` DROP COLUMN `teacher_class_subject_id`,
    ADD COLUMN `teacher_subject_class_id` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `Student` MODIFY `enrollment` VARCHAR(191) NOT NULL;

-- DropTable
DROP TABLE `Relationship_teacher_class_subject`;

-- CreateTable
CREATE TABLE `Relationship_teacher_subject_class` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `class_id` INTEGER NOT NULL,
    `teacher_subject_id` INTEGER NOT NULL,

    UNIQUE INDEX `Relationship_teacher_subject_class_id_key`(`id`),
    UNIQUE INDEX `Relationship_teacher_subject_class_teacher_subject_id_class__key`(`teacher_subject_id`, `class_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Relationship_teacher_subject_class` ADD CONSTRAINT `Relationship_teacher_subject_class_class_id_fkey` FOREIGN KEY (`class_id`) REFERENCES `Class`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Relationship_teacher_subject_class` ADD CONSTRAINT `Relationship_teacher_subject_class_teacher_subject_id_fkey` FOREIGN KEY (`teacher_subject_id`) REFERENCES `Relationship_teacher_subject`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Quiz` ADD CONSTRAINT `Quiz_teacher_subject_class_id_fkey` FOREIGN KEY (`teacher_subject_class_id`) REFERENCES `Relationship_teacher_subject_class`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
