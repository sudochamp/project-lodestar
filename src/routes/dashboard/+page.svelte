<script lang="ts">
	import { MapLibre, Marker, NavigationControl, GeolocateControl, Popup } from 'svelte-maplibre';
	import { onMount } from 'svelte';
	import { enhance } from '$app/forms';

	let { data } = $props();

	// Navigation state
	let activeTab = $state<'tracking' | 'vehicles' | 'analytics'>('tracking');

	// Mock data for now - will be replaced with real-time data
	let vehicles = $state([
		{
			id: 'vehicle-1',
			name: 'Truck Alpha',
			position: { lng: 47.666, lat: 29.6301 },
			speed: 45,
			gForce: 0.2,
			heading: 2,
			status: 'moving'
		},
		{
			id: 'vehicle-2',
			name: 'Truck Beta',
			position: { lng: 48.00954611334021, lat: 29.181556228115717 },
			speed: 62,
			gForce: 0.1,
			heading: 180,
			status: 'moving'
		},
		{
			id: 'vehicle-3',
			name: 'Car Gamma',
			position: { lng: 48.132347935756606 , lat: 28.99160761578624 },
			speed: 0,
			gForce: 0,
			heading: 45,
			status: 'idle'
		}
	]);

	let selectedVehicle = $state<any>(null);
	let mapCenter = $state({ lng: 47.4305193064055, lat: 29.319008504933247 });
	let mapZoom = $state(8);

	// Performance metrics thresholds
    // TODO: Use dynamic variables instead that can be set in the admin dashboard.
	const HARSH_BRAKING_THRESHOLD = 0.4; // G-force
	const RAPID_ACCELERATION_THRESHOLD = 0.3; // G-force

	function getVehicleColor(vehicle: any) {
		if (vehicle.status === 'idle') return '#6b7280'; // gray
		if (vehicle.gForce > HARSH_BRAKING_THRESHOLD) return '#ef4444'; // red
		if (vehicle.gForce > RAPID_ACCELERATION_THRESHOLD) return '#f59e0b'; // amber
		return '#10b981'; // green
	}

	// Simulate real-time updates for demo
	onMount(() => {
		const interval = setInterval(() => {
			vehicles = vehicles.map((v) => {
				if (v.status === 'idle') return v;

				return {
					...v,
					position: {
						lng: v.position.lng + (Math.random() - 0.5) * 0.001,
						lat: v.position.lat + (Math.random() - 0.5) * 0.001
					},
					speed: Math.max(0, v.speed + (Math.random() - 0.5) * 5),
					gForce: Math.max(0, Math.min(1, v.gForce + (Math.random() - 0.5) * 0.1)),
					heading: (v.heading + (Math.random() - 0.5) * 5 + 360) % 360
				};
			});
		}, 2000);

		return () => clearInterval(interval);
	});
</script>

<div class="flex h-screen bg-gray-50">
	<!-- Sidebar -->
	<div class="w-80 overflow-y-auto bg-gray-900 p-4 text-white">
		<div class="mb-6 flex items-center justify-between">
			<h1 class="text-2xl font-bold">Asset Tracker</h1>
		</div>

		<!-- Navigation Tabs -->
		<nav class="mb-6">
			<button
				onclick={() => (activeTab = 'tracking')}
				class="mb-2 flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors {activeTab ===
				'tracking'
					? 'bg-blue-600 text-white'
					: 'text-gray-300 hover:bg-gray-800'}"
			>
				<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
					></path>
				</svg>
				<span class="font-medium">Live Tracking</span>
			</button>

			<button
				onclick={() => (activeTab = 'vehicles')}
				class="mb-2 flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors {activeTab ===
				'vehicles'
					? 'bg-blue-600 text-white'
					: 'text-gray-300 hover:bg-gray-800'}"
			>
				<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
					></path>
				</svg>
				<span class="font-medium">Fleet Management</span>
			</button>

			<button
				onclick={() => (activeTab = 'analytics')}
				class="mb-2 flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors {activeTab ===
				'analytics'
					? 'bg-blue-600 text-white'
					: 'text-gray-300 hover:bg-gray-800'}"
			>
				<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
					></path>
				</svg>
				<span class="font-medium">Analytics</span>
			</button>
		</nav>

		<hr class="mb-6 border-gray-700" />

		<!-- User Profile -->
		<div class="mb-6 rounded-lg bg-gray-800 p-4">
			<div class="mb-3 flex items-center gap-3">
				{#if data.user.picture}
					<img src={data.user.picture} alt={data.user.name} class="h-10 w-10 rounded-full" />
				{:else}
					<div class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-700">
						<span class="text-sm font-medium"
							>{(data.user.name || data.user.email)[0].toUpperCase()}</span
						>
					</div>
				{/if}
				<div class="min-w-0 flex-1">
					<p class="truncate text-sm font-medium">{data.user.name || 'User'}</p>
					<p class="truncate text-xs text-gray-400">{data.user.email}</p>
				</div>
			</div>
			<form method="POST" action="?/logout" use:enhance>
				<button
					type="submit"
					class="w-full rounded bg-gray-700 px-3 py-2 text-sm transition-colors hover:bg-gray-600"
				>
					Sign Out
				</button>
			</form>
		</div>

		<!-- Vehicle List (for tracking tab) -->
		{#if activeTab === 'tracking'}
			<div class="mb-6">
				<h2 class="mb-3 text-lg font-semibold">Active Vehicles ({vehicles.length})</h2>
				<div class="space-y-2">
					{#each vehicles as vehicle (vehicle.id)}
						<button
							class="w-full rounded-lg bg-gray-800 p-3 text-left transition-colors hover:bg-gray-700"
							class:ring-2={selectedVehicle?.id === vehicle.id}
							class:ring-blue-500={selectedVehicle?.id === vehicle.id}
							onclick={() => {
								selectedVehicle = vehicle;
								mapCenter = vehicle.position;
								mapZoom = 15;
							}}
						>
							<div class="flex items-center justify-between">
								<span class="font-medium">{vehicle.name}</span>
								<span
									class="h-3 w-3 rounded-full"
									style="background-color: {getVehicleColor(vehicle)}"
								></span>
							</div>
							<div class="mt-1 text-sm text-gray-400">
								Speed: {vehicle.speed.toFixed(1)} km/h
							</div>
							<div class="text-sm text-gray-400">
								G-Force: {vehicle.gForce.toFixed(2)}g
							</div>
						</button>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Performance Metrics -->
		{#if selectedVehicle}
			<div class="rounded-lg bg-gray-800 p-4">
				<h3 class="mb-3 font-semibold">Performance Metrics</h3>

				<div class="space-y-3">
					<div>
						<div class="text-sm text-gray-400">Speed</div>
						<div class="text-2xl font-bold">{selectedVehicle.speed.toFixed(1)} km/h</div>
					</div>

					<div>
						<div class="text-sm text-gray-400">G-Force</div>
						<div class="flex items-center gap-2">
							<div class="text-2xl font-bold">{selectedVehicle.gForce.toFixed(2)}g</div>
							{#if selectedVehicle.gForce > HARSH_BRAKING_THRESHOLD}
								<span class="rounded bg-red-500 px-2 py-1 text-xs">HARSH BRAKING</span>
							{:else if selectedVehicle.gForce > RAPID_ACCELERATION_THRESHOLD}
								<span class="rounded bg-amber-500 px-2 py-1 text-xs">RAPID ACCEL</span>
							{/if}
						</div>
					</div>

					<div>
						<div class="text-sm text-gray-400">Location</div>
						<div class="font-mono text-sm">
							{selectedVehicle.position.lat.toFixed(6)}, {selectedVehicle.position.lng.toFixed(6)}
						</div>
					</div>

					<div>
						<div class="text-sm text-gray-400">Heading</div>
						<div>{selectedVehicle.heading.toFixed(0)}°</div>
					</div>

					<div>
						<div class="text-sm text-gray-400">Status</div>
						<div class="capitalize">{selectedVehicle.status}</div>
					</div>
				</div>
			</div>
		{/if}

		<!-- Legend -->
		<div class="mt-6 rounded-lg bg-gray-800 p-4">
			<h3 class="mb-3 font-semibold">Status Legend</h3>
			<div class="space-y-2 text-sm">
				<div class="flex items-center gap-2">
					<span class="h-3 w-3 rounded-full bg-green-500"></span>
					<span>Normal Driving</span>
				</div>
				<div class="flex items-center gap-2">
					<span class="h-3 w-3 rounded-full bg-amber-500"></span>
					<span>Rapid Acceleration</span>
				</div>
				<div class="flex items-center gap-2">
					<span class="h-3 w-3 rounded-full bg-red-500"></span>
					<span>Harsh Braking</span>
				</div>
				<div class="flex items-center gap-2">
					<span class="h-3 w-3 rounded-full bg-gray-500"></span>
					<span>Idle</span>
				</div>
			</div>
		</div>
	</div>

	<!-- Main Content Area -->
	<div class="relative flex-1">
		{#if activeTab === 'tracking'}
			<MapLibre
				style="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
				class="h-full w-full"
				bind:center={mapCenter}
				bind:zoom={mapZoom}
			>
				<NavigationControl position="top-right" />
				<GeolocateControl position="top-right" />

				{#each vehicles as vehicle (vehicle.id) }
					<Marker lngLat={vehicle.position} anchor="center">
						<div class="relative" style="transform: rotate({vehicle.heading}deg)">
							<!-- Vehicle icon -->
							<div class="relative" style="transform: rotate({vehicle.heading}deg)">
								<!-- Vehicle icon -->
								<button
									class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-0 shadow-lg"
									style="background-color: {getVehicleColor(vehicle)}"
									onclick={() => (selectedVehicle = vehicle)}
									aria-label="Select {vehicle.name}"
								>
									<svg
										class="h-5 w-5 text-white"
										fill="currentColor"
										viewBox="0 0 24 24"
										style="transform: rotate(-90deg)"
									>
										<path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
									</svg>
								</button>

								<!-- Vehicle name label -->
								<div
									class="absolute -bottom-6 left-1/2 -translate-x-1/2 transform whitespace-nowrap"
								>
									<span class="rounded bg-gray-900 px-2 py-1 text-xs text-white shadow">
										{vehicle.name}
									</span>
								</div>
							</div>

							<Popup offset={[0, -20]}>
								<div class="p-2">
									<h3 class="font-semibold">{vehicle.name}</h3>
									<div class="mt-1 space-y-1 text-sm">
										<div>Speed: {vehicle.speed.toFixed(1)} km/h</div>
										<div>G-Force: {vehicle.gForce.toFixed(2)}g</div>
										<div>Heading: {vehicle.heading.toFixed(0)}°</div>
									</div>
								</div>
							</Popup>
						</div></Marker
					>
				{/each}
			</MapLibre>

			<!-- Real-time Status Overlay -->
			<div class="absolute top-4 left-4 rounded-lg bg-white p-4 shadow-lg">
				<h2 class="mb-2 font-semibold">Fleet Status</h2>
				<div class="flex gap-4 text-sm">
					<div>
						<span class="text-gray-500">Active:</span>
						<span class="ml-1 font-bold"
							>{vehicles.filter((v) => v.status === 'moving').length}</span
						>
					</div>
					<div>
						<span class="text-gray-500">Idle:</span>
						<span class="ml-1 font-bold">{vehicles.filter((v) => v.status === 'idle').length}</span>
					</div>
					<div>
						<span class="text-gray-500">Alerts:</span>
						<span class="ml-1 font-bold text-red-500">
							{vehicles.filter((v) => v.gForce > HARSH_BRAKING_THRESHOLD).length}
						</span>
					</div>
				</div>
			</div>

			<!-- Speed/Performance Indicator -->
			{#if selectedVehicle}
				<div class="absolute bottom-4 left-4 min-w-[200px] rounded-lg bg-white p-4 shadow-lg">
					<h3 class="mb-2 font-semibold">{selectedVehicle.name}</h3>
					<div class="space-y-2">
						<div class="flex justify-between">
							<span class="text-gray-500">Speed:</span>
							<span class="font-bold">{selectedVehicle.speed.toFixed(1)} km/h</span>
						</div>
						<div class="flex justify-between">
							<span class="text-gray-500">G-Force:</span>
							<span class="font-bold" style="color: {getVehicleColor(selectedVehicle)}">
								{selectedVehicle.gForce.toFixed(2)}g
							</span>
						</div>
					</div>
				</div>
			{/if}
		{:else if activeTab === 'vehicles'}
			<!-- Fleet Management View -->
			<div class="h-full overflow-auto bg-gray-50 p-6">
				<div class="mx-auto max-w-6xl">
					<div class="mb-6 flex items-center justify-between">
						<h2 class="text-2xl font-bold text-gray-900">Fleet Management</h2>
						<button class="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
							+ Add Vehicle
						</button>
					</div>

					<div class="rounded-lg bg-white shadow">
						<table class="w-full">
							<thead class="border-b bg-gray-50">
								<tr>
									<th
										class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
										>Vehicle</th
									>
									<th
										class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
										>Type</th
									>
									<th
										class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
										>Status</th
									>
									<th
										class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
										>Speed</th
									>
									<th
										class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
										>Last Update</th
									>
									<th
										class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
										>Actions</th
									>
								</tr>
							</thead>
							<tbody class="divide-y divide-gray-200">
								{#each vehicles as vehicle (vehicle.id)}
									<tr class="hover:bg-gray-50">
										<td class="px-6 py-4 whitespace-nowrap">
											<div class="flex items-center">
												<div class="h-10 w-10 flex-shrink-0">
													<div
														class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200"
													>
														<svg
															class="h-5 w-5 text-gray-600"
															fill="currentColor"
															viewBox="0 0 24 24"
														>
															<path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
														</svg>
													</div>
												</div>
												<div class="ml-4">
													<div class="text-sm font-medium text-gray-900">{vehicle.name}</div>
													<div class="text-sm text-gray-500">ID: {vehicle.id}</div>
												</div>
											</div>
										</td>
										<td class="px-6 py-4 whitespace-nowrap">
											<span
												class="inline-flex rounded-full bg-blue-100 px-2 text-xs leading-5 font-semibold text-blue-800"
											>
												Truck
											</span>
										</td>
										<td class="px-6 py-4 whitespace-nowrap">
											<span
												class="inline-flex rounded-full px-2 text-xs leading-5 font-semibold {vehicle.status ===
												'moving'
													? 'bg-green-100 text-green-800'
													: 'bg-gray-100 text-gray-800'}"
											>
												{vehicle.status}
											</span>
										</td>
										<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
											{vehicle.speed.toFixed(1)} km/h
										</td>
										<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-500"> Just now </td>
										<td class="px-6 py-4 text-sm font-medium whitespace-nowrap">
											<button class="text-indigo-600 hover:text-indigo-900">Edit</button>
											<button class="ml-4 text-red-600 hover:text-red-900">Remove</button>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		{:else if activeTab === 'analytics'}
			<!-- Analytics View -->
			<div class="h-full overflow-auto bg-gray-50 p-6">
				<div class="mx-auto max-w-6xl">
					<h2 class="mb-6 text-2xl font-bold text-gray-900">Analytics Dashboard</h2>

					<!-- Stats Grid -->
					<div class="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
						<div class="rounded-lg bg-white p-6 shadow">
							<div class="flex items-center">
								<div class="rounded-lg bg-blue-100 p-3">
									<svg
										class="h-6 w-6 text-blue-600"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
										></path>
									</svg>
								</div>
								<div class="ml-4">
									<p class="text-sm font-medium text-gray-600">Total Vehicles</p>
									<p class="text-2xl font-semibold text-gray-900">{vehicles.length}</p>
								</div>
							</div>
						</div>

						<div class="rounded-lg bg-white p-6 shadow">
							<div class="flex items-center">
								<div class="rounded-lg bg-green-100 p-3">
									<svg
										class="h-6 w-6 text-green-600"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M13 10V3L4 14h7v7l9-11h-7z"
										></path>
									</svg>
								</div>
								<div class="ml-4">
									<p class="text-sm font-medium text-gray-600">Active Now</p>
									<p class="text-2xl font-semibold text-gray-900">
										{vehicles.filter((v) => v.status === 'moving').length}
									</p>
								</div>
							</div>
						</div>

						<div class="rounded-lg bg-white p-6 shadow">
							<div class="flex items-center">
								<div class="rounded-lg bg-yellow-100 p-3">
									<svg
										class="h-6 w-6 text-yellow-600"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
										></path>
									</svg>
								</div>
								<div class="ml-4">
									<p class="text-sm font-medium text-gray-600">Avg Speed</p>
									<p class="text-2xl font-semibold text-gray-900">
										{(vehicles.reduce((acc, v) => acc + v.speed, 0) / vehicles.length).toFixed(1)} km/h
									</p>
								</div>
							</div>
						</div>

						<div class="rounded-lg bg-white p-6 shadow">
							<div class="flex items-center">
								<div class="rounded-lg bg-red-100 p-3">
									<svg
										class="h-6 w-6 text-red-600"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
										></path>
									</svg>
								</div>
								<div class="ml-4">
									<p class="text-sm font-medium text-gray-600">Alerts Today</p>
									<p class="text-2xl font-semibold text-gray-900">
										{vehicles.filter((v) => v.gForce > 0.4).length}
									</p>
								</div>
							</div>
						</div>
					</div>

					<!-- Charts Placeholder -->
					<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
						<div class="rounded-lg bg-white p-6 shadow">
							<h3 class="mb-4 text-lg font-semibold text-gray-900">Performance Over Time</h3>
							<div class="flex h-64 items-center justify-center rounded bg-gray-50">
								<p class="text-gray-500">Chart will be displayed here</p>
							</div>
						</div>

						<div class="rounded-lg bg-white p-6 shadow">
							<h3 class="mb-4 text-lg font-semibold text-gray-900">Driver Behavior Analysis</h3>
							<div class="flex h-64 items-center justify-center rounded bg-gray-50">
								<p class="text-gray-500">Chart will be displayed here</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	:global(.maplibregl-popup-content) {
		padding: 0 !important;
		border-radius: 0.5rem;
		overflow: hidden;
	}

	:global(.maplibregl-popup-anchor-top .maplibregl-popup-tip) {
		border-bottom-color: white;
	}
</style>
