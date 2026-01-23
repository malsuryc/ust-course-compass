"use client";

import type { GraphConfig } from "@/types/graph";

interface HubConfigPanelProps {
  config: GraphConfig;
  updateConfig: <K extends keyof GraphConfig>(key: K, value: GraphConfig[K]) => void;
  resetConfig: () => void;
  isExpanded: boolean;
  onToggle: () => void;
}

export function HubConfigPanel({
  config,
  updateConfig,
  resetConfig,
  isExpanded,
  onToggle,
}: HubConfigPanelProps) {
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
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={config.showInfoByDefault}
                onChange={(e) => updateConfig("showInfoByDefault", e.target.checked)}
                style={checkboxStyle}
              />
              <span style={labelStyle}>SHOW INFO BY DEFAULT</span>
            </label>
          </div>

          <button
            onClick={resetConfig}
            style={{
              marginTop: "var(--space-sm)",
              padding: "4px 8px",
              fontFamily: "var(--font-mono)",
              fontSize: "0.625rem",
              textTransform: "uppercase",
              border: "1px solid var(--c-border)",
              borderRadius: 0,
              background: "var(--c-bg-outer)",
              cursor: "pointer",
            }}
          >
            Reset Defaults
          </button>
        </>
      )}
    </div>
  );
}
