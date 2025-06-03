-- CreateTable
CREATE TABLE `user` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `birth_date` DATETIME(3) NOT NULL,
    `cpf` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `modified_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `role` ENUM('Admin', 'Student', 'Teacher') NOT NULL,
    `hashed_password` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `user_id_key`(`id`),
    UNIQUE INDEX `user_email_key`(`email`),
    UNIQUE INDEX `user_cpf_key`(`cpf`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `teacher` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `modified_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `teacher_id_key`(`id`),
    UNIQUE INDEX `teacher_user_id_key`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subject` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `modified_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `subject_id_key`(`id`),
    UNIQUE INDEX `subject_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `relationship_teacher_subject` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `subject_id` INTEGER NOT NULL,
    `teacher_id` INTEGER NOT NULL,

    UNIQUE INDEX `relationship_teacher_subject_id_key`(`id`),
    UNIQUE INDEX `relationship_teacher_subject_teacher_id_subject_id_key`(`teacher_id`, `subject_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `class` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `shift` ENUM('Morning', 'Afternoon', 'Evening', 'Full') NOT NULL,
    `course` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `modified_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `class_id_key`(`id`),
    UNIQUE INDEX `class_name_shift_course_key`(`name`, `shift`, `course`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `student` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `enrollment` VARCHAR(191) NOT NULL,
    `user_id` INTEGER NOT NULL,
    `class_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `modified_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `student_id_key`(`id`),
    UNIQUE INDEX `student_enrollment_key`(`enrollment`),
    UNIQUE INDEX `student_user_id_key`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `relationship_teacher_subject_class` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `class_id` INTEGER NOT NULL,
    `teacher_subject_id` INTEGER NOT NULL,

    UNIQUE INDEX `relationship_teacher_subject_class_id_key`(`id`),
    UNIQUE INDEX `relationship_teacher_subject_class_teacher_subject_id_class__key`(`teacher_subject_id`, `class_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `quiz` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `icon` VARCHAR(191) NOT NULL,
    `duration_minutes` INTEGER NULL,
    `max_points` DECIMAL(65, 30) NOT NULL DEFAULT 0,
    `max_attempt` INTEGER NULL,
    `visibility` ENUM('draft', 'public', 'archived') NOT NULL DEFAULT 'draft',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `modified_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `teacher_subject_class_id` INTEGER NOT NULL,

    UNIQUE INDEX `quiz_id_key`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `question` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `statement` TEXT NOT NULL,
    `points` DECIMAL(65, 30) NOT NULL,
    `quiz_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `modified_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `question_id_key`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `alternative` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `question_id` INTEGER NOT NULL,
    `response` VARCHAR(191) NOT NULL,
    `correct_alternative` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `modified_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `alternative_id_key`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `question_images` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `image_path` VARCHAR(191) NOT NULL,
    `alt_text` VARCHAR(191) NOT NULL,
    `question_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `question_images_id_key`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `quiz_attempt` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `student_id` INTEGER NOT NULL,
    `quiz_id` INTEGER NOT NULL,
    `started_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `finished_at` DATETIME(3) NULL,
    `status` ENUM('in_progress', 'completed', 'abandoned') NOT NULL DEFAULT 'in_progress',
    `total_score` DECIMAL(65, 30) NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `modified_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `quiz_attempt_id_key`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `question_response` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `question_id` INTEGER NOT NULL,
    `marked_alternative_id` INTEGER NOT NULL,
    `quiz_attempt_id` INTEGER NOT NULL,
    `is_correct` BOOLEAN NOT NULL,
    `points_earned` DECIMAL(65, 30) NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `modified_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `question_response_id_key`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `teacher` ADD CONSTRAINT `teacher_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `relationship_teacher_subject` ADD CONSTRAINT `relationship_teacher_subject_subject_id_fkey` FOREIGN KEY (`subject_id`) REFERENCES `subject`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `relationship_teacher_subject` ADD CONSTRAINT `relationship_teacher_subject_teacher_id_fkey` FOREIGN KEY (`teacher_id`) REFERENCES `teacher`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student` ADD CONSTRAINT `student_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student` ADD CONSTRAINT `student_class_id_fkey` FOREIGN KEY (`class_id`) REFERENCES `class`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `relationship_teacher_subject_class` ADD CONSTRAINT `relationship_teacher_subject_class_class_id_fkey` FOREIGN KEY (`class_id`) REFERENCES `class`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `relationship_teacher_subject_class` ADD CONSTRAINT `relationship_teacher_subject_class_teacher_subject_id_fkey` FOREIGN KEY (`teacher_subject_id`) REFERENCES `relationship_teacher_subject`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quiz` ADD CONSTRAINT `quiz_teacher_subject_class_id_fkey` FOREIGN KEY (`teacher_subject_class_id`) REFERENCES `relationship_teacher_subject_class`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `question` ADD CONSTRAINT `question_quiz_id_fkey` FOREIGN KEY (`quiz_id`) REFERENCES `quiz`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `alternative` ADD CONSTRAINT `alternative_question_id_fkey` FOREIGN KEY (`question_id`) REFERENCES `question`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `question_images` ADD CONSTRAINT `question_images_question_id_fkey` FOREIGN KEY (`question_id`) REFERENCES `question`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quiz_attempt` ADD CONSTRAINT `quiz_attempt_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `student`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quiz_attempt` ADD CONSTRAINT `quiz_attempt_quiz_id_fkey` FOREIGN KEY (`quiz_id`) REFERENCES `quiz`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `question_response` ADD CONSTRAINT `question_response_question_id_fkey` FOREIGN KEY (`question_id`) REFERENCES `question`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `question_response` ADD CONSTRAINT `question_response_marked_alternative_id_fkey` FOREIGN KEY (`marked_alternative_id`) REFERENCES `alternative`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `question_response` ADD CONSTRAINT `question_response_quiz_attempt_id_fkey` FOREIGN KEY (`quiz_attempt_id`) REFERENCES `quiz_attempt`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
