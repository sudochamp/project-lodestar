<script lang="ts">
	let { data } = $props<{ data: { user: any } }>();
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-50">
	<div class="mx-auto max-w-4xl px-4 py-16">
		<div class="text-center">
			<h1 class="mb-4 text-5xl font-bold text-gray-900">Asset Tracker</h1>
			<p class="mb-8 text-xl text-gray-600">
				Real-time vehicle tracking with performance monitoring
			</p>

			<div class="mx-auto mb-12 max-w-md">
				{#if data.user}
					<a
						href="/dashboard"
						class="group relative block overflow-hidden rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 p-8 text-white shadow-xl transition-all hover:scale-105 hover:shadow-2xl"
					>
						<div
							class="absolute top-0 right-0 h-24 w-24 translate-x-8 -translate-y-8 transform rounded-full bg-white opacity-10 transition-transform group-hover:translate-x-6 group-hover:-translate-y-6"
						></div>
						<div
							class="absolute bottom-0 left-0 h-32 w-32 -translate-x-10 translate-y-10 transform rounded-full bg-white opacity-10 transition-transform group-hover:-translate-x-8 group-hover:translate-y-8"
						></div>

						<svg
							class="mx-auto mb-4 h-14 w-14"
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
						<h2 class="mb-3 text-2xl font-bold">Enter Dashboard</h2>
						<p class="mb-4 text-blue-100">Welcome back, {data.user.name || data.user.email}!</p>
						<p class="text-sm opacity-90">Access live tracking, fleet management, and analytics</p>
						<div class="mt-6 flex items-center justify-center">
							<span class="text-sm font-medium">Go to Dashboard →</span>
						</div>
					</a>

					<form method="POST" action="/auth/logout" class="mt-4 text-center">
						<p class="text-sm text-gray-600">
							Not you? <button type="submit" class="font-medium text-blue-600 hover:text-blue-700"
								>Sign out</button
							>
						</p>
					</form>
				{:else}
					<a
						href="/auth/login"
						class="group relative block overflow-hidden rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 p-8 text-white shadow-xl transition-all hover:scale-105 hover:shadow-2xl"
					>
						<div
							class="absolute top-0 right-0 h-24 w-24 translate-x-8 -translate-y-8 transform rounded-full bg-white opacity-10 transition-transform group-hover:translate-x-6 group-hover:-translate-y-6"
						></div>
						<div
							class="absolute bottom-0 left-0 h-32 w-32 -translate-x-10 translate-y-10 transform rounded-full bg-white opacity-10 transition-transform group-hover:-translate-x-8 group-hover:translate-y-8"
						></div>

						<svg
							class="mx-auto mb-4 h-14 w-14"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
							></path>
						</svg>
						<h2 class="mb-3 text-2xl font-bold">Get Started</h2>
						<p class="mb-4">Sign in to access the Asset Tracker dashboard</p>
						<p class="text-sm opacity-90">Monitor vehicles • Track performance • Manage fleet</p>
						<div class="mt-6 flex items-center justify-center">
							<span class="text-sm font-medium">Sign in →</span>
						</div>
					</a>
				{/if}
			</div>

			<div class="rounded-lg bg-white p-8 shadow-lg">
				<h3 class="mb-4 text-2xl font-semibold">Key Features</h3>
				<div class="grid grid-cols-1 gap-4 text-left md:grid-cols-2">
					<div class="flex items-start">
						<svg
							class="mt-1 mr-3 h-6 w-6 flex-shrink-0 text-blue-500"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M5 13l4 4L19 7"
							></path>
						</svg>
						<div>
							<h4 class="font-semibold">Real-time GPS Tracking</h4>
							<p class="text-sm text-gray-600">
								Live vehicle positions with adjustable update intervals
							</p>
						</div>
					</div>
					<div class="flex items-start">
						<svg
							class="mt-1 mr-3 h-6 w-6 flex-shrink-0 text-blue-500"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M5 13l4 4L19 7"
							></path>
						</svg>
						<div>
							<h4 class="font-semibold">Driving Performance</h4>
							<p class="text-sm text-gray-600">
								Monitor G-force, acceleration, and braking patterns
							</p>
						</div>
					</div>
					<div class="flex items-start">
						<svg
							class="mt-1 mr-3 h-6 w-6 flex-shrink-0 text-blue-500"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M5 13l4 4L19 7"
							></path>
						</svg>
						<div>
							<h4 class="font-semibold">OBD2 Integration</h4>
							<p class="text-sm text-gray-600">Read engine parameters and diagnostic data</p>
						</div>
					</div>
					<div class="flex items-start">
						<svg
							class="mt-1 mr-3 h-6 w-6 flex-shrink-0 text-blue-500"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M5 13l4 4L19 7"
							></path>
						</svg>
						<div>
							<h4 class="font-semibold">Fleet Management</h4>
							<p class="text-sm text-gray-600">Centralized control for multiple vehicles</p>
						</div>
					</div>
				</div>
			</div>

			<div class="mt-8 text-sm text-gray-500">
				<p>Hardware: SARA-R5 LTE/GPS Module + STM32F MCU</p>
			</div>
		</div>
	</div>
</div>
