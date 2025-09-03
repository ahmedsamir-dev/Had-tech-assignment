import {
  pgTable,
  uuid,
  varchar,
  inet,
  timestamp,
  pgEnum,
  text,
  bigint,
  serial,
  jsonb,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const gatewayStatusEnum = pgEnum('gateway_status', [
  'active',
  'inactive',
  'decommissioned',
]);
export const deviceStatusEnum = pgEnum('device_status', [
  'online',
  'offline',
  'maintenance',
]);
export const gatewayActionEnum = pgEnum('gateway_action', [
  'CREATED',
  'UPDATED',
  'DEVICE_ATTACHED',
  'DEVICE_DETACHED',
  'DELETED',
]);

export const deviceTypes = pgTable('device_types', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const gateways = pgTable('gateways', {
  id: uuid('id').primaryKey().defaultRandom(),
  serialNumber: varchar('serial_number', { length: 100 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  ipv4Address: inet('ipv4_address').notNull().unique(),
  status: gatewayStatusEnum('status').notNull().default('active'),
  location: varchar('location', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const peripheralDevices = pgTable('peripheral_devices', {
  id: uuid('id').primaryKey().defaultRandom(),
  uid: bigint('uid', { mode: 'number' }).notNull().unique(),
  vendor: varchar('vendor', { length: 100 }).notNull(),
  status: deviceStatusEnum('status').notNull().default('offline'),
  gatewayId: uuid('gateway_id').references(() => gateways.id, {
    onDelete: 'set null',
  }),
  deviceTypeId: serial('device_type_id')
    .references(() => deviceTypes.id)
    .notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  lastSeenAt: timestamp('last_seen_at'),
});

export const gatewayLogs = pgTable('gateway_logs', {
  id: serial('id').primaryKey(),
  gatewayId: uuid('gateway_id')
    .references(() => gateways.id, { onDelete: 'cascade' })
    .notNull(),
  action: gatewayActionEnum('action').notNull(),
  details: jsonb('details'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const gatewayRelations = relations(gateways, ({ many }) => ({
  devices: many(peripheralDevices),
  logs: many(gatewayLogs),
}));

export const deviceRelations = relations(peripheralDevices, ({ one }) => ({
  gateway: one(gateways, {
    fields: [peripheralDevices.gatewayId],
    references: [gateways.id],
  }),
  deviceType: one(deviceTypes, {
    fields: [peripheralDevices.deviceTypeId],
    references: [deviceTypes.id],
  }),
}));

export const deviceTypeRelations = relations(deviceTypes, ({ many }) => ({
  devices: many(peripheralDevices),
}));

export const gatewayLogRelations = relations(gatewayLogs, ({ one }) => ({
  gateway: one(gateways, {
    fields: [gatewayLogs.gatewayId],
    references: [gateways.id],
  }),
}));
