"use client";

import { useCallback, useState, type MouseEvent } from "react";
import { type NodeMouseHandler } from "reactflow";

import CourseGraphCanvas from "./CourseGraphCanvas";
import { HubConfigPanel } from "./HubConfigPanel";
import { useSingleCourseGraph } from "@/hooks/useSingleCourseGraph";
import type { RawCourse } from "@/types/graph";

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
  const [configExpanded, setConfigExpanded] = useState(false);

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
        position: "relative",
        background: "var(--c-bg-outer)",
        opacity: isActive ? 1 : 0.6,
        transition: "opacity 0.2s",
        overflow: "hidden",
      }}
    >
      <div style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0 }}>
        {isLoading ? (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
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

      <div
        style={{
          position: "absolute",
          top: "var(--space-md)",
          left: "var(--space-md)",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-xs)",
          width: 240,
        }}
      >
        <div
          style={{
            background: "var(--c-bg-card)",
            border: "1px solid var(--c-border)",
            padding: "var(--space-xs)",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          }}
        >
          <form onSubmit={handleSearchSubmit} style={{ position: "relative" }}>
            <input
              type="text"
              value={searchInput}
              onChange={handleSearchChange}
              onFocus={() => searchResults.length > 0 && setShowResults(true)}
              onBlur={() => setTimeout(() => setShowResults(false), 200)}
              placeholder="SEARCH COURSE..."
              style={{
                width: "100%",
                padding: "var(--space-sm)",
                fontFamily: "var(--font-mono)",
                fontSize: "0.875rem",
                textTransform: "uppercase",
                border: "1px solid var(--c-border)",
                background: "var(--c-bg-input)",
                color: "var(--c-text-main)",
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
                  maxHeight: "300px",
                  overflowY: "auto",
                  zIndex: 100,
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
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
                      color: "var(--c-text-main)",
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
              marginTop: "var(--space-xs)",
              padding: "0 var(--space-xs)",
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
      </div>

      <div
        style={{
          position: "absolute",
          top: "var(--space-md)",
          right: "var(--space-md)",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: "var(--space-sm)",
        }}
      >
        <button
          onClick={() => setConfigExpanded(!configExpanded)}
          style={{
            background: configExpanded ? "var(--c-border-active)" : "var(--c-bg-card)",
            color: configExpanded ? "var(--c-bg-base)" : "var(--c-text-main)",
            border: "1px solid var(--c-border)",
            padding: "8px 12px",
            fontFamily: "var(--font-mono)",
            fontSize: "0.75rem",
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span>SETTINGS</span>
          <span style={{ fontSize: "1rem", lineHeight: 0.5 }}>{configExpanded ? "−" : "+"}</span>
        </button>

        {configExpanded && (
          <div style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
            <HubConfigPanel
              config={config}
              updateConfig={updateConfig}
              resetConfig={resetConfig}
              onClose={() => setConfigExpanded(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
