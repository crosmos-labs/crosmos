export function Example() {
	return (
		<section className="py-24 px-6">
			<div className="max-w-7xl mx-auto">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
					{/* Left: Code Example */}
					<div>
						<h2 className="text-3xl font-bold mb-8">SDK Example</h2>
						<div className="bg-foreground text-background rounded-lg p-8 overflow-x-auto font-mono text-sm">
							<pre>{`import { Crosmos } from '@crosmos/sdk'

const crosmos = new Crosmos({
  token: process.env.CROSMOS_TOKEN
})

async function generateCode(prompt) {
  const result = await crosmos.generate({
    repo: 'my-project',
    prompt: prompt,
    model: 'crosmos-v1'
  })
  return result.code
}

const code = await generateCode(
  'Create a login form component'
)`}</pre>
						</div>
					</div>

					{/* Right: Desktop Preview */}
					<div>
						<h2 className="text-3xl font-bold mb-8">Desktop Application</h2>
						<div className="bg-card rounded-lg p-8 border border-border space-y-6">
							<div className="bg-foreground/5 rounded h-40 flex items-center justify-center">
								<p className="text-foreground/50">
									Interactive playground coming soon
								</p>
							</div>
							<p className="text-foreground/70 text-sm">
								Our desktop application provides a full-featured IDE for
								managing your code generation workflows with real-time
								collaboration.
							</p>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
