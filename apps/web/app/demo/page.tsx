"use client";

import { Button } from "@crosmos/ui/components/button";
import { IconArrowForward, IconMailFilled } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@crosmos/ui/components/input-group";

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
				<div className="size-full flex flex-col justify-center items-center px-8 md:px-12 space-y-12">
					<div>
						<h1 className="text-6xl font-semibold text-wrap text-center">
							What <span className="text-accent">begins</span> as structure
							becomes expression
						</h1>
					</div>
					<div className="flex justify-between items-center gap-4">
						<InputGroup className="py-6 px-1">
							<InputGroupInput type="email" placeholder="something@cool.com" autoFocus className="text-lg!"/>
							<InputGroupAddon>
								<IconMailFilled className="mt-1 mr-1 size-5"/>
							</InputGroupAddon>
						</InputGroup>
						<Button size="lg" className="p-6 text-lg" type="submit">
							<IconArrowForward className="size-6"/>
							Submit
						</Button>
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
