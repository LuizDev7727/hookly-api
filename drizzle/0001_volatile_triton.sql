ALTER TABLE "webhooks" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "webhooks" DROP COLUMN "cread_at";