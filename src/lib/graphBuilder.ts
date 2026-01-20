import dagre from "dagre";
import type {
  RawCourse,
  CourseGraph,
  CourseNode,
  CourseEdge,
  CourseNodeData,
  CourseEdgeType,
} from "@/types/graph";
import {
  parsePrerequisite,
  parseCommaSeparatedCourses,
  normalizeCourseCode,
} from "./prerequisiteParser";

// ============================================================
// Configuration
// ============================================================

const NODE_WIDTH = 200;
const NODE_HEIGHT = 80;
const GRAPH_DIRECTION: "TB" | "LR" = "TB"; // Top-to-Bottom for hierarchy

// ============================================================
// Helper Functions
// ============================================================

/**
 * Derives course level from course number (first digit).
 * "1010" -> 1, "2011" -> 2, "4999" -> 4
 */
function deriveCourseLevel(courseNumber: string): number {
  const firstDigit = parseInt(courseNumber.charAt(0), 10);
  return isNaN(firstDigit) ? 0 : firstDigit;
}

/**
 * Formats credits string from min/max units.
 * "3", "3" -> "3"
 * "1", "3" -> "1-3"
 */
function formatCredits(minUnits: string, maxUnits: string): string {
  if (minUnits === maxUnits) {
    return minUnits || "0";
  }
  return `${minUnits || "0"}-${maxUnits || minUnits || "0"}`;
}

/**
 * Converts a RawCourse to CourseNodeData.
 */
function rawCourseToNodeData(course: RawCourse): CourseNodeData {
  return {
    // Display data (minimal)
    courseCode: course.courseCode,
    courseName: course.courseName,
    credits: formatCredits(course.minUnits, course.maxUnits),
    departmentCode: course.departmentCode,
    level: deriveCourseLevel(course.courseNumber),
    careerType: course.academicCareerType === "PG" ? "PG" : "UG",

    // Metadata (for filtering/searching)
    meta: {
      coursePrefix: course.coursePrefix,
      courseNumber: course.courseNumber,
      academicCareer: course.academicCareer,
      schoolCode: course.schoolCode,
      courseDescription: course.courseDescription,
      courseVector: course.courseVector,
      courseVectorPrinted: course.courseVectorPrinted,
      coursePrerequisite: course.coursePrerequisite,
      courseCorequisite: course.courseCorequisite,
      courseExclusion: course.courseExclusion,
      courseBackground: course.courseBackground,
      courseColisted: course.courseColisted,
      courseCrossCampusEquivalence: course.courseCrossCampusEquivalence,
      courseReference: course.courseReference,
      previousCourseCodes: course.previousCourseCodes || [],
      alternativeCourseCodes: course.alternativeCourseCodes || [],
      courseAttributes: course.courseAttributes || [],
    },
  };
}

/**
 * Creates an edge ID from source, target, and type.
 */
function createEdgeId(
  source: string,
  target: string,
  type: CourseEdgeType
): string {
  return `${source}->${target}:${type}`;
}

// ============================================================
// Graph Builder
// ============================================================

export interface BuildGraphOptions {
  /** The course code to build the dependency tree for */
  targetCourseCode: string;
  /** All courses in the catalog (indexed by courseCode for quick lookup) */
  courseMap: Map<string, RawCourse>;
  /** Maximum depth to traverse for prerequisites (default: 10) */
  maxDepth?: number;
  /** Include courses that depend on the target (reverse dependencies) */
  includePostrequisites?: boolean;
}

/**
 * Builds a single-course dependency tree graph.
 * Traverses prerequisites, corequisites, exclusions, and equivalents.
 */
export function buildCourseGraph(options: BuildGraphOptions): CourseGraph {
  const {
    targetCourseCode,
    courseMap,
    maxDepth = 10,
    includePostrequisites = false,
  } = options;

  const normalizedTarget = normalizeCourseCode(targetCourseCode);
  const targetCourse = courseMap.get(normalizedTarget);

  if (!targetCourse) {
    return { nodes: [], edges: [] };
  }

  const nodesMap = new Map<string, CourseNode>();
  const edgesMap = new Map<string, CourseEdge>();
  const visited = new Set<string>();

  // Helper to add a node
  const addNode = (course: RawCourse): CourseNode => {
    const code = normalizeCourseCode(course.courseCode);
    if (!nodesMap.has(code)) {
      const node: CourseNode = {
        id: code,
        type: "course",
        position: { x: 0, y: 0 }, // Will be set by dagre
        data: rawCourseToNodeData(course),
      };
      nodesMap.set(code, node);
    }
    return nodesMap.get(code)!;
  };

  // Helper to add an edge
  const addEdge = (
    source: string,
    target: string,
    type: CourseEdgeType,
    label?: string
  ) => {
    const edgeId = createEdgeId(source, target, type);
    if (!edgesMap.has(edgeId)) {
      const edge: CourseEdge = {
        id: edgeId,
        source,
        target,
        type: "default",
        data: { edgeType: type, label },
      };
      edgesMap.set(edgeId, edge);
    }
  };

  // Recursive function to traverse prerequisites
  const traversePrerequisites = (courseCode: string, depth: number) => {
    if (depth > maxDepth || visited.has(courseCode)) {
      return;
    }
    visited.add(courseCode);

    const course = courseMap.get(courseCode);
    if (!course) {
      return;
    }

    addNode(course);

    // Parse and add prerequisite edges
    const prereq = parsePrerequisite(course.coursePrerequisite);
    for (const prereqCode of prereq.courseCodes) {
      const prereqCourse = courseMap.get(prereqCode);
      if (prereqCourse) {
        addNode(prereqCourse);
        // Edge: prereqCode -> courseCode (prerequisite points to the course it enables)
        addEdge(
          prereqCode,
          courseCode,
          "prerequisite",
          prereq.hasAnd && prereq.hasOr ? "AND/OR" : prereq.hasOr ? "OR" : undefined
        );
        traversePrerequisites(prereqCode, depth + 1);
      }
    }

    // Parse and add corequisite edges
    const coreqs = parseCommaSeparatedCourses(course.courseCorequisite);
    for (const coreqCode of coreqs) {
      const coreqCourse = courseMap.get(coreqCode);
      if (coreqCourse) {
        addNode(coreqCourse);
        addEdge(courseCode, coreqCode, "corequisite");
      }
    }

    // Parse and add exclusion edges
    const exclusions = parseCommaSeparatedCourses(course.courseExclusion);
    for (const exclCode of exclusions) {
      const exclCourse = courseMap.get(exclCode);
      if (exclCourse) {
        addNode(exclCourse);
        addEdge(courseCode, exclCode, "exclusion");
      }
    }

    // Add equivalent edges (previous codes)
    for (const prevCode of course.previousCourseCodes || []) {
      const normalizedPrev = normalizeCourseCode(prevCode);
      const prevCourse = courseMap.get(normalizedPrev);
      if (prevCourse) {
        addNode(prevCourse);
        addEdge(normalizedPrev, courseCode, "equivalent");
      }
    }

    // Add equivalent edges (alternative codes)
    for (const altCode of course.alternativeCourseCodes || []) {
      const normalizedAlt = normalizeCourseCode(altCode);
      const altCourse = courseMap.get(normalizedAlt);
      if (altCourse) {
        addNode(altCourse);
        addEdge(courseCode, normalizedAlt, "equivalent");
      }
    }
  };

  // Build the graph starting from target course
  traversePrerequisites(normalizedTarget, 0);

  // Optionally find courses that require the target (postrequisites)
  if (includePostrequisites) {
    for (const [code, course] of courseMap) {
      if (visited.has(code)) continue;

      const prereq = parsePrerequisite(course.coursePrerequisite);
      if (prereq.courseCodes.includes(normalizedTarget)) {
        addNode(course);
        addEdge(normalizedTarget, code, "prerequisite");
      }
    }
  }

  const nodes = Array.from(nodesMap.values());
  const edges = Array.from(edgesMap.values());

  // Apply dagre layout
  return applyDagreLayout({ nodes, edges });
}

/**
 * Applies dagre layout to position nodes hierarchically.
 */
export function applyDagreLayout(graph: CourseGraph): CourseGraph {
  const { nodes, edges } = graph;

  if (nodes.length === 0) {
    return graph;
  }

  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({
    rankdir: GRAPH_DIRECTION,
    nodesep: 50,
    ranksep: 100,
    marginx: 20,
    marginy: 20,
  });

  // Add nodes to dagre
  for (const node of nodes) {
    dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  }

  // Add edges to dagre
  for (const edge of edges) {
    dagreGraph.setEdge(edge.source, edge.target);
  }

  // Run layout
  dagre.layout(dagreGraph);

  // Apply computed positions
  const positionedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - NODE_WIDTH / 2,
        y: nodeWithPosition.y - NODE_HEIGHT / 2,
      },
    };
  });

  return { nodes: positionedNodes, edges };
}

// ============================================================
// Utility: Build Course Map from Array
// ============================================================

/**
 * Creates a Map of courses indexed by normalized courseCode.
 */
export function createCourseMap(courses: RawCourse[]): Map<string, RawCourse> {
  const map = new Map<string, RawCourse>();
  for (const course of courses) {
    const code = normalizeCourseCode(course.courseCode);
    map.set(code, course);
  }
  return map;
}
