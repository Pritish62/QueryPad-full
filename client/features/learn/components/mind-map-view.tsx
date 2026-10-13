"use client";

import { useMemo } from "react";
import {
  Background,
  Controls,
  ReactFlow,
  type Edge,
  type Node,
  type NodeProps,
  type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { MindMapContent } from "../lib/types";

const X_GAP = 280;
const Y_GAP = 90;

const nodeTypes: NodeTypes = {
  mindmap: MindMapNode,
};

function MindMapNode({ data }: NodeProps) {
  const label = typeof data.label === "string" ? data.label : "";
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-2 text-[13px] font-medium shadow-sm">
      {label}
    </div>
  );
}

function buildMindMap(content: MindMapContent) {
  const adjacency = new Map<string, string[]>();
  const indegree = new Map<string, number>();

  for (const node of content.nodes) {
    adjacency.set(node.id, []);
    indegree.set(node.id, 0);
  }
  for (const edge of content.edges) {
    indegree.set(edge.target, (indegree.get(edge.target) ?? 0) + 1);
    adjacency.get(edge.source)?.push(edge.target);
  }

  const rootIds = content.nodes
    .filter((node) => (indegree.get(node.id) ?? 0) === 0)
    .map((node) => node.id);

  const levels: string[][] = [];
  const visited = new Set<string>();
  let frontier =
    rootIds.length ? rootIds : content.nodes.length ? [content.nodes[0].id] : [];

  while (frontier.length) {
    levels.push(frontier);
    const next: string[] = [];
    for (const id of frontier) {
      visited.add(id);
      for (const child of adjacency.get(id) ?? []) {
        if (!visited.has(child) && !next.includes(child)) next.push(child);
      }
    }
    frontier = next;
  }

  const remaining = content.nodes
    .map((node) => node.id)
    .filter((id) => !visited.has(id));
  if (remaining.length) levels.push(remaining);

  const nodes: Node[] = content.nodes.map((node) => {
    let x = 0;
    let y = 0;
    for (let levelIndex = 0; levelIndex < levels.length; levelIndex += 1) {
      const positionInLevel = levels[levelIndex].indexOf(node.id);
      if (positionInLevel !== -1) {
        x = levelIndex * X_GAP;
        y =
          positionInLevel * Y_GAP -
          ((levels[levelIndex].length - 1) * Y_GAP) / 2;
        break;
      }
    }
    return {
      id: node.id,
      type: "mindmap",
      position: { x, y },
      data: { label: node.label },
    };
  });

  const edges: Edge[] = content.edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    type: "smoothstep",
  }));

  return { nodes, edges };
}

export function MindMapView({ content }: { content: MindMapContent }) {
  const { nodes, edges } = useMemo(() => buildMindMap(content), [content]);

  if (!content.nodes.length) {
    return (
      <div className="rounded-2xl border border-dashed border-border/70 bg-card/50 px-6 py-14 text-center">
        <p className="text-[12.5px] text-muted-foreground">This mind map is empty.</p>
      </div>
    );
  }

  return (
    <div className="h-[480px] w-full overflow-hidden rounded-2xl border border-border/70 bg-muted/20">
      <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} fitView>
        <Background gap={16} size={1} />
        <Controls />
      </ReactFlow>
    </div>
  );
}
