"use client";

import { useCallback } from "react";
import { type NodeMouseHandler } from "reactflow";
import { useQuery } from "@tanstack/react-query";

import { MasterNodeHub } from "./MasterNodeHub";
import { useMultiCourseGraph } from "@/hooks/useMultiCourseGraph";
import { fetchCatalog } from "@/lib/api";
import type { RawCourse } from "@/types/graph";

interface HubManagerProps {
  onNodeClick?: NodeMouseHandler;
}

export function HubManager({ onNodeClick }: HubManagerProps) {
  const {
    hubs,
    activeHubId,
    addHub,
    removeHub,
    setActiveHub,
    updateHubMaster,
    duplicateHub,
  } = useMultiCourseGraph();

  const {
    data: catalog,
    isLoading: catalogLoading,
    error: catalogError,
  } = useQuery<RawCourse[], Error>({
    queryKey: ["courseCatalog"],
    queryFn: fetchCatalog,
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
  });

  const handleMasterChange = useCallback(
    (hubId: string, courseCode: string) => {
      updateHubMaster(hubId, courseCode);
    },
    [updateHubMaster]
  );

  const handleAddHub = useCallback(() => {
    addHub();
  }, [addHub]);

  const handleRemoveHub = useCallback(
    (e: React.MouseEvent, hubId: string) => {
      e.stopPropagation();
      removeHub(hubId);
    },
    [removeHub]
  );

  const handleDuplicateHub = useCallback(
    (e: React.MouseEvent, hubId: string) => {
      e.stopPropagation();
      duplicateHub(hubId);
    },
    [duplicateHub]
  );

  if (catalogError) {
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
        [ERROR] {catalogError.message}
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
      <HubToolbar
        hubs={hubs}
        activeHubId={activeHubId}
        onHubSelect={setActiveHub}
        onAddHub={handleAddHub}
        onRemoveHub={handleRemoveHub}
        onDuplicateHub={handleDuplicateHub}
      />
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {hubs.length === 1 ? (
          <div style={{ flex: 1 }}>
            <MasterNodeHub
              hubId={hubs[0].id}
              initialCourseCode={hubs[0].masterCourseCode}
              catalog={catalog}
              catalogLoading={catalogLoading}
              catalogError={catalogError}
              onMasterChange={handleMasterChange}
              onNodeClick={onNodeClick}
              isActive={true}
            />
          </div>
        ) : (
          <HubGridLayout
            hubs={hubs}
            activeHubId={activeHubId}
            catalog={catalog}
            catalogLoading={catalogLoading}
            catalogError={catalogError}
            onMasterChange={handleMasterChange}
            onNodeClick={onNodeClick}
          />
        )}
      </div>
    </div>
  );
}

interface HubToolbarProps {
  hubs: Array<{ id: string; masterCourseCode: string }>;
  activeHubId: string | null;
  onHubSelect: (id: string) => void;
  onAddHub: () => void;
  onRemoveHub: (e: React.MouseEvent, id: string) => void;
  onDuplicateHub: (e: React.MouseEvent, id: string) => void;
}

function HubToolbar({
  hubs,
  activeHubId,
  onHubSelect,
  onAddHub,
  onRemoveHub,
  onDuplicateHub,
}: HubToolbarProps) {
  return (
    <div
      style={{
        padding: "var(--space-sm) var(--space-md)",
        background: "var(--c-bg-card)",
        borderBottom: "1px solid var(--c-border)",
        display: "flex",
        alignItems: "center",
        gap: "var(--space-sm)",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-ui)",
          fontWeight: 700,
          fontSize: "0.875rem",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          color: "var(--c-text-main)",
          marginRight: "var(--space-md)",
        }}
      >
        UST Course Compass <span style={{ fontSize: "0.625rem", marginTop: 2, color: "var(--c-text-sub)", textTransform: "none" }}>v0.1.0</span>
      </div>

      <div
        style={{
          display: "flex",
          gap: "4px",
          overflowX: "auto",
          maxWidth: "60vw",
        }}
      >
        {hubs.map((hub) => (
          <div
            key={hub.id}
            onClick={() => onHubSelect(hub.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              padding: "4px 8px",
              paddingRight: "4px",
              background:
                activeHubId === hub.id ? "var(--c-bg-outer)" : "transparent",
              border:
                activeHubId === hub.id
                  ? "1px solid var(--c-border-active)"
                  : "1px solid transparent",
              cursor: "pointer",
              fontFamily: "var(--font-mono)",
              fontSize: "0.75rem",
              color: "var(--c-text-main)",
              transition: "all 0.1s",
            }}
          >
            <span style={{ fontWeight: 600 }}>{hub.masterCourseCode}</span>
            {hubs.length > 1 && (
              <div style={{ display: "flex", gap: "2px" }}>
                <button
                  onClick={(e) => onDuplicateHub(e, hub.id)}
                  title="Duplicate"
                  style={{
                    width: 16,
                    height: 16,
                    padding: 0,
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    fontSize: "0.625rem",
                    color: "var(--c-text-sub)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  +
                </button>
                <button
                  onClick={(e) => onRemoveHub(e, hub.id)}
                  title="Close"
                  style={{
                    width: 16,
                    height: 16,
                    padding: 0,
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    fontSize: "0.625rem",
                    color: "var(--c-text-sub)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  ×
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={onAddHub}
        style={{
          padding: "4px 12px",
          fontFamily: "var(--font-mono)",
          fontSize: "0.75rem",
          textTransform: "uppercase",
          border: "1px solid var(--c-border-active)",
          borderRadius: 0,
          background: "var(--c-bg-card)",
          cursor: "pointer",
          color: "var(--c-text-main)",
          whiteSpace: "nowrap",
        }}
      >
        + New Tree
      </button>

      <div style={{ flex: 1 }} />

      <a
        href="https://github.com/malsuryc/ust-course-compass"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.625rem",
          color: "var(--c-text-sub)",
          textDecoration: "none",
        }}
      >
        [Github]
      </a>
    </div>
  );
}

interface HubGridLayoutProps {
  hubs: Array<{ id: string; masterCourseCode: string }>;
  activeHubId: string | null;
  catalog: RawCourse[] | undefined;
  catalogLoading: boolean;
  catalogError: Error | null;
  onMasterChange: (hubId: string, courseCode: string) => void;
  onNodeClick?: NodeMouseHandler;
}

function HubGridLayout({
  hubs,
  activeHubId,
  catalog,
  catalogLoading,
  catalogError,
  onMasterChange,
  onNodeClick,
}: HubGridLayoutProps) {
  const cols = hubs.length <= 2 ? 2 : hubs.length <= 4 ? 2 : 3;
  const rows = Math.ceil(hubs.length / cols);

  return (
    <div
      style={{
        flex: 1,
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
        gap: "1px",
        background: "var(--c-border)",
      }}
    >
      {hubs.map((hub) => (
        <div
          key={hub.id}
          style={{
            background: "var(--c-bg-outer)",
            overflow: "hidden",
          }}
        >
          <MasterNodeHub
            hubId={hub.id}
            initialCourseCode={hub.masterCourseCode}
            catalog={catalog}
            catalogLoading={catalogLoading}
            catalogError={catalogError}
            onMasterChange={onMasterChange}
            onNodeClick={onNodeClick}
            isActive={activeHubId === hub.id}
          />
        </div>
      ))}
    </div>
  );
}
