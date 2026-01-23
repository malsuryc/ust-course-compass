"use client";

import { useCallback, useState, type MouseEvent } from "react";
import { type NodeMouseHandler } from "reactflow";

import CourseGraphCanvas from "./CourseGraphCanvas";
import { HubConfigPanel } from "./HubConfigPanel";
import { useSingleCourseGraph } from "@/hooks/useSingleCourseGraph";
import type { CourseNodeData, RawCourse, GraphConfig } from "@/types/graph";

interface MasterNodeHubProps {
  hubId: string;
  initialCourseCode: string;
  catalog: RawCourse[] | undefined;
  catalogLoading: boolean;
  catalogError: Error | null;
  onMasterChange: (hubId: string, courseCode: string) => void;
  onNodeClick?: NodeMouseHandler;
  isActive?: boolean;
}

export function MasterNodeHub({
  hubId,
  initialCourseCode,
  catalog,
  catalogLoading,
  catalogError,
  onMasterChange,
  onNodeClick,
  isActive = true,
}: MasterNodeHubProps) {
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
    resetConfig,
  } = useSingleCourseGraph(initialCourseCode, catalog, catalogLoading, catalogError);

  const [searchInput, setSearchInput] = useState(masterCourseCode);
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [configExpanded, setConfigExpanded] = useState(true);

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

  const handleSearchSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (searchInput) {
        setMasterCourse(searchInput);
        onMasterChange(hubId, searchInput);
        setShowResults(false);
      }
    },
    [hubId, searchInput, setMasterCourse, onMasterChange]
  );

  const handleResultClick = useCallback(
    (code: string) => {
      setSearchInput(code);
      setMasterCourse(code);
      onMasterChange(hubId, code);
      setShowResults(false);
    },
    [hubId, setMasterCourse, onMasterChange]
  );

  const handleNodeClick: NodeMouseHandler = useCallback(
    (event, node) => {
      setSearchInput(node.id);
      setMasterCourse(node.id);
      onMasterChange(hubId, node.id);
      onNodeClick?.(event, node);
    },
    [hubId, setMasterCourse, onMasterChange, onNodeClick]
  );

  const handleMasterClick = useCallback((e: MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLInputElement;
    if (target.tagName !== "INPUT") {
      target?.focus?.();
    }
  }, []);

  if (error) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--c-bg-outer)",
          fontFamily: "var(--font-mono)",
          fontSize: "0.875rem",
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
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "var(--c-bg-outer)",
        opacity: isActive ? 1 : 0.6,
        transition: "opacity 0.2s",
      }}
    >
      <div
        style={{
          padding: "var(--space-sm)",
          background: "var(--c-bg-card)",
          borderBottom: "1px solid var(--c-border)",
          display: "flex",
          alignItems: "center",
          gap: "var(--space-sm)",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            minWidth: 200,
          }}
        >
          <form onSubmit={handleSearchSubmit} style={{ position: "relative" }}>
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
                border: "1px solid var(--c-border)",
                borderRadius: 0,
              }}
            />

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

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-sm)",
              fontFamily: "var(--font-mono)",
              fontSize: "0.625rem",
              color: "var(--c-text-sub)",
            }}
          >
            <span
              style={{
                color: "var(--c-edge-prereq)",
                fontWeight: 700,
              }}
            >
              MASTER
            </span>
            <span style={{ color: "var(--c-text-main)", fontWeight: 600 }}>
              {masterCourseCode}
            </span>
            {!courseExists && (
              <span style={{ color: "var(--c-error)" }}>[NOT FOUND]</span>
            )}
          </div>
        </div>

        <HubConfigPanel
          config={config}
          updateConfig={updateConfig}
          resetConfig={resetConfig}
          isExpanded={configExpanded}
          onToggle={() => setConfigExpanded(!configExpanded)}
        />
      </div>

      <div style={{ flex: 1, position: "relative" }}>
        {isLoading ? (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "var(--c-bg-outer)",
              fontFamily: "var(--font-mono)",
              fontSize: "1rem",
              color: "var(--c-text-main)",
            }}
          >
            <span className="spinner" /> LOADING...
          </div>
        ) : (
          <CourseGraphCanvas
            graph={graph}
            masterCourseCode={masterCourseCode}
            onNodeClick={handleNodeClick}
            showInfoByDefault={config.showInfoByDefault}
          />
        )}
      </div>
    </div>
  );
}
