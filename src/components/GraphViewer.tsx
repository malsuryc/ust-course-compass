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
  ReactFlowProvider,
  useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";

import CourseNodeComponent from "./CourseNode";
import CourseEdgeComponent from "./CourseEdge";
import { useCourseGraph } from "@/hooks/useCourseGraph";
import type { CourseNodeData, CourseEdge, GraphConfig } from "@/types/graph";

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

// ============================================================
// Config Panel Component
// ============================================================

interface ConfigPanelProps {
  config: GraphConfig;
  updateConfig: <K extends keyof GraphConfig>(key: K, value: GraphConfig[K]) => void;
  isExpanded: boolean;
  onToggle: () => void;
}

function ConfigPanel({ config, updateConfig, isExpanded, onToggle }: ConfigPanelProps) {
  const sliderStyle: React.CSSProperties = {
    width: "100%",
    accentColor: "var(--c-border-active)",
    cursor: "pointer",
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: "var(--font-mono)",
    fontSize: "0.625rem",
    color: "var(--c-text-sub)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  };

  const valueStyle: React.CSSProperties = {
    fontFamily: "var(--font-mono)",
    fontSize: "0.75rem",
    color: "var(--c-text-main)",
    fontWeight: 600,
  };

  const checkboxStyle: React.CSSProperties = {
    accentColor: "var(--c-border-active)",
    width: 14,
    height: 14,
    cursor: "pointer",
  };

  return (
    <div
      style={{
        background: "var(--c-bg-card)",
        border: "1px solid var(--c-border)",
        padding: "var(--space-sm)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-sm)",
        minWidth: isExpanded ? 200 : "auto",
      }}
    >
      {/* Toggle Header */}
      <div
        onClick={onToggle}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
          ...labelStyle,
        }}
      >
        <span>CONFIG</span>
        <span style={{ fontSize: "0.75em" }}>{isExpanded ? "▼" : "▶"}</span>
      </div>

      {isExpanded && (
        <>
          {/* Prereq Depth Slider */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={labelStyle}>PREREQ DEPTH</span>
              <span style={valueStyle}>{config.maxPrereqDepth}</span>
            </div>
            <input
              type="range"
              min={1}
              max={6}
              value={config.maxPrereqDepth}
              onChange={(e) => updateConfig("maxPrereqDepth", parseInt(e.target.value))}
              style={sliderStyle}
            />
          </div>

          {/* Postreq Depth Slider */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={labelStyle}>POSTREQ DEPTH</span>
              <span style={valueStyle}>{config.maxPostreqDepth}</span>
            </div>
            <input
              type="range"
              min={1}
              max={6}
              value={config.maxPostreqDepth}
              onChange={(e) => updateConfig("maxPostreqDepth", parseInt(e.target.value))}
              style={sliderStyle}
            />
          </div>

          {/* Toggles */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 4 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={config.showExclusions}
                onChange={(e) => updateConfig("showExclusions", e.target.checked)}
                style={checkboxStyle}
              />
              <span style={labelStyle}>SHOW EXCLUSIONS</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={config.showCorequisites}
                onChange={(e) => updateConfig("showCorequisites", e.target.checked)}
                style={checkboxStyle}
              />
              <span style={labelStyle}>SHOW COREQUISITES</span>
            </label>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Graph Viewer Component
 * Blueprint-style course dependency visualization with semantic zoning
 */
function GraphViewerContent() {
  const {
    graph,
    masterCourseCode,
    setMasterCourse,
    isLoading,
    error,
    courseExists,
    searchCourses,
    config,
    updateConfig,
  } = useCourseGraph();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [configExpanded, setConfigExpanded] = useState(true);
  const reactFlowRef = useRef<HTMLDivElement>(null);
  const { setCenter } = useReactFlow();

  const resetView = useCallback(() => {
    setCenter(0, 0, { zoom: 1, duration: 200 });
  }, [setCenter]);

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
      resetView();
    },
    [setMasterCourse, resetView]
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
        resetView();
      }
    },
    [searchInput, setMasterCourse, resetView]
  );

  // Handle result selection
  const handleResultClick = useCallback(
    (code: string) => {
      setSearchInput(code);
      setMasterCourse(code);
      setShowResults(false);
      resetView();
    },
    [setMasterCourse, resetView]
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
          alignItems: "flex-start",
          gap: "var(--space-md)",
          flexWrap: "wrap",
        }}
      >
        {/* Left Section: Title + Search */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
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
            UST Course Compass <span style={{ fontSize: "0.625rem", marginTop: 2, color: "var(--c-text-sub)" }}>BETA</span>
          </div>

          {/* Search Form */}
          <form
            onSubmit={handleSearchSubmit}
            style={{ position: "relative", width: "220px" }}
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
        </div>

        {/* Config Panel */}
        <ConfigPanel
          config={config}
          updateConfig={updateConfig}
          isExpanded={configExpanded}
          onToggle={() => setConfigExpanded(!configExpanded)}
        />

        <a
          href="https://github.com/malsuryc/ust-course-compass"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.625rem",
            color: "var(--c-text-sub)",
            textDecoration: "none",
            marginLeft: "auto",
            alignSelf: "flex-start",
          }}
        >
          [Github]
        </a>
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
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                W←
                <span style={{ width: 12, height: 0, borderTop: "2px dotted var(--c-edge-excl)" }} />
                EXCL
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                E→
                <span style={{ width: 12, height: 0, borderTop: "2px dotted var(--c-edge-coreq)" }} />
                COREQ
              </span>
            </div>
          </div>
        </ReactFlow>
      </div>
    </div>
  );
}

export default function GraphViewer() {
  return (
    <ReactFlowProvider>
      <GraphViewerContent />
    </ReactFlowProvider>
  );
}
