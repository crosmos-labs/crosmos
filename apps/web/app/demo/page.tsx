import Image from "next/image";
import Link from "next/link";
import { StepperForm } from "@/components/stepper-form";

export default function DemoPage() {
	return (
		<div className="h-screen grid grid-cols-1 md:grid-cols-5 overflow-hidden">
			<div className="col-span-3 p-6">
				<div>
					<Link href="/">
						<Image
							src="/banner_light.svg"
							alt="Crosmos"
							width={120}
							height={32}
							className="h-8 w-auto"
							priority
							unoptimized
						/>
					</Link>
				</div>
				<div className="size-full flex flex-col justify-center items-center px-4 md:px-8 -mt-20">
					<div className="w-full max-w-md">
						<StepperForm />
					</div>
				</div>
			</div>
			<div className="hidden md:block col-span-2 relative">
				<Image
					src="/side-bg.png"
					alt="side image"
					fill
					className="object-cover"
				/>
			</div>
		</div>
	);
}
