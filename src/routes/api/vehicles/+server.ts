import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { vehicle } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

// GET all vehicles
export const GET: RequestHandler = async ({ url }) => {
	try {
		const activeOnly = url.searchParams.get('active') === 'true';

		const vehicles = activeOnly
			? await db.select().from(vehicle).where(eq(vehicle.active, true))
			: await db.select().from(vehicle);

		return json({
			success: true,
			data: vehicles
		});
	} catch (error) {
		console.error('Error fetching vehicles:', error);
		return json(
			{
				success: false,
				error: 'Failed to fetch vehicles'
			},
			{ status: 500 }
		);
	}
};

// POST new vehicle
export const POST: RequestHandler = async ({ request }) => {
	try {
		const data = await request.json();

		// Validate required fields
		if (!data.name || !data.type) {
			return json(
				{
					success: false,
					error: 'Missing required fields: name and type'
				},
				{ status: 400 }
			);
		}

		// Create new vehicle
		const newVehicle = await db
			.insert(vehicle)
			.values({
				id: crypto.randomUUID(),
				name: data.name,
				type: data.type,
				plate: data.plate || null,
				imei: data.imei || null,
				active: data.active !== undefined ? data.active : true
			})
			.returning();

		return json({
			success: true,
			data: newVehicle[0]
		});
	} catch (error) {
		console.error('Error creating vehicle:', error);
		return json(
			{
				success: false,
				error: 'Failed to create vehicle'
			},
			{ status: 500 }
		);
	}
};

// PATCH update vehicle
export const PATCH: RequestHandler = async ({ request }) => {
	try {
		const data = await request.json();

		if (!data.id) {
			return json(
				{
					success: false,
					error: 'Vehicle ID is required'
				},
				{ status: 400 }
			);
		}

		// Update vehicle
		const updatedVehicle = await db
			.update(vehicle)
			.set({
				...data,
				updatedAt: new Date()
			})
			.where(eq(vehicle.id, data.id))
			.returning();

		if (updatedVehicle.length === 0) {
			return json(
				{
					success: false,
					error: 'Vehicle not found'
				},
				{ status: 404 }
			);
		}

		return json({
			success: true,
			data: updatedVehicle[0]
		});
	} catch (error) {
		console.error('Error updating vehicle:', error);
		return json(
			{
				success: false,
				error: 'Failed to update vehicle'
			},
			{ status: 500 }
		);
	}
};
