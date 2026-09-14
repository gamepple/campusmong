CREATE TABLE `editor_sessions` (
  `token_hash` text PRIMARY KEY NOT NULL,
  `expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `editor_sessions_expires_at_idx` ON `editor_sessions` (`expires_at`);
