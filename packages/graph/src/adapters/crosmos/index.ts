import type { GraphDataSource, GraphPage, LoadParams } from "../../data/source";
import type { BaseEdge, BaseNode } from "../../types/public";
import type {
	CrosmosGraphEdgeWire,
	CrosmosGraphNodeWire,
	CrosmosGraphStatsResponse,
	CrosmosGraphViewportResponse,
} from "./wire";

export { EdgePopover } from "./edge-popover";

export { NodePopover } from "./node-popover";
export type {
	CrosmosGraphEdgeWire,
	CrosmosGraphNodeWire,
	CrosmosGraphStatsResponse,
	CrosmosGraphViewportResponse,
} from "./wire";

export interface CrosmosNode extends BaseNode {
	label: string;
	weight: number;
	data: CrosmosGraphNodeWire;
}

export interface CrosmosEdge extends BaseEdge {
	label: string;
	data: CrosmosGraphEdgeWire;
}

const DEFAULT_BASE_URL = "https://api.crosmos.dev/api/v1";

type TokenProvider = () => string | null | Promise<string | null>;

export interface CrosmosDataSourceOptions {
	/** Defaults to https://api.crosmos.dev/api/v1. */
	baseUrl?: string;
	/** UUID of the space to scope queries to. Required. */
	spaceId: string;
	/** Static API key (`csk_*`) — prefer `getToken` for runtime auth. */
	apiKey?: string;
	/** Dynamic token (JWT or API key). Called on every request. */
	getToken?: TokenProvider;
	/** Custom fetch (e.g. when running in RSC). Defaults to global `fetch`. */
	fetch?: typeof fetch;
	/** Default page size. Defaults to 100, max 500 per backend. */
	defaultLimit?: number;
}

export function nodeFromWire(wire: CrosmosGraphNodeWire): CrosmosNode {
	return {
		id: wire.id,
		label: wire.name,
		weight: wire.edge_count,
		data: wire,
	};
}

export function edgeFromWire(wire: CrosmosGraphEdgeWire): CrosmosEdge {
	return {
		id: wire.id,
		source: wire.source_entity_id,
		target: wire.target_entity_id,
		label: wire.relation_type,
		data: wire,
	};
}

export class CrosmosDataSource
	implements GraphDataSource<CrosmosNode, CrosmosEdge>
{
	private readonly baseUrl: string;
	private readonly spaceId: string;
	private readonly apiKey?: string;
	private readonly tokenProvider?: TokenProvider;
	private readonly fetchImpl: typeof fetch;
	private readonly defaultLimit: number;

	constructor(opts: CrosmosDataSourceOptions) {
		if (!opts.spaceId) {
			throw new Error("CrosmosDataSource: `spaceId` is required");
		}
		this.baseUrl = (opts.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, "");
		this.spaceId = opts.spaceId;
		this.apiKey = opts.apiKey;
		this.tokenProvider = opts.getToken;
		this.fetchImpl = opts.fetch ?? fetch.bind(globalThis);
		this.defaultLimit = opts.defaultLimit ?? 100;
	}

	private async authHeader(): Promise<Record<string, string>> {
		const token = this.tokenProvider ? await this.tokenProvider() : this.apiKey;
		return token ? { Authorization: `Bearer ${token}` } : {};
	}

	private async request<T>(path: string, signal?: AbortSignal): Promise<T> {
		const auth = await this.authHeader();
		const res = await this.fetchImpl(`${this.baseUrl}${path}`, {
			method: "GET",
			headers: { Accept: "application/json", ...auth },
			signal,
		});
		if (!res.ok) {
			throw new Error(
				`Crosmos graph request failed: ${res.status} ${res.statusText}`,
			);
		}
		return (await res.json()) as T;
	}

	async load(
		params?: LoadParams,
	): Promise<GraphPage<CrosmosNode, CrosmosEdge>> {
		const requested = params?.limit ?? this.defaultLimit;
		const limit = Math.min(500, Math.max(1, requested));
		const offset = Math.max(0, params?.offset ?? 0);
		const qs = new URLSearchParams({
			space_uuid: this.spaceId,
			limit: String(limit),
			offset: String(offset),
		});
		const wire = await this.request<CrosmosGraphViewportResponse>(
			`/graph?${qs.toString()}`,
			params?.signal,
		);
		return {
			nodes: wire.nodes.map(nodeFromWire),
			edges: wire.edges.map(edgeFromWire),
			totalNodes: wire.total_nodes,
			totalEdges: wire.total_edges,
			nextCursor: null,
		};
	}

	stats(signal?: AbortSignal): Promise<CrosmosGraphStatsResponse> {
		const qs = new URLSearchParams({ space_uuid: this.spaceId });
		return this.request<CrosmosGraphStatsResponse>(
			`/graph/stats?${qs.toString()}`,
			signal,
		);
	}
}
