import type { Node, Edge } from "reactflow";

// ============================================================
// Edge Types & Styling
// ============================================================

export type CourseEdgeType =
  | "prerequisite" // Solid directed arrow (required before)
  | "corequisite" // Dashed bidirectional (must take together)
  | "exclusion" // Red dashed (cannot take both)
  | "equivalent"; // Dotted (same course, different code)

export const EDGE_STYLES: Record<
  CourseEdgeType,
  {
    stroke: string;
    strokeDasharray?: string;
    strokeWidth: number;
    animated?: boolean;
    markerEnd?: string;
  }
> = {
  prerequisite: {
    stroke: "#3b82f6", // blue-500
    strokeWidth: 2,
    animated: true,
    markerEnd: "arrowclosed",
  },
  corequisite: {
    stroke: "#8b5cf6", // violet-500
    strokeDasharray: "5,5",
    strokeWidth: 2,
    markerEnd: "arrowclosed",
  },
  exclusion: {
    stroke: "#ef4444", // red-500
    strokeDasharray: "8,4",
    strokeWidth: 2,
  },
  equivalent: {
    stroke: "#6b7280", // gray-500
    strokeDasharray: "2,2",
    strokeWidth: 1.5,
  },
};

// ============================================================
// Course Attribute (for filtering/searching)
// ============================================================

export interface CourseAttribute {
  courseAttribute: string;
  courseAttributeValue: string;
  courseAttributeValueDescription: string;
}

// ============================================================
// Node Data
// ============================================================

/** Minimal display data shown on the node */
export interface CourseNodeDisplayData {
  courseCode: string;
  courseName: string;
  credits: string; // e.g., "3" or "1-3"
  departmentCode: string;
  level: number; // Derived from courseNumber[0], e.g., 1, 2, 3, 4
  careerType: "UG" | "PG";
}

/** Full metadata stored for filtering/searching (not rendered directly) */
export interface CourseNodeMetadata {
  coursePrefix: string;
  courseNumber: string;
  academicCareer: string; // UGRD, TPG, RPG
  schoolCode: string;
  courseDescription: string;
  courseVector: string;
  courseVectorPrinted: string;
  coursePrerequisite: string;
  courseCorequisite: string;
  courseExclusion: string;
  courseBackground: string;
  courseColisted: string;
  courseCrossCampusEquivalence: string;
  courseReference: string;
  previousCourseCodes: string[];
  alternativeCourseCodes: string[];
  courseAttributes: CourseAttribute[];
}

/** Combined node data */
export interface CourseNodeData extends CourseNodeDisplayData {
  meta: CourseNodeMetadata;
}

// ============================================================
// Graph Node & Edge Types (React Flow compatible)
// ============================================================

export type CourseNode = Node<CourseNodeData, "course">;

export interface CourseEdgeData {
  edgeType: CourseEdgeType;
  label?: string; // "AND", "OR" for complex prerequisites
}

export type CourseEdge = Edge<CourseEdgeData>;

// ============================================================
// Graph Structure
// ============================================================

export interface CourseGraph {
  nodes: CourseNode[];
  edges: CourseEdge[];
}

// ============================================================
// Raw Course Data (from catalog.json)
// ============================================================

export interface RawCourse {
  coursePrefix: string;
  courseNumber: string;
  courseCode: string;
  academicCareerType: string;
  academicCareer: string;
  schoolCode: string;
  departmentCode: string;
  courseName: string;
  minUnits: string;
  maxUnits: string;
  courseVector: string;
  courseVectorPrinted: string;
  courseDescription: string;
  previousCourseCodes: string[];
  alternativeCourseCodes: string[];
  coursePrerequisite: string;
  courseCorequisite: string;
  courseExclusion: string;
  courseBackground: string;
  courseColisted: string;
  courseCrossCampusEquivalence: string;
  courseReference: string;
  courseAttributes: CourseAttribute[];
}
