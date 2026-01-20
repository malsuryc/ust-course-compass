"use client";

import { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchCatalog } from "@/lib/api";
import {
  buildCourseGraph,
  createCourseMap,
  buildReversePrereqMap,
} from "@/lib/graphBuilder";
import type { RawCourse, CourseGraph, GraphConfig } from "@/types/graph";
import { DEFAULT_GRAPH_CONFIG } from "@/types/graph";
import { normalizeCourseCode } from "@/lib/prerequisiteParser";

const DEFAULT_MASTER_COURSE = "COMP2611";

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
  /** Current graph configuration */
  config: GraphConfig;
  /** Update graph configuration */
  setConfig: (config: GraphConfig) => void;
  /** Update a single config value */
  updateConfig: <K extends keyof GraphConfig>(key: K, value: GraphConfig[K]) => void;
}

/**
 * Hook for managing course graph state with React Query
 */
export function useCourseGraph(): UseCourseGraphResult {
  const [masterCourseCode, setMasterCourseCode] = useState(DEFAULT_MASTER_COURSE);
  const [config, setConfig] = useState<GraphConfig>(DEFAULT_GRAPH_CONFIG);

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

  // Build reverse prerequisite map (course -> courses that require it)
  const reversePrereqMap = useMemo(() => {
    if (!catalog || courseMap.size === 0) return undefined;
    return buildReversePrereqMap(courseMap);
  }, [catalog, courseMap]);

  // Check if master course exists
  const courseExists = useMemo(() => {
    const normalized = normalizeCourseCode(masterCourseCode);
    return courseMap.has(normalized);
  }, [courseMap, masterCourseCode]);

  // Build graph when master course or config changes
  const graph = useMemo<CourseGraph>(() => {
    if (!catalog || catalog.length === 0 || !courseExists) {
      return { nodes: [], edges: [] };
    }

    return buildCourseGraph({
      targetCourseCode: masterCourseCode,
      courseMap,
      config,
      reversePrereqMap,
    });
  }, [catalog, courseMap, masterCourseCode, courseExists, config, reversePrereqMap]);

  // Set master course (normalize input)
  const setMasterCourse = useCallback((code: string) => {
    const normalized = normalizeCourseCode(code);
    setMasterCourseCode(normalized);
  }, []);

  // Update a single config value
  const updateConfig = useCallback(<K extends keyof GraphConfig>(
    key: K,
    value: GraphConfig[K]
  ) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
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
    config,
    setConfig,
    updateConfig,
  };
}
