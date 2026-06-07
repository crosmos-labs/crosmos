import { notFound } from "next/navigation";
import { PlaygroundChat } from "@/components/playground-chat";
import { isPlaygroundDisabled } from "@/lib/features";

export default function PlaygroundPage() {
	if (isPlaygroundDisabled) notFound();

	return <PlaygroundChat />;
}
