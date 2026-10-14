"use client";

import { useMemo, useState, useCallback } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  MarkerType,
  Position,
  ReactFlow,
  useNodesState,
  useEdgesState,
  type Edge,
  type Node,
  type NodeProps,
  type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  Maximize2,
  Minimize2,
  Network,
  RotateCcw,
  Sparkles,
  ZoomIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MindMapContent } from "../lib/types";

const X_GAP = 300;
const Y_GAP = 100;

type CustomNodeData = {
  label: string;
  isRoot?: boolean;
  level?: number;
};

function CustomMindMapNode({ data }: NodeProps) {
  const nodeData = data as unknown as CustomNodeData;
  const label = typeof nodeData.label === "string" ? nodeData.label : "";
  const isRoot = Boolean(nodeData.isRoot);
  const level = typeof nodeData.level === "number" ? nodeData.level : 1;

  return (
    <div
      className={`group relative min-w-[140px] max-w-[280px] rounded-2xl px-4 py-2.5 text-center shadow-md transition-all duration-200 select-none ${
        isRoot
          ? "border-2 border-primary bg-gradient-to-br from-card via-card to-primary/10 font-bold text-foreground ring-4 ring-primary/10 shadow-primary/10"
          : level === 1
          ? "border border-primary/50 bg-card font-semibold text-foreground shadow-xs hover:border-primary"
          : "border border-border/80 bg-card/95 font-medium text-foreground/90 shadow-2xs hover:border-border"
      }`}
    >
      {/* Target Handle (Left) - for incoming connections */}
      {!isRoot && (
        <Handle
          type="target"
          position={Position.Left}
          className="!size-2.5 !border-2 !border-background !bg-primary transition-transform group-hover:scale-125"
        />
      )}

      {/* Node Content */}
      <div className="flex items-center justify-center gap-2">
        {isRoot && (
          <span className="size-2 rounded-full bg-primary animate-pulse shrink-0" />
        )}
        <span
          className={`break-words leading-snug ${
            isRoot ? "text-[14px]" : level === 1 ? "text-[13px]" : "text-[12px]"
          }`}
        >
          {label}
        </span>
      </div>

      {/* Source Handle (Right) - for outgoing connections */}
      <Handle
        type="source"
        position={Position.Right}
        className="!size-2.5 !border-2 !border-background !bg-primary transition-transform group-hover:scale-125"
      />
    </div>
  );
}

const nodeTypes: NodeTypes = {
  mindmap: CustomMindMapNode,
};

function buildMindMap(content: MindMapContent) {
  if (!content.nodes || content.nodes.length === 0) {
    return { nodes: [], edges: [] };
  }

  const validNodeIds = new Set(content.nodes.map((n) => n.id));
  const adjacency = new Map<string, string[]>();
  const indegree = new Map<string, number>();

  for (const node of content.nodes) {
    adjacency.set(node.id, []);
    indegree.set(node.id, 0);
  }

  // Sanitize provided edges: ensure both source & target exist
  const rawEdges = (content.edges || []).filter(
    (e) => validNodeIds.has(e.source) && validNodeIds.has(e.target) && e.source !== e.target,
  );

  for (const edge of rawEdges) {
    indegree.set(edge.target, (indegree.get(edge.target) ?? 0) + 1);
    adjacency.get(edge.source)?.push(edge.target);
  }

  // Determine root: either node with indegree === 0 or the very first node
  let rootNode = content.nodes.find((node) => (indegree.get(node.id) ?? 0) === 0);
  if (!rootNode) rootNode = content.nodes[0];
  const rootId = rootNode.id;

  // ENSURE ALL NODES ARE CONNECTED:
  // If any other node has indegree === 0 and is not the root, create an edge from the root to it!
  const finalEdgeList: Edge[] = [];
  const edgeSet = new Set<string>();

  for (const e of rawEdges) {
    const key = `${e.source}->${e.target}`;
    if (!edgeSet.has(key)) {
      edgeSet.add(key);
      finalEdgeList.push({
        id: e.id || `e-${e.source}-${e.target}`,
        source: e.source,
        target: e.target,
        type: "smoothstep",
        animated: true,
        style: { stroke: "var(--primary)", strokeWidth: 1.8, opacity: 0.8 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "var(--primary)",
          width: 14,
          height: 14,
        },
      });
    }
  }

  // Connect any orphan/unconnected nodes to root
  for (const node of content.nodes) {
    if (node.id !== rootId && (indegree.get(node.id) ?? 0) === 0) {
      const key = `${rootId}->${node.id}`;
      if (!edgeSet.has(key)) {
        edgeSet.add(key);
        finalEdgeList.push({
          id: `auto-e-${rootId}-${node.id}`,
          source: rootId,
          target: node.id,
          type: "smoothstep",
          animated: true,
          style: { stroke: "var(--primary)", strokeWidth: 1.8, opacity: 0.8 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: "var(--primary)",
            width: 14,
            height: 14,
          },
        });
        adjacency.get(rootId)?.push(node.id);
        indegree.set(node.id, (indegree.get(node.id) ?? 0) + 1);
      }
    }
  }

  // BFS to assign hierarchy levels and positions
  const levels: string[][] = [];
  const visited = new Set<string>();
  let frontier = [rootId];

  while (frontier.length > 0) {
    levels.push(frontier);
    const nextFrontier: string[] = [];
    for (const id of frontier) {
      visited.add(id);
      for (const child of adjacency.get(id) ?? []) {
        if (!visited.has(child) && !nextFrontier.includes(child)) {
          nextFrontier.push(child);
        }
      }
    }
    frontier = nextFrontier;
  }

  // Catch any lingering nodes not reachable
  const unreached = content.nodes
    .map((n) => n.id)
    .filter((id) => !visited.has(id));
  if (unreached.length > 0) {
    levels.push(unreached);
  }

  // Assign X and Y coordinates based on level and index in level
  const nodes: Node[] = content.nodes.map((node) => {
    let levelIdx = 0;
    let posInLevel = 0;
    let levelSize = 1;

    for (let l = 0; l < levels.length; l++) {
      const idx = levels[l].indexOf(node.id);
      if (idx !== -1) {
        levelIdx = l;
        posInLevel = idx;
        levelSize = levels[l].length;
        break;
      }
    }

    const x = levelIdx * X_GAP + 50;
    const y = (posInLevel - (levelSize - 1) / 2) * Y_GAP + 250;
    const isRoot = node.id === rootId;

    return {
      id: node.id,
      type: "mindmap",
      position: { x, y },
      data: {
        label: node.label,
        isRoot,
        level: levelIdx,
      },
    };
  });

  return { nodes, edges: finalEdgeList };
}

export function MindMapView({ content }: { content: MindMapContent }) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const initialElements = useMemo(() => buildMindMap(content), [content]);
  const [nodes, , onNodesChange] = useNodesState(initialElements.nodes);
  const [edges, , onEdgesChange] = useEdgesState(initialElements.edges);

  if (!content.nodes || content.nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/80 bg-card/40 p-12 text-center">
        <Sparkles className="size-8 text-muted-foreground/50" />
        <p className="mt-3 text-[14px] font-medium text-foreground">Empty mind map</p>
        <p className="mt-1 text-[12px] text-muted-foreground">
          This artifact does not contain any concept nodes yet.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Mind Map Meta Header */}
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-border/70 bg-card/80 p-3 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Network className="size-4" />
          </div>
          <div>
            <h4 className="text-[13px] font-semibold text-foreground">Interactive Mind Map</h4>
            <p className="text-[11px] text-muted-foreground">
              {nodes.length} concepts &middot; {edges.length} connected relationships
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFullscreen((prev) => !prev)}
            className="h-8 gap-1.5 rounded-lg px-2.5 text-[11.5px] text-muted-foreground hover:text-foreground"
            title={isFullscreen ? "Exit full view" : "Expand canvas"}
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="size-3.5" />
                <span className="hidden sm:inline">Compact</span>
              </>
            ) : (
              <>
                <Maximize2 className="size-3.5" />
                <span className="hidden sm:inline">Expand</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* React Flow Canvas Container */}
      <div
        className={`relative w-full overflow-hidden rounded-3xl border border-border/70 bg-muted/15 shadow-inner transition-all duration-300 ${
          isFullscreen ? "h-[750px]" : "h-[500px]"
        }`}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          minZoom={0.2}
          maxZoom={2}
          proOptions={{ hideAttribution: true }}
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1.2} color="currentColor" className="opacity-15" />
          <Controls showInteractive={false} className="!rounded-xl !border-border/70 !bg-card !shadow-sm" />
        </ReactFlow>
      </div>
    </div>
  );
}
