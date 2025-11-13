import { pgTable, text, timestamp, real, jsonb, boolean } from 'drizzle-orm/pg-core';

export const user = pgTable('user', {
	id: text('id').primaryKey(),
	email: text('email').notNull().unique(),
	name: text('name'),
	picture: text('picture'),
	provider: text('provider'), // 'google', 'microsoft', 'email'
	providerId: text('provider_id'),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow()
});

export const session = pgTable('session', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull()
});

export const magicLink = pgTable('magic_link', {
	id: text('id').primaryKey(),
	email: text('email').notNull(),
	token: text('token').notNull().unique(),
	expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull(),
	usedAt: timestamp('used_at', { withTimezone: true, mode: 'date' }),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow()
});

export const vehicle = pgTable('vehicle', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	type: text('type').notNull(), // 'truck', 'car', etc.
	plate: text('plate').unique(),
	imei: text('imei').unique(), // Device IMEI
	active: boolean('active').default(true),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow()
});

export const telemetry = pgTable('telemetry', {
	id: text('id').primaryKey(),
	vehicleId: text('vehicle_id')
		.notNull()
		.references(() => vehicle.id),
	timestamp: timestamp('timestamp', { withTimezone: true, mode: 'date' }).notNull(),
	latitude: real('latitude').notNull(),
	longitude: real('longitude').notNull(),
	speed: real('speed'), // km/h
	heading: real('heading'), // degrees
	altitude: real('altitude'), // meters
	accelerationX: real('acceleration_x'), // G-force
	accelerationY: real('acceleration_y'), // G-force
	accelerationZ: real('acceleration_z'), // G-force
	gForce: real('g_force'), // Calculated total G-force
	engineData: jsonb('engine_data'), // OBD2 data
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow()
});

export type Session = typeof session.$inferSelect;
export type User = typeof user.$inferSelect;
export type Vehicle = typeof vehicle.$inferSelect;
export type Telemetry = typeof telemetry.$inferSelect;
export type MagicLink = typeof magicLink.$inferSelect;
