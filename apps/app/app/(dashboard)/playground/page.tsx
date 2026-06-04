import { notFound } from "next/navigation";
import { PlaygroundChat } from "@/components/playground-chat";

export default function PlaygroundPage() {
	if (process.env.PLAYGROUND_DISABLED === "true") notFound();
	return <PlaygroundChat />;
}
