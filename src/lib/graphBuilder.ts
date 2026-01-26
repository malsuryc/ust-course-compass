import type {
  RawCourse,
  CourseGraph,
  CourseNode,
  CourseEdge,
  CourseNodeData,
  CourseEdgeType,
  CourseZone,
  GraphConfig,
} from "@/types/graph";
import { DEFAULT_GRAPH_CONFIG } from "@/types/graph";
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
const HORIZONTAL_GAP = 60;  // Gap between nodes horizontally
const VERTICAL_GAP = 100;   // Gap between nodes vertically
const ZONE_PADDING = 80;    // Padding around zones

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
 * Converts a RawCourse to CourseNodeData with zone info.
 */
function rawCourseToNodeData(
  course: RawCourse,
  zone: CourseZone,
  depth: number,
  isMaster: boolean = false,
  mutualCorequisiteOf?: string
): CourseNodeData {
  return {
    // Display data (minimal)
    courseCode: course.courseCode,
    courseName: course.courseName,
    credits: formatCredits(course.minUnits, course.maxUnits),
    departmentCode: course.departmentCode,
    level: deriveCourseLevel(course.courseNumber),
    careerType: course.academicCareerType === "PG" ? "PG" : "UG",
    zone,
    depth,
    isMaster,
    mutualCorequisiteOf,

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

/**
 * Checks if two courses have mutual corequisites (A has B as coreq, B has A as coreq).
 */
function areMutualCorequisites(
  codeA: string,
  codeB: string,
  courseMap: Map<string, RawCourse>
): boolean {
  const courseA = courseMap.get(codeA);
  const courseB = courseMap.get(codeB);
  if (!courseA || !courseB) return false;

  const coreqsA = parsePrerequisite(courseA.courseCorequisite).courseCodes;
  const coreqsB = parsePrerequisite(courseB.courseCorequisite).courseCodes;

  return coreqsA.includes(codeB) && coreqsB.includes(codeA);
}

// ============================================================
// Graph Builder
// ============================================================

export interface BuildGraphOptions {
  /** The course code to build the dependency tree for */
  targetCourseCode: string;
  /** All courses in the catalog (indexed by courseCode for quick lookup) */
  courseMap: Map<string, RawCourse>;
  /** Graph configuration options */
  config?: GraphConfig;
  /** Reverse lookup map: course code -> courses that require it */
  reversePrereqMap?: Map<string, Set<string>>;
  /** Reverse corequisite lookup map: course code -> courses that list it as a corequisite */
  reverseCoreqMap?: Map<string, Set<string>>;
}

/**
 * Builds a reverse prerequisite lookup map at runtime.
 * Maps each course code to the set of courses that require it.
 */
export function buildReversePrereqMap(
  courseMap: Map<string, RawCourse>
): Map<string, Set<string>> {
  const reverseMap = new Map<string, Set<string>>();

  for (const [courseCode, course] of courseMap) {
    const prereq = parsePrerequisite(course.coursePrerequisite);
    for (const prereqCode of prereq.courseCodes) {
      if (!reverseMap.has(prereqCode)) {
        reverseMap.set(prereqCode, new Set());
      }
      reverseMap.get(prereqCode)!.add(courseCode);
    }
  }

  return reverseMap;
}

/**
 * Builds a reverse corequisite lookup map at runtime.
 * Maps each course code to the set of courses that list it as a corequisite.
 */
export function buildReverseCoreqMap(
  courseMap: Map<string, RawCourse>
): Map<string, Set<string>> {
  const reverseMap = new Map<string, Set<string>>();

  for (const [courseCode, course] of courseMap) {
    const coreq = parsePrerequisite(course.courseCorequisite);
    for (const coreqCode of coreq.courseCodes) {
      if (!reverseMap.has(coreqCode)) {
        reverseMap.set(coreqCode, new Set());
      }
      reverseMap.get(coreqCode)!.add(courseCode);
    }
  }

  return reverseMap;
}

/**
 * Builds a semantic-zoned course dependency graph.
 * - Center: Master node
 * - North: Post-requisites (courses that require the master)
 * - South: Prerequisites (courses required by the master)
 * - West: Exclusions (mutually exclusive courses)
 * - East: Corequisites (courses to take together)
 */
export function buildCourseGraph(options: BuildGraphOptions): CourseGraph {
  const {
    targetCourseCode,
    courseMap,
    config = DEFAULT_GRAPH_CONFIG,
    reversePrereqMap,
    reverseCoreqMap,
  } = options;

  const normalizedTarget = normalizeCourseCode(targetCourseCode);
  const targetCourse = courseMap.get(normalizedTarget);

  if (!targetCourse) {
    return { nodes: [], edges: [] };
  }

  const nodesMap = new Map<string, CourseNode>();
  const edgesMap = new Map<string, CourseEdge>();

  // Helper to add a node
  const addNode = (
    course: RawCourse,
    zone: CourseZone,
    depth: number,
    isMaster: boolean = false,
    mutualCorequisiteOf?: string
  ): CourseNode => {
    const code = normalizeCourseCode(course.courseCode);
    if (!nodesMap.has(code)) {
      const node: CourseNode = {
        id: code,
        type: "course",
        position: { x: 0, y: 0 }, // Will be set by zoned layout
        data: rawCourseToNodeData(course, zone, depth, isMaster, mutualCorequisiteOf),
      };
      nodesMap.set(code, node);
    }
    return nodesMap.get(code)!;
  };

  // Helper to add an edge with handle info
  const addEdge = (
    source: string,
    target: string,
    type: CourseEdgeType,
    label?: string,
    sourceHandle?: string,
    targetHandle?: string,
    bidirectional?: boolean
  ) => {
    const edgeId = createEdgeId(source, target, type);
    if (!edgesMap.has(edgeId)) {
      const edge: CourseEdge = {
        id: edgeId,
        source,
        target,
        type: "default",
        sourceHandle,
        targetHandle,
        data: { edgeType: type, label, bidirectional },
      };
      edgesMap.set(edgeId, edge);
    }
  };

  // ========== Add Master Node (Center) ==========
  addNode(targetCourse, "center", 0, true);

  // ========== South Zone: Prerequisites & Corequisites ==========
  const visitedSouth = new Set<string>();
  const traversePrereqsAndCoreqs = (courseCode: string, depth: number) => {
    if (depth > config.maxPrereqDepth || visitedSouth.has(courseCode)) {
      return;
    }
    visitedSouth.add(courseCode);

    const course = courseMap.get(courseCode);
    if (!course) return;

    // Process prerequisites
    const prereq = parsePrerequisite(course.coursePrerequisite);
    for (const prereqCode of prereq.courseCodes) {
      const prereqCourse = courseMap.get(prereqCode);
      if (prereqCourse && !nodesMap.has(prereqCode)) {
        addNode(prereqCourse, "south", depth);
        // Edge: prereq -> course (bottom to top)
        addEdge(
          prereqCode,
          courseCode,
          "prerequisite",
          prereq.hasAnd && prereq.hasOr
            ? "AND/OR"
            : prereq.hasOr
            ? "OR"
            : undefined,
          "sourceBottom",
          "targetBottom"
        );
        traversePrereqsAndCoreqs(prereqCode, depth + 1);
      } else if (prereqCourse && nodesMap.has(prereqCode)) {
        // Node already exists, just add edge
        addEdge(
          prereqCode,
          courseCode,
          "prerequisite",
          undefined,
          "sourceBottom",
          "targetBottom"
        );
      }
    }

    if (config.showCorequisites) {
      const coreq = parsePrerequisite(course.courseCorequisite);
      for (const coreqCode of coreq.courseCodes) {
        const coreqCourse = courseMap.get(coreqCode);
        if (coreqCourse && !nodesMap.has(coreqCode)) {
          const isMutual = areMutualCorequisites(coreqCode, courseCode, courseMap);
          if (isMutual) {
            addNode(coreqCourse, "east", depth, false, courseCode);
            addEdge(
              coreqCode,
              courseCode,
              "corequisite",
              coreq.hasAnd && coreq.hasOr
                ? "AND/OR"
                : coreq.hasOr
                ? "OR"
                : undefined,
              "sourceLeft",
              "targetLeft",
              true
            );
          } else {
            addNode(coreqCourse, "south", depth);
            addEdge(
              coreqCode,
              courseCode,
              "corequisite",
              coreq.hasAnd && coreq.hasOr
                ? "AND/OR"
                : coreq.hasOr
                ? "OR"
                : undefined,
              "sourceBottom",
              "targetBottom"
            );
          }
          traversePrereqsAndCoreqs(coreqCode, depth + 1);
        } else if (coreqCourse && nodesMap.has(coreqCode)) {
          const isMutual = areMutualCorequisites(coreqCode, courseCode, courseMap);
          if (isMutual) {
            addEdge(
              coreqCode,
              courseCode,
              "corequisite",
              undefined,
              "sourceRight",
              "targetRight",
              true
            );
          } else {
            addEdge(
              coreqCode,
              courseCode,
              "corequisite",
              undefined,
              "sourceBottom",
              "targetBottom"
            );
          }
        }
      }
    }
  };
  traversePrereqsAndCoreqs(normalizedTarget, 1);

  // ========== North Zone: Post-requisites & Reverse Corequisites ==========
  if (reversePrereqMap || reverseCoreqMap) {
    const visitedNorth = new Set<string>();
    const traverseNorth = (courseCode: string, depth: number) => {
      if (depth > config.maxPostreqDepth || visitedNorth.has(courseCode)) {
        return;
      }
      visitedNorth.add(courseCode);

      // 1. Process Post-requisites (courses that require current course)
      const postreqs = reversePrereqMap?.get(courseCode);
      if (postreqs) {
        for (const postreqCode of postreqs) {
          const postreqCourse = courseMap.get(postreqCode);
          if (postreqCourse && !nodesMap.has(postreqCode)) {
            addNode(postreqCourse, "north", depth);
            // Edge: course -> postreq (top to bottom)
            addEdge(
              courseCode,
              postreqCode,
              "prerequisite",
              undefined,
              "sourceBottom",
              "targetBottom"
            );
            traverseNorth(postreqCode, depth + 1);
          } else if (postreqCourse && nodesMap.has(postreqCode)) {
            // Node already exists
            const existingNode = nodesMap.get(postreqCode);
            if (existingNode?.data.zone === "north") {
              addEdge(
                courseCode,
                postreqCode,
                "prerequisite",
                undefined,
                "sourceBottom",
                "targetBottom"
              );
            }
          }
        }
      }

      // 2. Process Reverse Corequisites (courses that list current course as coreq)
      // Treat as post-requisite relation (Course A is coreq of B -> B is "postreq" of A)
      if (config.showCorequisites) {
        const reverseCoreqs = reverseCoreqMap?.get(courseCode);
        if (reverseCoreqs) {
          for (const coreqCallerCode of reverseCoreqs) {
            // Check if it's mutual (bidirectional)
            // If mutual, it's already handled in South/East zone logic
            const isMutual = areMutualCorequisites(courseCode, coreqCallerCode, courseMap);
            
            if (!isMutual) {
              const coreqCallerCourse = courseMap.get(coreqCallerCode);
              if (coreqCallerCourse && !nodesMap.has(coreqCallerCode)) {
                addNode(coreqCallerCourse, "north", depth);
                // Edge: course -> caller (treated as postreq)
                // Use corequisite style edge
                addEdge(
                  courseCode,
                  coreqCallerCode,
                  "corequisite",
                  undefined, 
                  "sourceBottom", // Connect from bottom of current
                  "targetBottom"  // To bottom of target (standard north zone flow)
                );
                traverseNorth(coreqCallerCode, depth + 1);
              } else if (coreqCallerCourse && nodesMap.has(coreqCallerCode)) {
                 const existingNode = nodesMap.get(coreqCallerCode);
                 if (existingNode?.data.zone === "north") {
                    addEdge(
                      courseCode,
                      coreqCallerCode,
                      "corequisite",
                      undefined,
                      "sourceBottom",
                      "targetBottom"
                    );
                 }
              }
            }
          }
        }
      }
    };
    traverseNorth(normalizedTarget, 1);
  }

  // ========== West Zone: Exclusions ==========
  if (config.showExclusions) {
    const exclusions = parseCommaSeparatedCourses(
      targetCourse.courseExclusion
    );
    for (const exclCode of exclusions) {
      const exclCourse = courseMap.get(exclCode);
      if (exclCourse && !nodesMap.has(exclCode)) {
        addNode(exclCourse, "west", 1);
        // Exclusion edge (conflict, undirected - use left handles)
        addEdge(
          normalizedTarget,
          exclCode,
          "exclusion",
          undefined,
          "sourceLeft",
          "targetLeft"
        );
      }
    }
  }

  const nodes = Array.from(nodesMap.values());
  const edges = Array.from(edgesMap.values());

  // Apply zoned layout
  return applyZonedLayout({ nodes, edges });
}

/**
 * Applies semantic zoned layout to position nodes.
 * - Center: Master node at (0, 0)
 * - North: Post-requisites above center (hierarchical tree going up)
 * - South: Prerequisites below center (hierarchical tree going down)
 * - West: Exclusions to the left (horizontal row)
 * - East: Corequisites to the right (horizontal row)
 */
export function applyZonedLayout(graph: CourseGraph): CourseGraph {
  const { nodes, edges } = graph;

  if (nodes.length === 0) {
    return graph;
  }

  // Group nodes by zone
  const nodesByZone: Record<CourseZone, CourseNode[]> = {
    center: [],
    north: [],
    south: [],
    west: [],
    east: [],
  };

  for (const node of nodes) {
    nodesByZone[node.data.zone].push(node);
  }

  // Group by depth within each zone
  const groupByDepth = (zoneNodes: CourseNode[]): Map<number, CourseNode[]> => {
    const groups = new Map<number, CourseNode[]>();
    for (const node of zoneNodes) {
      const depth = node.data.depth;
      if (!groups.has(depth)) {
        groups.set(depth, []);
      }
      groups.get(depth)!.push(node);
    }
    return groups;
  };

  const positionedNodes: CourseNode[] = [];

  // ========== South Zone (Prerequisites - below center) ==========
  const southByDepth = groupByDepth(nodesByZone.south);
  const southDepths = Array.from(southByDepth.keys()).sort((a, b) => a - b);

  for (const depth of southDepths) {
    const depthNodes = southByDepth.get(depth)!;
    const rowWidth = depthNodes.length * (NODE_WIDTH + HORIZONTAL_GAP) - HORIZONTAL_GAP;
    const startX = -rowWidth / 2;
    const y = NODE_HEIGHT / 2 + ZONE_PADDING + (depth - 1) * (NODE_HEIGHT + VERTICAL_GAP);

    depthNodes.forEach((node, index) => {
      positionedNodes.push({
        ...node,
        position: {
          x: startX + index * (NODE_WIDTH + HORIZONTAL_GAP),
          y: y,
        },
      });
    });
  }

  // ========== North Zone (Post-requisites - above center) ==========
  const northByDepth = groupByDepth(nodesByZone.north);
  const northDepths = Array.from(northByDepth.keys()).sort((a, b) => a - b);

  for (const depth of northDepths) {
    const depthNodes = northByDepth.get(depth)!;
    const rowWidth = depthNodes.length * (NODE_WIDTH + HORIZONTAL_GAP) - HORIZONTAL_GAP;
    const startX = -rowWidth / 2;
    const y = -NODE_HEIGHT / 2 - ZONE_PADDING - (depth) * (NODE_HEIGHT + VERTICAL_GAP);

    depthNodes.forEach((node, index) => {
      positionedNodes.push({
        ...node,
        position: {
          x: startX + index * (NODE_WIDTH + HORIZONTAL_GAP),
          y: y,
        },
      });
    });
  }

  // ========== West Zone (Exclusions - left of center) ==========
  const westNodes = nodesByZone.west;
  if (westNodes.length > 0) {
    const colHeight = westNodes.length * (NODE_HEIGHT + HORIZONTAL_GAP) - HORIZONTAL_GAP;
    const startY = -colHeight / 2;
    const x = -NODE_WIDTH / 2 - ZONE_PADDING - NODE_WIDTH;

    westNodes.forEach((node, index) => {
      positionedNodes.push({
        ...node,
        position: {
          x: x,
          y: startY + index * (NODE_HEIGHT + HORIZONTAL_GAP),
        },
      });
    });
  }

  // ========== East Zone (Corequisites - right of center) ==========
  const eastNodes = nodesByZone.east;
  if (eastNodes.length > 0) {
    const nodesByPartner: Record<string, CourseNode[]> = { "": [] };
    for (const node of eastNodes) {
      const partner = node.data.mutualCorequisiteOf || "";
      if (!nodesByPartner[partner]) nodesByPartner[partner] = [];
      nodesByPartner[partner].push(node);
    }

    for (const [partnerId, groupNodes] of Object.entries(nodesByPartner)) {
      if (partnerId) {
        const partnerNode = positionedNodes.find(n => n.id === partnerId);
        if (partnerNode) {
          const startX = partnerNode.position.x + NODE_WIDTH + ZONE_PADDING;
          groupNodes.forEach((node, index) => {
            positionedNodes.push({
              ...node,
              position: {
                x: startX + index * (NODE_WIDTH + HORIZONTAL_GAP),
                y: partnerNode.position.y,
              },
            });
          });
        }
      } else {
        const colHeight = groupNodes.length * (NODE_HEIGHT + HORIZONTAL_GAP) - HORIZONTAL_GAP;
        const startY = -colHeight / 2;
        const x = NODE_WIDTH / 2 + ZONE_PADDING;
        groupNodes.forEach((node, index) => {
          positionedNodes.push({
            ...node,
            position: {
              x: x,
              y: startY + index * (NODE_HEIGHT + HORIZONTAL_GAP),
            },
          });
        });
      }
    }
  }

  // ========== Center Zone (Master) - Add LAST for highest z-index ==========
  for (const node of nodesByZone.center) {
    positionedNodes.push({
      ...node,
      position: { x: -NODE_WIDTH / 2, y: -NODE_HEIGHT / 2 },
    });
  }

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
