"use client";

import { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchCatalog } from "@/lib/api";
import {
  buildCourseGraph,
  createCourseMap,
} from "@/lib/graphBuilder";
import type { RawCourse, CourseGraph } from "@/types/graph";
import { normalizeCourseCode } from "@/lib/prerequisiteParser";

const DEFAULT_MASTER_COURSE = "COMP1021";

export interface UseCourseGraphResult {
  /** Current graph data (nodes & edges) */
  graph: CourseGraph;
  /** Current master course code */
  masterCourseCode: string;
  /** Set a new master course (triggers graph rebuild) */
  setMasterCourse: (code: string) => void;
  /** Whether catalog is loading */
  isLoading: boolean;
  /** Error if catalog fetch failed */
  error: Error | null;
  /** Whether the master course exists in catalog */
  courseExists: boolean;
  /** Search for courses by prefix (returns matching course codes) */
  searchCourses: (query: string) => string[];
}

/**
 * Hook for managing course graph state with React Query
 */
export function useCourseGraph(): UseCourseGraphResult {
  const [masterCourseCode, setMasterCourseCode] = useState(DEFAULT_MASTER_COURSE);

  // Fetch course catalog
  const {
    data: catalog,
    isLoading,
    error,
  } = useQuery<RawCourse[], Error>({
    queryKey: ["courseCatalog"],
    queryFn: fetchCatalog,
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
  });

  // Build course map for quick lookups
  const courseMap = useMemo(() => {
    if (!catalog) return new Map<string, RawCourse>();
    return createCourseMap(catalog);
  }, [catalog]);

  // Check if master course exists
  const courseExists = useMemo(() => {
    const normalized = normalizeCourseCode(masterCourseCode);
    return courseMap.has(normalized);
  }, [courseMap, masterCourseCode]);

  // Build graph when master course changes
  const graph = useMemo<CourseGraph>(() => {
    if (!catalog || catalog.length === 0 || !courseExists) {
      return { nodes: [], edges: [] };
    }

    return buildCourseGraph({
      targetCourseCode: masterCourseCode,
      courseMap,
      maxDepth: 10,
      includePostrequisites: false,
    });
  }, [catalog, courseMap, masterCourseCode, courseExists]);

  // Set master course (normalize input)
  const setMasterCourse = useCallback((code: string) => {
    const normalized = normalizeCourseCode(code);
    setMasterCourseCode(normalized);
  }, []);

  // Search courses by query (prefix match on courseCode)
  const searchCourses = useCallback(
    (query: string): string[] => {
      if (!query || query.length < 2) return [];
      const upperQuery = query.toUpperCase().replace(/\s+/g, "");

      const results: string[] = [];
      for (const [code] of courseMap) {
        if (code.startsWith(upperQuery)) {
          results.push(code);
          if (results.length >= 10) break; // Limit results
        }
      }
      return results;
    },
    [courseMap]
  );

  return {
    graph,
    masterCourseCode,
    setMasterCourse,
    isLoading,
    error: error ?? null,
    courseExists,
    searchCourses,
  };
}
