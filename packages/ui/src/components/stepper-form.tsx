"use client";

import { Button } from "./button";
import { Field, FieldError, FieldGroup, FieldLabel } from "./field";
import { Input } from "./input";
import {
	IconArrowForward,
	IconChevronLeft,
	IconInfoCircle,
} from "@tabler/icons-react";
import { motion } from "motion/react";
import { useState } from "react";
import { z } from "zod";

export interface StepperStep {
	key: string;
	label: string;
	type?: string;
	placeholder: string;
	schema: z.ZodType;
}

const SPRING = { type: "spring", stiffness: 300, damping: 30 } as const;
const PROGRESS_SPRING = {
	type: "spring",
	stiffness: 100,
	damping: 20,
} as const;

function StepProgressBar({
	currentStep,
	totalSteps,
}: {
	currentStep: number;
	totalSteps: number;
}) {
	return (
		<div className="mb-10 flex gap-2">
			{Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
				<div
					key={step}
					className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-muted"
				>
					<motion.div
						animate={{ width: step <= currentStep ? "100%" : "0%" }}
						transition={PROGRESS_SPRING}
						className="absolute top-0 left-0 h-full bg-accent"
					/>
				</div>
			))}
		</div>
	);
}

function StepField({
	config,
	value,
	error,
	onChange,
	onSubmit,
}: {
	config: StepperStep;
	value: string;
	error: string;
	onChange: (value: string) => void;
	onSubmit: () => void;
}) {
	const id = `step-${config.key}`;
	return (
		<motion.div
			key={id}
			initial={{ opacity: 0, x: 20 }}
			animate={{ opacity: 1, x: 0 }}
			transition={SPRING}
		>
			<Field data-invalid={!!error}>
				<FieldLabel htmlFor={id} className="flex items-center gap-2">
					{config.label} <IconInfoCircle size={14} className="opacity-50" />
				</FieldLabel>
				<Input
					id={id}
					type={config.type}
					placeholder={config.placeholder}
					value={value}
					onChange={(e) => onChange(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === "Enter") onSubmit();
					}}
					aria-invalid={!!error}
					autoFocus
					className="h-13 text-base!"
				/>
				{error && <FieldError>{error}</FieldError>}
			</Field>
		</motion.div>
	);
}

export function StepperForm({
	steps,
	onSubmit,
	title = "Get Started",
	description = "Enter your details to continue.",
}: {
	steps: StepperStep[];
	onSubmit: (values: Record<string, string>) => void;
	title?: string;
	description?: string;
}) {
	const totalSteps = steps.length;
	const [currentStep, setCurrentStep] = useState(1);
	const [values, setValues] = useState<Record<string, string>>(
		Object.fromEntries(steps.map((s) => [s.key, ""])),
	);
	const [errors, setErrors] = useState<Record<string, string>>({});

	const cfg = steps[currentStep - 1]!;

	const handleNext = () => {
		const result = cfg.schema.safeParse(values[cfg.key]);
		if (!result.success) {
			setErrors({ [cfg.key]: result.error.errors[0]?.message ?? "" });
			return;
		}
		setErrors({});
		if (currentStep < totalSteps) setCurrentStep((s) => s + 1);
		else onSubmit(values);
	};

	const handleBack = () => {
		setErrors({});
		if (currentStep > 1) setCurrentStep((s) => s - 1);
	};

	return (
		<>
			<h1 className="mb-3 text-3xl font-semibold tracking-tight text-foreground">
				{title}
			</h1>
			<p className="mb-10 text-base text-muted-foreground">{description}</p>

			<StepProgressBar currentStep={currentStep} totalSteps={totalSteps} />

			<FieldGroup className="mb-10">
				<StepField
					config={cfg}
					value={values[cfg.key] ?? ""}
					error={errors[cfg.key] ?? ""}
					onChange={(v) => {
						setValues((prev) => ({ ...prev, [cfg.key]: v }));
						setErrors((prev) => ({ ...prev, [cfg.key]: "" }));
					}}
					onSubmit={handleNext}
				/>
			</FieldGroup>

			<div className="flex items-center gap-3">
				<Button
					variant="outline"
					size="lg"
					onClick={handleBack}
					disabled={currentStep === 1}
					className="shrink-0"
				>
					<IconChevronLeft />
				</Button>
				<Button
					onClick={handleNext}
					size="lg"
					className="flex-1 text-base! hover:bg-accent/90"
				>
					{currentStep === totalSteps ? "Submit" : "Continue"}
					<IconArrowForward data-icon="inline-end" />
				</Button>
			</div>
		</>
	);
}
