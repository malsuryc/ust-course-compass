"use client";

import { useCallback, useEffect, useRef } from "react";
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  type Node,
  type NodeMouseHandler,
  MarkerType,
  useReactFlow,
  ReactFlowProvider,
} from "reactflow";
import "reactflow/dist/style.css";

import CourseNodeComponent from "./CourseNode";
import CourseEdgeComponent from "./CourseEdge";
import type { CourseNodeData, CourseEdge } from "@/types/graph";

const nodeTypes = {
  course: CourseNodeComponent,
};

const edgeTypes = {
  default: CourseEdgeComponent,
};

const defaultEdgeOptions = {
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 15,
    height: 15,
  },
};

interface CourseGraphCanvasProps {
  graph: { nodes: Node<CourseNodeData>[]; edges: CourseEdge[] };
  masterCourseCode: string;
  onNodeClick: NodeMouseHandler;
  showInfoByDefault?: boolean;
}

function CourseGraphCanvasContent({
  graph,
  masterCourseCode,
  onNodeClick,
  showInfoByDefault = true,
}: CourseGraphCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const reactFlowRef = useRef<HTMLDivElement>(null);
  const { setCenter } = useReactFlow();

  const handleNodeSelect = useCallback(
    (nodeId: string) => {
      setNodes((nodes) =>
        nodes.map((node) => ({
          ...node,
          selected: node.id === nodeId,
        }))
      );
    },
    [setNodes]
  );

  useEffect(() => {
    if (graph.nodes.length > 0) {
      const nodesWithSelectCallback = graph.nodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          onNodeSelect: handleNodeSelect,
          infoCardOpenByDefault: showInfoByDefault,
        },
      }));
      setNodes(nodesWithSelectCallback);
      setEdges(graph.edges as CourseEdge[]);
    }
  }, [graph, setNodes, setEdges, handleNodeSelect, showInfoByDefault]);

  const resetView = useCallback(() => {
    const masterNode = graph.nodes.find((n) => n.id === masterCourseCode);
    if (masterNode) {
      setCenter(masterNode.position.x, masterNode.position.y, { zoom: 1, duration: 200 });
    } else {
      setCenter(0, 0, { zoom: 1, duration: 200 });
    }
  }, [setCenter, graph.nodes, masterCourseCode]);

  useEffect(() => {
    resetView();
  }, [resetView]);

  return (
    <div style={{ width: "100%", height: "100%" }} ref={reactFlowRef}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
      >
        <Controls
          showInteractive={false}
          style={{
            borderRadius: 0,
          }}
        />
        <Background color="var(--c-border)" gap={20} />
        <div
          style={{
            position: "absolute",
            bottom: 16,
            right: 16,
            padding: "8px 12px",
            fontFamily: "var(--font-mono)",
            fontSize: "0.625rem",
            color: "var(--c-text-sub)",
            opacity: 0.5,
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          <div style={{ display: "flex", gap: "12px" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              N↑
              <span style={{ width: 12, height: 2, background: "var(--c-edge-prereq)" }} />
              POSTREQ
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              S↓
              <span style={{ width: 12, height: 2, background: "var(--c-edge-prereq)" }} />
              PREREQ
              <span style={{ width: 12, height: 0, borderTop: "2px dotted var(--c-edge-coreq)" }} />
              COREQ
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              W←
              <span style={{ width: 12, height: 0, borderTop: "2px dotted var(--c-edge-excl)" }} />
              EXCL
            </span>
          </div>
        </div>
      </ReactFlow>
    </div>
  );
}

export default function CourseGraphCanvas(props: CourseGraphCanvasProps) {
  return (
    <ReactFlowProvider>
      <CourseGraphCanvasContent {...props} />
    </ReactFlowProvider>
  );
}
