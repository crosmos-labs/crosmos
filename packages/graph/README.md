# @crosmos/graph

Interactive force-graph visualization for knowledge graphs - React component with canvas rendering, hover animations, click interactions, and detail popovers.

## Installation

```bash
npm install @crosmos/graph
```

### Peer dependencies

- `react` >= 19.0.0
- `react-dom` >= 19.0.0
- `tailwindcss` >= 4 (optional, required for built-in popovers)

## Required CSS variables

The built-in popovers (`NodePopover`, `EdgePopover`) use Tailwind semantic classes that resolve to CSS variables. Your application must define these variables (typically via `tailwindcss` theme configuration or a CSS file):

- `--card` / `--card-foreground` - used by `bg-card`, `text-card-foreground`
- `--muted-foreground` - used by `text-muted-foreground`
- `--secondary` / `--secondary-foreground` - used by the badge pill styles

If you're already using `@crosmos/ui` or a Tailwind CSS theme based on shadcn/ui, these variables are already available.

## Usage

```tsx
import { ForceGraph, NodePopover, EdgePopover } from "@crosmos/graph";
import type { GraphNode, GraphEdge } from "@crosmos/graph";
import { GRAPH_CONFIG } from "@crosmos/graph";
import "react-force-graph-2d"; // required for dynamic import

function GraphPage({ nodes, edges }: { nodes: GraphNode[]; edges: GraphEdge[] }) {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<GraphEdge | null>(null);

  const nodeMap = useMemo(() => {
    const map = new Map<string, GraphNode>();
    for (const n of nodes) map.set(n.id, n);
    return map;
  }, [nodes]);

  return (
    <div className="relative h-full w-full">
      <ForceGraph
        nodes={nodes}
        edges={edges}
        onNodeClick={(node) => { setSelectedNode(node); setSelectedEdge(null); }}
        onEdgeClick={(edge) => { setSelectedEdge(edge); setSelectedNode(null); }}
        onBackgroundClick={() => { setSelectedNode(null); setSelectedEdge(null); }}
      />
      {selectedNode && (
        <NodePopover node={selectedNode} onClose={() => setSelectedNode(null)} />
      )}
      {selectedEdge && (
        <EdgePopover edge={selectedEdge} nodeMap={nodeMap} onClose={() => setSelectedEdge(null)} />
      )}
    </div>
  );
}
```

## Components

### `ForceGraph`

| Prop | Type | Description |
|---|---|---|
| `nodes` | `GraphNode[]` | Graph entities |
| `edges` | `GraphEdge[]` | Relationships between entities |
| `onNodeClick` | `(node: GraphNode) => void` | Called when a node is clicked |
| `onEdgeClick` | `(edge: GraphEdge) => void` | Called when an edge is clicked |
| `onBackgroundClick` | `() => void` | Called when the background is clicked |

### `NodePopover`

Displays node details (name, type, relation count, timestamps) in a top-right overlay.

| Prop | Type | Description |
|---|---|---|
| `node` | `GraphNode` | The node to display |
| `onClose` | `() => void` | Called when popover should dismiss |

### `EdgePopover`

Displays edge details (source, target, relation type, timestamps) in a top-right overlay.

| Prop | Type | Description |
|---|---|---|
| `edge` | `GraphEdge` | The edge to display |
| `nodeMap` | `Map<string, GraphNode>` | Map of node IDs to nodes (for resolving names) |
| `onClose` | `() => void` | Called when popover should dismiss |

## Configuration

All visual and behavioral parameters are in `GRAPH_CONFIG`:

```ts
import { GRAPH_CONFIG } from "@crosmos/graph";

// Override at runtime
GRAPH_CONFIG.node.radius = 6;
GRAPH_CONFIG.hover.accentColor = "oklch(0.6 0.2 250)";
GRAPH_CONFIG.click.targetZoom = 3;
```

See `src/constants/graph.ts` for all configurable values: force parameters, node/link styling, hover animations, label opacity, and click behavior.

## Types

```ts
interface GraphNode {
  id: string;
  name: string;
  entity_type: string | null;
  edge_count: number;
  created_at: string | null;
  updated_at: string | null;
}

interface GraphEdge {
  id: string;
  source_entity_id: string;
  target_entity_id: string;
  relation_type: string;
  valid_from: string | null;
  recorded_at: string;
}

interface GraphViewportResponse {
  nodes: GraphNode[];
  edges: GraphEdge[];
  total_nodes: number;
  total_edges: number;
}

interface GraphStatsResponse {
  total_entities: number;
  total_edges: number;
  entity_types: Record<string, number>;
  top_relations: Array<{ relation: string; count: number }>;
}
```

## License

MIT
