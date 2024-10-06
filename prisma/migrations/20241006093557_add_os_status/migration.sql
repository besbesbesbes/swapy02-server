-- CreateTable
CREATE TABLE `User` (
    `user_id` INTEGER NOT NULL AUTO_INCREMENT,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `user_name` VARCHAR(191) NOT NULL,
    `user_display_name` VARCHAR(191) NULL,
    `user_email` VARCHAR(191) NOT NULL,
    `user_password` VARCHAR(191) NOT NULL,
    `user_bio` VARCHAR(191) NULL,
    `user_profile_pic` VARCHAR(191) NOT NULL DEFAULT '../src/pics/user-pic-default.png',
    `user_rating` DECIMAL(65, 30) NOT NULL DEFAULT 0,
    `user_rating_count` INTEGER NOT NULL DEFAULT 0,
    `user_location` VARCHAR(191) NULL,
    `user_address` VARCHAR(191) NULL,
    `user_is_ready` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `User_user_name_key`(`user_name`),
    UNIQUE INDEX `User_user_email_key`(`user_email`),
    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Asset` (
    `asset_id` INTEGER NOT NULL AUTO_INCREMENT,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `user_id` INTEGER NOT NULL,
    `asset_name` VARCHAR(191) NOT NULL,
    `asset_category` ENUM('BEAUTY', 'FOOD', 'GROCERIES', 'FORNITURE', 'ELECTRONIC', 'CLOTHES', 'SMARTPHONE', 'VIHICLE', 'ACCESSORIES', 'MISCELLANEOUS') NOT NULL DEFAULT 'MISCELLANEOUS',
    `asset_brand` VARCHAR(191) NULL,
    `asset_condition` ENUM('NEW', 'MINT', 'GOOD', 'ACCEPTABLE', 'BROKEN', 'PARTS') NOT NULL DEFAULT 'NEW',
    `asset_note` VARCHAR(1000) NULL,
    `asset_thumbnail` VARCHAR(191) NOT NULL,
    `asset_status` ENUM('CREATED', 'READY', 'MATCHED', 'SHIPPED', 'RECEIVED') NOT NULL DEFAULT 'CREATED',
    `asset_offeror_count` INTEGER NOT NULL DEFAULT 0,
    `asset_swaper_count` INTEGER NOT NULL DEFAULT 0,
    `asset_is_ready` BOOLEAN NOT NULL DEFAULT true,
    `asset_is_new` BOOLEAN NOT NULL DEFAULT true,
    `asset_shipping_address` VARCHAR(191) NULL,

    PRIMARY KEY (`asset_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Asset_Pic` (
    `asset_pic_id` INTEGER NOT NULL AUTO_INCREMENT,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `asset_pic` VARCHAR(1000) NOT NULL,
    `asset_id` INTEGER NOT NULL,

    PRIMARY KEY (`asset_pic_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Offer` (
    `offer_id` INTEGER NOT NULL AUTO_INCREMENT,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `offer_name` VARCHAR(191) NOT NULL,
    `offer_status` ENUM('CREATED', 'ACCEPTED', 'REJECTED') NOT NULL DEFAULT 'CREATED',
    `offeror_id` INTEGER NOT NULL,
    `swaper_id` INTEGER NOT NULL,
    `offeror_status` BOOLEAN NOT NULL DEFAULT false,
    `swaper_status` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`offer_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Offer_Asset` (
    `offer_asset_id` INTEGER NOT NULL AUTO_INCREMENT,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `offer_id` INTEGER NOT NULL,
    `asset_id` INTEGER NOT NULL,

    PRIMARY KEY (`offer_asset_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Message` (
    `message_id` INTEGER NOT NULL AUTO_INCREMENT,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `message_txt` VARCHAR(191) NOT NULL,
    `message_is_auto` BOOLEAN NOT NULL,
    `user_id` INTEGER NOT NULL,
    `offer_id` INTEGER NOT NULL,

    PRIMARY KEY (`message_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Asset` ADD CONSTRAINT `Asset_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Asset_Pic` ADD CONSTRAINT `Asset_Pic_asset_id_fkey` FOREIGN KEY (`asset_id`) REFERENCES `Asset`(`asset_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Offer` ADD CONSTRAINT `Offer_offeror_id_fkey` FOREIGN KEY (`offeror_id`) REFERENCES `User`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Offer` ADD CONSTRAINT `Offer_swaper_id_fkey` FOREIGN KEY (`swaper_id`) REFERENCES `User`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Offer_Asset` ADD CONSTRAINT `Offer_Asset_offer_id_fkey` FOREIGN KEY (`offer_id`) REFERENCES `Offer`(`offer_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Offer_Asset` ADD CONSTRAINT `Offer_Asset_asset_id_fkey` FOREIGN KEY (`asset_id`) REFERENCES `Asset`(`asset_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_offer_id_fkey` FOREIGN KEY (`offer_id`) REFERENCES `Offer`(`offer_id`) ON DELETE CASCADE ON UPDATE CASCADE;
