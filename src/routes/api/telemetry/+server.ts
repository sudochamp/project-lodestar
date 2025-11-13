import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { telemetry, vehicle } from '$lib/server/db/schema';
import { desc, eq } from 'drizzle-orm';

// GET latest telemetry for all vehicles
export const GET: RequestHandler = async () => {
	try {
		// Get all active vehicles
		const vehicles = await db.select().from(vehicle).where(eq(vehicle.active, true));

		// Get latest telemetry for each vehicle
		const telemetryData = await Promise.all(
			vehicles.map(async (v) => {
				const latest = await db
					.select()
					.from(telemetry)
					.where(eq(telemetry.vehicleId, v.id))
					.orderBy(desc(telemetry.timestamp))
					.limit(1);

				return {
					vehicle: v,
					telemetry: latest[0] || null
				};
			})
		);

		return json({
			success: true,
			data: telemetryData
		});
	} catch (error) {
		console.error('Error fetching telemetry:', error);
		return json(
			{
				success: false,
				error: 'Failed to fetch telemetry data'
			},
			{ status: 500 }
		);
	}
};

// POST new telemetry data (from hardware)
export const POST: RequestHandler = async ({ request }) => {
	try {
		const data = await request.json();

		// Validate required fields
		if (!data.vehicleId || !data.latitude || !data.longitude) {
			return json(
				{
					success: false,
					error: 'Missing required fields'
				},
				{ status: 400 }
			);
		}

		// Calculate G-force from acceleration if provided
		let gForce = 0;
		if (
			data.accelerationX !== undefined ||
			data.accelerationY !== undefined ||
			data.accelerationZ !== undefined
		) {
			gForce =
				Math.sqrt(
					Math.pow(data.accelerationX || 0, 2) +
						Math.pow(data.accelerationY || 0, 2) +
						Math.pow(data.accelerationZ || 0, 2)
				) / 9.8;
		}

		// Insert new telemetry record
		const newTelemetry = await db
			.insert(telemetry)
			.values({
				id: crypto.randomUUID(),
				vehicleId: data.vehicleId,
				timestamp: new Date(data.timestamp || Date.now()),
				latitude: data.latitude,
				longitude: data.longitude,
				speed: data.speed || 0,
				heading: data.heading || 0,
				altitude: data.altitude || null,
				accelerationX: data.accelerationX || null,
				accelerationY: data.accelerationY || null,
				accelerationZ: data.accelerationZ || null,
				gForce: gForce,
				engineData: data.engineData || null
			})
			.returning();

		return json({
			success: true,
			data: newTelemetry[0]
		});
	} catch (error) {
		console.error('Error saving telemetry:', error);
		return json(
			{
				success: false,
				error: 'Failed to save telemetry data'
			},
			{ status: 500 }
		);
	}
};
