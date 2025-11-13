// Seed script for test vehicles
// This can be run via a server action or API endpoint

import { db } from './server/db';
import { vehicle } from './server/db/schema';

export async function seedVehicles() {
	const testVehicles = [
		{
			id: 'veh-001',
			name: 'Truck Alpha',
			type: 'truck',
			plate: 'ABC-1234',
			imei: '358901234567890',
			active: true
		},
		{
			id: 'veh-002',
			name: 'Truck Beta',
			type: 'truck',
			plate: 'XYZ-5678',
			imei: '358901234567891',
			active: true
		},
		{
			id: 'veh-003',
			name: 'Car Gamma',
			type: 'car',
			plate: 'DEF-9012',
			imei: '358901234567892',
			active: true
		},
		{
			id: 'veh-004',
			name: 'Van Delta',
			type: 'van',
			plate: 'GHI-3456',
			imei: '358901234567893',
			active: false
		}
	];

	try {
		for (const v of testVehicles) {
			await db.insert(vehicle).values(v).onConflictDoNothing();
		}
		console.log('Vehicles seeded successfully');
		return { success: true };
	} catch (error) {
		console.error('Error seeding vehicles:', error);
		return { success: false, error };
	}
}
