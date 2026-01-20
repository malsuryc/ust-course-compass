"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  type Node,
  type NodeMouseHandler,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";

import CourseNodeComponent from "./CourseNode";
import CourseEdgeComponent from "./CourseEdge";
import { useCourseGraph } from "@/hooks/useCourseGraph";
import type { CourseNodeData, CourseEdge } from "@/types/graph";

// Register custom node/edge types
const nodeTypes = {
  course: CourseNodeComponent,
};

const edgeTypes = {
  default: CourseEdgeComponent,
};

// Default edge options with arrow marker
const defaultEdgeOptions = {
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 15,
    height: 15,
  },
};

/**
 * Graph Viewer Component
 * Blueprint-style course dependency visualization
 */
export default function GraphViewer() {
  const {
    graph,
    masterCourseCode,
    setMasterCourse,
    isLoading,
    error,
    courseExists,
    searchCourses,
  } = useCourseGraph();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);
  const reactFlowRef = useRef<HTMLDivElement>(null);

  // Update nodes/edges when graph changes
  useEffect(() => {
    if (graph.nodes.length > 0) {
      setNodes(graph.nodes);
      setEdges(graph.edges as CourseEdge[]);
    }
  }, [graph, setNodes, setEdges]);

  // Handle node click - set as new master
  const onNodeClick: NodeMouseHandler = useCallback(
    (_event, node: Node<CourseNodeData>) => {
      setMasterCourse(node.id);
      setSearchInput(node.id);
      setShowResults(false);
    },
    [setMasterCourse]
  );

  // Handle search input change
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.toUpperCase();
      setSearchInput(value);
      const results = searchCourses(value);
      setSearchResults(results);
      setShowResults(results.length > 0);
    },
    [searchCourses]
  );

  // Handle search submit
  const handleSearchSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (searchInput) {
        setMasterCourse(searchInput);
        setShowResults(false);
      }
    },
    [searchInput, setMasterCourse]
  );

  // Handle result selection
  const handleResultClick = useCallback(
    (code: string) => {
      setSearchInput(code);
      setMasterCourse(code);
      setShowResults(false);
    },
    [setMasterCourse]
  );

  // Loading state
  if (isLoading) {
    return (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--c-bg-outer)",
          fontFamily: "var(--font-mono)",
          fontSize: "1rem",
          color: "var(--c-text-main)",
        }}
      >
        <span className="spinner" /> LOADING CATALOG...
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--c-bg-outer)",
          fontFamily: "var(--font-mono)",
          fontSize: "1rem",
          color: "var(--c-error)",
        }}
      >
        [ERROR] {error.message}
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "var(--c-bg-outer)",
      }}
    >
      {/* Control Panel */}
      <div
        style={{
          padding: "var(--space-md)",
          background: "var(--c-bg-card)",
          borderBottom: "1px solid var(--c-border)",
          display: "flex",
          alignItems: "center",
          gap: "var(--space-md)",
          flexWrap: "wrap",
        }}
      >
        {/* Title */}
        <div
          style={{
            fontFamily: "var(--font-ui)",
            fontWeight: 700,
            fontSize: "0.875rem",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color: "var(--c-text-main)",
          }}
        >
          Course Graph
        </div>

        {/* Search Form */}
        <form
          onSubmit={handleSearchSubmit}
          style={{ position: "relative", flex: "1", maxWidth: "300px" }}
        >
          <input
            type="text"
            value={searchInput}
            onChange={handleSearchChange}
            onFocus={() => searchResults.length > 0 && setShowResults(true)}
            onBlur={() => setTimeout(() => setShowResults(false), 200)}
            placeholder="ENTER COURSE CODE..."
            style={{
              width: "100%",
              padding: "var(--space-sm)",
              fontFamily: "var(--font-mono)",
              fontSize: "0.875rem",
              textTransform: "uppercase",
            }}
          />

          {/* Search Results Dropdown */}
          {showResults && searchResults.length > 0 && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                background: "var(--c-bg-card)",
                border: "1px solid var(--c-border)",
                borderTop: "none",
                maxHeight: "200px",
                overflowY: "auto",
                zIndex: 100,
              }}
            >
              {searchResults.map((code) => (
                <div
                  key={code}
                  onClick={() => handleResultClick(code)}
                  style={{
                    padding: "var(--space-sm)",
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.75rem",
                    cursor: "pointer",
                    borderBottom: "1px solid var(--c-border)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--c-bg-outer)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "var(--c-bg-card)";
                  }}
                >
                  {code}
                </div>
              ))}
            </div>
          )}
        </form>

        <button type="submit" onClick={handleSearchSubmit}>
          Load
        </button>

        {/* Current Master Display */}
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.75rem",
            color: "var(--c-text-sub)",
          }}
        >
          MASTER:{" "}
          <span style={{ color: "var(--c-text-main)", fontWeight: 600 }}>
            {masterCourseCode}
          </span>
          {!courseExists && (
            <span style={{ color: "var(--c-error)", marginLeft: "8px" }}>
              [NOT FOUND]
            </span>
          )}
        </div>

        {/* Legend */}
        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            gap: "var(--space-md)",
            fontFamily: "var(--font-mono)",
            fontSize: "0.625rem",
            color: "var(--c-text-sub)",
          }}
        >
          <span>
            <span
              style={{
                display: "inline-block",
                width: 16,
                height: 2,
                background: "var(--c-edge-prereq)",
                marginRight: 4,
                verticalAlign: "middle",
              }}
            />
            PREREQ
          </span>
          <span>
            <span
              style={{
                display: "inline-block",
                width: 16,
                height: 2,
                background: "var(--c-edge-coreq)",
                marginRight: 4,
                verticalAlign: "middle",
                borderTop: "2px dashed var(--c-edge-coreq)",
              }}
            />
            COREQ
          </span>
          <span>
            <span
              style={{
                display: "inline-block",
                width: 16,
                height: 2,
                background: "var(--c-edge-excl)",
                marginRight: 4,
                verticalAlign: "middle",
              }}
            />
            EXCL
          </span>
          <span>
            <span
              style={{
                display: "inline-block",
                width: 16,
                height: 2,
                background: "var(--c-edge-equiv)",
                marginRight: 4,
                verticalAlign: "middle",
              }}
            />
            EQUIV
          </span>
        </div>
      </div>

      {/* React Flow Canvas */}
      <div style={{ flex: 1 }} ref={reactFlowRef}>
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
        </ReactFlow>
      </div>
    </div>
  );
}
