DO $$ BEGIN
 CREATE TYPE "device_status" AS ENUM('online', 'offline', 'maintenance');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "gateway_action" AS ENUM('CREATED', 'UPDATED', 'DEVICE_ATTACHED', 'DEVICE_DETACHED', 'DELETED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "gateway_status" AS ENUM('active', 'inactive', 'decommissioned');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "device_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "device_types_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "gateway_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"gateway_id" uuid NOT NULL,
	"action" "gateway_action" NOT NULL,
	"details" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "gateways" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"serial_number" varchar(100) NOT NULL,
	"name" varchar(255) NOT NULL,
	"ipv4_address" "inet" NOT NULL,
	"status" "gateway_status" DEFAULT 'active' NOT NULL,
	"location" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "gateways_serial_number_unique" UNIQUE("serial_number"),
	CONSTRAINT "gateways_ipv4_address_unique" UNIQUE("ipv4_address")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "peripheral_devices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"uid" bigint NOT NULL,
	"vendor" varchar(100) NOT NULL,
	"status" "device_status" DEFAULT 'offline' NOT NULL,
	"gateway_id" uuid,
	"device_type_id" serial NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_seen_at" timestamp,
	CONSTRAINT "peripheral_devices_uid_unique" UNIQUE("uid")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "gateway_logs" ADD CONSTRAINT "gateway_logs_gateway_id_gateways_id_fk" FOREIGN KEY ("gateway_id") REFERENCES "gateways"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "peripheral_devices" ADD CONSTRAINT "peripheral_devices_gateway_id_gateways_id_fk" FOREIGN KEY ("gateway_id") REFERENCES "gateways"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "peripheral_devices" ADD CONSTRAINT "peripheral_devices_device_type_id_device_types_id_fk" FOREIGN KEY ("device_type_id") REFERENCES "device_types"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
