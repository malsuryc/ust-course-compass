import type { Node, Edge } from "reactflow";

// ============================================================
// Zone Types (Semantic Zoning Layout)
// ============================================================

export type CourseZone =
  | "center"  // Master node
  | "north"   // Post-requisites (courses that require the master)
  | "south"   // Prerequisites (courses required by the master)
  | "west"    // Exclusions (mutually exclusive courses)
  | "east";   // Corequisites (courses to take together)

// ============================================================
// Graph Configuration (User-adjustable)
// ============================================================

export interface GraphConfig {
  /** Maximum depth to traverse for prerequisites (south zone) */
  maxPrereqDepth: number;
  /** Maximum depth to traverse for post-requisites (north zone) */
  maxPostreqDepth: number;
  /** Show exclusion zone (west) */
  showExclusions: boolean;
  /** Show corequisite zone (east) */
  showCorequisites: boolean;
}

export const DEFAULT_GRAPH_CONFIG: GraphConfig = {
  maxPrereqDepth: 3,
  maxPostreqDepth: 2,
  showExclusions: true,
  showCorequisites: true,
};

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
    markerStart?: string;
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
    markerStart: "arrowclosed", // For mutual corequisites (bidirectional)
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
  /** Zone this node belongs to in the semantic layout */
  zone: CourseZone;
  /** Depth from the master node (0 = master, 1 = direct connection, etc.) */
  depth: number;
  /** Whether this is the master (center) node */
  isMaster: boolean;
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
  /** Callback to select this node in React Flow */
  onNodeSelect?: (nodeId: string) => void;
  /** For mutual corequisites - the course code this node is mutually connected to */
  mutualCorequisiteOf?: string;
}

// ============================================================
// Graph Node & Edge Types (React Flow compatible)
// ============================================================

export type CourseNode = Node<CourseNodeData, "course">;

export interface CourseEdgeData {
  edgeType: CourseEdgeType;
  label?: string; // "AND", "OR" for complex prerequisites
  bidirectional?: boolean; // For mutual corequisites - arrows on both ends
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
