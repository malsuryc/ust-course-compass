"use client";

import type { GraphConfig } from "@/types/graph";

interface HubConfigPanelProps {
  config: GraphConfig;
  updateConfig: <K extends keyof GraphConfig>(key: K, value: GraphConfig[K]) => void;
  resetConfig: () => void;
  onClose: () => void;
}

export function HubConfigPanel({
  config,
  updateConfig,
  resetConfig,
  onClose,
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

  const cardStyle: React.CSSProperties = {
    background: "var(--c-bg-card)",
    border: "1px solid var(--c-border-active)",
    padding: "var(--space-md)",
    fontFamily: "var(--font-mono)",
    width: "280px",
    display: "flex",
    flexDirection: "column",
    gap: "var(--space-md)",
  };

  const headerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: "1px solid var(--c-border)",
    paddingBottom: "var(--space-sm)",
  };

  return (
    <div style={cardStyle}>
      <div style={headerStyle}>
        <span style={{ ...labelStyle, fontSize: "0.75rem", color: "var(--c-text-main)" }}>
          CONFIGURATION
        </span>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            color: "var(--c-text-sub)",
            cursor: "pointer",
            fontSize: "1rem",
            padding: 0,
            lineHeight: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          aria-label="Close configuration"
        >
          ✕
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
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

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
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
      </div>

      <button
        onClick={resetConfig}
        style={{
          marginTop: "var(--space-xs)",
          padding: "6px 12px",
          fontFamily: "var(--font-mono)",
          fontSize: "0.625rem",
          textTransform: "uppercase",
          border: "1px solid var(--c-border)",
          borderRadius: 0,
          background: "var(--c-bg-outer)",
          cursor: "pointer",
          width: "100%",
          color: "var(--c-text-sub)",
          transition: "all 0.2s ease",
        }}
      >
        Reset Defaults
      </button>
    </div>
  );
}
