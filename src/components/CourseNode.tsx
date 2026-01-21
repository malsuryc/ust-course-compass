"use client";

import { memo, useState } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import type { CourseNodeData } from "@/types/graph";
import { CourseInfoCard } from "./CourseInfoCard";

// Shared handle style
const handleStyle = {
  background: "var(--c-border-active)",
  width: 8,
  height: 8,
  borderRadius: 0,
  border: "none",
};

/**
 * Custom Course Node Component
 * Blueprint style: rectangular, no shadows, monospace data
 * Supports 4 directional handles (top, bottom, left, right) for semantic zoning
 */
function CourseNodeComponent({ data, selected }: NodeProps<CourseNodeData>) {
  const {
    courseCode,
    courseName,
    credits,
    departmentCode,
    level,
    careerType,
    isMaster,
    zone,
    meta,
  } = data;

  const [showInfo, setShowInfo] = useState(false);

  return (
    <div
      style={{
        position: "relative",
        width: 200,
        minHeight: 80,
        background: isMaster ? "var(--c-bg-outer)" : "var(--c-bg-card)",
        border: isMaster
          ? "2px solid var(--c-edge-prereq)"
          : selected
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
        if (!selected && !isMaster) {
          e.currentTarget.style.borderColor = "var(--c-border-active)";
        }
      }}
      onMouseLeave={(e) => {
        if (!selected && !isMaster) {
          e.currentTarget.style.borderColor = "var(--c-border)";
        }
      }}
    >
      {/* Top Handle (target for south zone incoming, source for north zone outgoing) */}
      <Handle
        id="targetTop"
        type="target"
        position={Position.Top}
        style={handleStyle}
      />
      <Handle
        id="sourceBottom"
        type="source"
        position={Position.Top}
        style={handleStyle}
      />

      {/* Left Handle (for exclusions - west zone) */}
      <Handle
        id="sourceLeft"
        type="source"
        position={Position.Left}
        style={handleStyle}
      />
      <Handle
        id="targetRight"
        type="target"
        position={Position.Left}
        style={handleStyle}
      />

      {/* Right Handle (for corequisites - east zone) */}
      <Handle
        id="sourceRight"
        type="source"
        position={Position.Right}
        style={handleStyle}
      />
      <Handle
        id="targetLeft"
        type="target"
        position={Position.Right}
        style={handleStyle}
      />

      {/* Header: Course Code + Info Button */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
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
        {isMaster && (
          <button
            className="nodrag"
            onClick={() => setShowInfo((prev) => !prev)}
            style={{
              background: showInfo ? "var(--c-edge-prereq)" : "var(--c-bg-outer)",
              border: "1px solid var(--c-border)",
              borderRadius: 0,
              width: 20,
              height: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontFamily: "var(--font-mono)",
              fontSize: "0.75rem",
              fontWeight: 700,
              color: showInfo ? "var(--c-text-inverse)" : "var(--c-text-main)",
              padding: 0,
              lineHeight: 1,
              textTransform: "none",
            }}
            title={showInfo ? "Hide course info" : "Show course info"}
          >
            i
          </button>
        )}
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

      {/* Bottom Handle (source for south zone outgoing, target for north zone incoming) */}
      <Handle
        id="sourceTop"
        type="source"
        position={Position.Bottom}
        style={handleStyle}
      />
      <Handle
        id="targetBottom"
        type="target"
        position={Position.Bottom}
        style={handleStyle}
      />

      {/* Info Card (Master node only) */}
      {isMaster && showInfo && (
        <CourseInfoCard
          meta={meta}
          courseCode={courseCode}
          courseName={courseName}
          onClose={() => setShowInfo(false)}
        />
      )}
    </div>
  );
}

export default memo(CourseNodeComponent);
