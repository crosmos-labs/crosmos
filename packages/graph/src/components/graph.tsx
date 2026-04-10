import { Button } from "@crosmos/ui/components/button";
import { ButtonGroup } from "@crosmos/ui/components/button-group";
import { Card, CardTitle } from "@crosmos/ui/components/card";
import { IconMaximize, IconMinus, IconPlus } from "@tabler/icons-react";
import { forceLink, forceManyBody, forceX, forceY } from "d3-force";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ForceGraph2D, {
	type ForceGraphMethods,
	type LinkObject,
	type NodeObject,
} from "react-force-graph-2d";
import { FORCE_CONFIG, GRAPH_CONFIG } from "../constants";
import { MOCK_EDGES, MOCK_ENTITIES } from "../data/mock-data";
import type { GraphData, GraphLink, GraphNode } from "../types/graph";

export function MemoryGraph() {
	const graphRef = useRef<ForceGraphMethods>(undefined);
	const [highlightNodes, setHighlightNodes] = useState<Set<number>>(new Set());
	const [highlightLinks, setHighlightLinks] = useState<Set<number>>(new Set());
	const initialZoomRef = useRef(false);

	// Build neighbor + link lookup maps once
	const data: GraphData = useMemo(() => {
		const nodes = MOCK_ENTITIES.map((e) => ({
			...e,
			neighbors: [] as number[],
			links: [] as number[],
		}));
		const links = MOCK_EDGES.map((e) => ({
			...e,
			source: e.source_entity_id,
			target: e.target_entity_id,
		}));

		// Cross-link so we can traverse neighbors on hover
		const nodeById = new Map(nodes.map((n) => [n.id, n]));
		links.forEach((link) => {
			const a = nodeById.get(link.source_entity_id);
			const b = nodeById.get(link.target_entity_id);
			if (a && b) {
				a.neighbors.push(b.id);
				b.neighbors.push(a.id);
				a.links.push(link.id);
				b.links.push(link.id);
			}
		});

		return { nodes, links };
	}, []);

	useEffect(() => {
		if (!graphRef.current) return;

		// graphRef.current.d3Force("collide", forceCollide(40).strength(0.5));
		graphRef.current.d3Force(
			"link",
			forceLink().distance(FORCE_CONFIG.linkDistance),
		);
		graphRef.current.d3Force(
			"charge",
			forceManyBody().strength(FORCE_CONFIG.chargeStrength),
		);
		graphRef.current.d3Force(
			"x",
			forceX(0).strength(FORCE_CONFIG.centeringStrength),
		);
		graphRef.current.d3Force(
			"y",
			forceY(0).strength(FORCE_CONFIG.centeringStrength),
		);
		graphRef.current.d3Force("center", null);

		graphRef.current.d3ReheatSimulation();
	}, []);

	const handleNodeHover = useCallback((node: NodeObject | null) => {
		const newNodes = new Set<number>();
		const newLinks = new Set<number>();

		if (node) {
			const gNode = node as GraphNode & {
				neighbors: number[];
				links: number[];
			};
			newNodes.add(gNode.id);
			gNode.neighbors?.forEach((id) => {
				newNodes.add(id);
			});
			gNode.links?.forEach((id) => {
				newLinks.add(id);
			});
		}

		setHighlightNodes(newNodes);
		setHighlightLinks(newLinks);
	}, []);

	const handleLinkHover = useCallback((link: LinkObject | null) => {
		const newNodes = new Set<number>();
		const newLinks = new Set<number>();

		if (link) {
			const gLink = link as GraphLink;
			newLinks.add(gLink.id);
			const src =
				typeof gLink.source === "object" ? gLink.source.id : gLink.source;
			const tgt =
				typeof gLink.target === "object" ? gLink.target.id : gLink.target;
			newNodes.add(src);
			newNodes.add(tgt);
		}

		setHighlightNodes(newNodes);
		setHighlightLinks(newLinks);
	}, []);

	const isAnyHighlighted = highlightNodes.size > 0 || highlightLinks.size > 0;

	const drawNode = useCallback(
		(node: NodeObject, ctx: CanvasRenderingContext2D, globalScale: number) => {
			const gNode = node as GraphNode;
			const x = gNode.x ?? 0;
			const y = gNode.y ?? 0;
			const size = GRAPH_CONFIG.radius;

			const dimmed = isAnyHighlighted && !highlightNodes.has(gNode.id);
			ctx.globalAlpha = dimmed ? GRAPH_CONFIG.dim_opacity : 1;

			ctx.beginPath();
			ctx.arc(x, y, size, 0, 2 * Math.PI);
			ctx.fillStyle = "#4f46e5";
			ctx.fill();
			ctx.strokeStyle = "#fff";
			ctx.lineWidth = 2 / globalScale;
			ctx.stroke();

			ctx.globalAlpha = 1; // always reset
		},
		[highlightNodes, isAnyHighlighted],
	);

	const drawLink = useCallback(
		(link: LinkObject, ctx: CanvasRenderingContext2D, globalScale: number) => {
			const gLink = link as GraphLink;
			const start = gLink.source as GraphNode;
			const end = gLink.target as GraphNode;

			if (!start.x || !start.y || !end.x || !end.y) return;

			const dimmed = isAnyHighlighted && !highlightLinks.has(gLink.id);
			ctx.globalAlpha = dimmed ? GRAPH_CONFIG.dim_opacity : 1;

			ctx.beginPath();
			ctx.moveTo(start.x, start.y);
			ctx.lineTo(end.x, end.y);
			ctx.strokeStyle = "#94a3b8";
			ctx.lineWidth = 1 / globalScale;
			ctx.stroke();

			if (
				globalScale > GRAPH_CONFIG.zoom_threshold ||
				(!dimmed && highlightLinks.size > 0)
			) {
				const label = gLink.relation_type.toLowerCase();
				const fontSize = Math.min(24, 14 / globalScale);
				const midX = (start.x + end.x) / 2;
				const midY = (start.y + end.y) / 2;
				const angle = Math.atan2(end.y - start.y, end.x - start.x);

				ctx.save();
				ctx.translate(midX, midY);
				ctx.rotate(
					angle > Math.PI / 2 || angle < -Math.PI / 2 ? angle + Math.PI : angle,
				);
				ctx.font = `${fontSize}px sans-serif`;
				ctx.textAlign = "center";
				ctx.textBaseline = "middle";

				const textWidth = ctx.measureText(label).width;
				ctx.fillStyle = "#fcfbf3";
				ctx.fillRect(
					-textWidth / 2 - 2,
					-fontSize / 2 - 1,
					textWidth + 4,
					fontSize + 2,
				);
				ctx.fillStyle = "#475569";
				ctx.fillText(label, 0, 0);
				ctx.restore();
			}

			ctx.globalAlpha = 1; // always reset
		},
		[highlightLinks, highlightNodes, isAnyHighlighted],
	);

	const handleZoomIn = () =>
		graphRef.current?.zoom(graphRef.current.zoom() * 1.2, 400);
	const handleZoomOut = () =>
		graphRef.current?.zoom(graphRef.current.zoom() * 0.8, 400);
	const handleCenter = () => graphRef.current?.zoomToFit(400);

	return (
		<div className="w-full h-screen relative overflow-hidden bg-[#fcfbf3]">
			<Card
				className="px-6 py-4"
				style={{
					position: "absolute",
					left: "12px",
					top: "12px",
					zIndex: 2,
				}}
			>
				<CardTitle className="text-2xl tracking-tight font-bold">
					Memory Graph Playground
				</CardTitle>
			</Card>

			<div
				style={{
					position: "absolute",
					left: "12px",
					bottom: "12px",
					zIndex: 2,
				}}
			>
				<ButtonGroup orientation="vertical">
					<Button
						variant="secondary"
						size="icon-lg"
						onClick={handleZoomIn}
						className="rounded"
					>
						<IconPlus />
					</Button>
					<Button
						variant="secondary"
						size="icon-lg"
						onClick={handleZoomOut}
						className="rounded"
					>
						<IconMinus />
					</Button>
					<Button
						variant="secondary"
						size="icon-lg"
						onClick={handleCenter}
						className="rounded"
					>
						<IconMaximize size={20} />
					</Button>
				</ButtonGroup>
			</div>

			<ForceGraph2D
				ref={graphRef}
				graphData={data}
				backgroundColor="#fcfbf3"
				warmupTicks={150}
				cooldownTicks={FORCE_CONFIG.cooldownTicks}
				d3AlphaDecay={FORCE_CONFIG.alphaDecay}
				d3AlphaMin={FORCE_CONFIG.alphaMin}
				d3VelocityDecay={FORCE_CONFIG.velocityDecay}
				autoPauseRedraw={true}
				nodeCanvasObject={drawNode}
				nodeCanvasObjectMode={() => "replace"}
				linkCanvasObject={drawLink}
				linkCanvasObjectMode={() => "replace"}
				onNodeHover={handleNodeHover}
				onLinkHover={handleLinkHover}
				onEngineStop={() => {
					if (!initialZoomRef.current) {
						graphRef.current?.zoomToFit(600, 100);
						initialZoomRef.current = true;
					}
				}}
			/>
		</div>
	);
}
