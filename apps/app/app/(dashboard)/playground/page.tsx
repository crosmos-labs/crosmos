import { notFound } from "next/navigation";
import { PlaygroundChat } from "@/components/playground-chat";

export default function PlaygroundPage() {
	if (process.env.NEXT_PUBLIC_PLAYGROUND_DISABLED === "true") notFound();
	return <PlaygroundChat />;
}
