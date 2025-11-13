<script lang="ts">
	import { enhance } from '$app/forms';

	export let form: { error?: string; success?: boolean } | null = null;

	let email = '';
	let isLoading = false;
	let emailSent = false;
</script>

<div
	class="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4"
>
	<div class="w-full max-w-md">
		<div class="rounded-2xl bg-white p-8 shadow-xl">
			<!-- Header -->
			<div class="mb-8 text-center">
				<div
					class="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600"
				>
					<svg class="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
						></path>
					</svg>
				</div>
				<h1 class="text-2xl font-bold text-gray-900">Welcome Back</h1>
				<p class="mt-2 text-gray-600">Sign in to access Asset Tracker</p>
			</div>

			{#if form?.error}
				<div class="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
					{form.error}
				</div>
			{/if}

			{#if emailSent}
				<div class="py-8 text-center">
					<div
						class="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100"
					>
						<svg
							class="h-8 w-8 text-green-600"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
							></path>
						</svg>
					</div>
					<h2 class="mb-2 text-xl font-semibold text-gray-900">Check Your Email</h2>
					<p class="mb-6 text-gray-600">We've sent a magic link to <strong>{email}</strong></p>
					<p class="text-sm text-gray-500">
						Click the link in the email to sign in. The link expires in 15 minutes.
					</p>
					<button
						onclick={() => {
							emailSent = false;
							email = '';
						}}
						class="mt-6 text-sm font-medium text-blue-600 hover:text-blue-700"
					>
						← Back to login
					</button>
				</div>
			{:else}
				<!-- OAuth Buttons -->
				<div class="space-y-3">
					<form action="?/google" method="POST">
						<button
							type="submit"
							class="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 px-4 py-3 transition-colors hover:bg-gray-50"
						>
							<svg class="h-5 w-5" viewBox="0 0 24 24">
								<path
									fill="#4285F4"
									d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
								/>
								<path
									fill="#34A853"
									d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
								/>
								<path
									fill="#FBBC05"
									d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
								/>
								<path
									fill="#EA4335"
									d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
								/>
							</svg>
							<span class="font-medium text-gray-700">Continue with Google</span>
						</button>
					</form>

					<form action="?/microsoft" method="POST">
						<button
							type="submit"
							class="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 px-4 py-3 transition-colors hover:bg-gray-50"
						>
							<svg class="h-5 w-5" viewBox="0 0 23 23">
								<path fill="#f35325" d="M1 1h10v10H1z" />
								<path fill="#81bc06" d="M12 1h10v10H12z" />
								<path fill="#05a6f0" d="M1 12h10v10H1z" />
								<path fill="#ffba08" d="M12 12h10v10H12z" />
							</svg>
							<span class="font-medium text-gray-700">Continue with Microsoft</span>
						</button>
					</form>
				</div>

				<div class="relative my-6">
					<div class="absolute inset-0 flex items-center">
						<div class="w-full border-t border-gray-300"></div>
					</div>
					<div class="relative flex justify-center text-sm">
						<span class="bg-white px-4 text-gray-500">Or continue with email</span>
					</div>
				</div>

				<!-- Email Form -->
				<form
					method="POST"
					action="?/email"
					use:enhance={() => {
						isLoading = true;
						return async ({ result, update }) => {
							isLoading = false;
							if (result.type === 'success') {
								emailSent = true;
							}
							await update();
						};
					}}
				>
					<div class="space-y-4">
						<div>
							<label for="email" class="mb-1 block text-sm font-medium text-gray-700">
								Email Address
							</label>
							<input
								type="email"
								id="email"
								name="email"
								bind:value={email}
								required
								placeholder="you@example.com"
								class="w-full rounded-lg border border-gray-300 px-4 py-3 transition-all outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500"
							/>
						</div>

						<button
							type="submit"
							disabled={isLoading}
							class="w-full rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 font-medium text-white transition-all hover:from-blue-700 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
						>
							{#if isLoading}
								<span class="inline-flex items-center">
									<svg
										class="mr-3 -ml-1 h-5 w-5 animate-spin text-white"
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
									>
										<circle
											class="opacity-25"
											cx="12"
											cy="12"
											r="10"
											stroke="currentColor"
											stroke-width="4"
										></circle>
										<path
											class="opacity-75"
											fill="currentColor"
											d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
										></path>
									</svg>
									Sending...
								</span>
							{:else}
								Send Magic Link
							{/if}
						</button>
					</div>
				</form>

				<p class="mt-6 text-center text-sm text-gray-600">
					No password required • Secure sign-in link sent to your email
				</p>
			{/if}
		</div>

		<p class="mt-8 text-center text-sm text-gray-600">
			By signing in, you agree to our Terms of Service and Privacy Policy
		</p>
	</div>
</div>
