"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import type { CourseNodeData } from "@/types/graph";

/**
 * Custom Course Node Component
 * Blueprint style: rectangular, no shadows, monospace data
 */
function CourseNodeComponent({ data, selected }: NodeProps<CourseNodeData>) {
  const { courseCode, courseName, credits, departmentCode, level, careerType } =
    data;

  return (
    <div
      style={{
        width: 200,
        minHeight: 80,
        background: "var(--c-bg-card)",
        border: selected
          ? "2px solid var(--c-border-active)"
          : "1px solid var(--c-border)",
        padding: "var(--space-sm)",
        display: "flex",
        flexDirection: "column",
        gap: "4px",
        cursor: "pointer",
        transition: "border-color 0.1s",
      }}
      onMouseEnter={(e) => {
        if (!selected) {
          e.currentTarget.style.borderColor = "var(--c-border-active)";
        }
      }}
      onMouseLeave={(e) => {
        if (!selected) {
          e.currentTarget.style.borderColor = "var(--c-border)";
        }
      }}
    >
      {/* Handles for edges */}
      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: "var(--c-border-active)",
          width: 8,
          height: 8,
          borderRadius: 0,
          border: "none",
        }}
      />

      {/* Header: Course Code */}
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontWeight: 700,
          fontSize: "0.875rem",
          color: "var(--c-text-main)",
          letterSpacing: "0.025em",
        }}
      >
        {courseCode}
      </div>

      {/* Course Name (truncated) */}
      <div
        style={{
          fontFamily: "var(--font-ui)",
          fontSize: "0.75rem",
          color: "var(--c-text-sub)",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          lineHeight: 1.3,
        }}
        title={courseName}
      >
        {courseName}
      </div>

      {/* Footer: Metadata badges */}
      <div
        style={{
          display: "flex",
          gap: "4px",
          marginTop: "auto",
          flexWrap: "wrap",
        }}
      >
        {/* Credits badge */}
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.625rem",
            padding: "2px 4px",
            background: "var(--c-bg-outer)",
            border: "1px solid var(--c-border)",
            color: "var(--c-text-sub)",
          }}
        >
          {credits}CR
        </span>

        {/* Department badge */}
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.625rem",
            padding: "2px 4px",
            background: "var(--c-bg-outer)",
            border: "1px solid var(--c-border)",
            color: "var(--c-text-sub)",
          }}
        >
          {departmentCode}
        </span>

        {/* Level badge */}
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.625rem",
            padding: "2px 4px",
            background: "var(--c-bg-outer)",
            border: "1px solid var(--c-border)",
            color: "var(--c-text-sub)",
          }}
        >
          L{level}
        </span>

        {/* Career type badge */}
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.625rem",
            padding: "2px 4px",
            background:
              careerType === "PG" ? "var(--c-edge-coreq)" : "var(--c-edge-prereq)",
            color: "var(--c-text-inverse)",
          }}
        >
          {careerType}
        </span>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          background: "var(--c-border-active)",
          width: 8,
          height: 8,
          borderRadius: 0,
          border: "none",
        }}
      />
    </div>
  );
}

export default memo(CourseNodeComponent);
