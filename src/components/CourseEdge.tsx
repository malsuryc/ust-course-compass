"use client";

import { memo } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getStraightPath,
  type EdgeProps,
} from "reactflow";
import type { CourseEdgeData, CourseEdgeType } from "@/types/graph";

/**
 * Edge style configuration based on relationship type
 */
const EDGE_CONFIG: Record<
  CourseEdgeType,
  {
    stroke: string;
    strokeDasharray?: string;
    strokeWidth: number;
    animated?: boolean;
  }
> = {
  prerequisite: {
    stroke: "var(--c-edge-prereq)",
    strokeWidth: 2,
    animated: true,
  },
  corequisite: {
    stroke: "var(--c-edge-coreq)",
    strokeDasharray: "5,5",
    strokeWidth: 2,
  },
  exclusion: {
    stroke: "var(--c-edge-excl)",
    strokeDasharray: "8,4",
    strokeWidth: 2,
  },
  equivalent: {
    stroke: "var(--c-edge-equiv)",
    strokeDasharray: "2,2",
    strokeWidth: 1.5,
  },
};

/**
 * Custom Course Edge Component
 * Different styles for prerequisite, corequisite, exclusion, equivalent
 */
function CourseEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
  markerEnd,
  markerStart,
}: EdgeProps<CourseEdgeData>) {
  const edgeType = data?.edgeType || "prerequisite";
  const config = EDGE_CONFIG[edgeType];
  const label = data?.label;
  const isBidirectional = data?.bidirectional;

  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        markerStart={isBidirectional ? markerStart : undefined}
        style={{
          stroke: config.stroke,
          strokeWidth: config.strokeWidth,
          strokeDasharray: config.strokeDasharray,
        }}
      />

      {/* Edge label for AND/OR logic */}
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: "all",
              fontFamily: "var(--font-mono)",
              fontSize: "0.625rem",
              padding: "2px 4px",
              background: "var(--c-bg-card)",
              border: "1px solid var(--c-border)",
              color: "var(--c-text-sub)",
            }}
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

export default memo(CourseEdgeComponent);
