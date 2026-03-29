ALTER TABLE `users` DROP INDEX `users_openId_unique`;--> statement-breakpoint
ALTER TABLE `users` ADD `clerkId` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_clerkId_unique` UNIQUE(`clerkId`);--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `openId`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `loginMethod`;