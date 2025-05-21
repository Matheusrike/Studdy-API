/*
  Warnings:

  - A unique constraint covering the columns `[name,shift,course]` on the table `Class` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Class_name_shift_course_key` ON `Class`(`name`, `shift`, `course`);
