"use client";

import { useState, useMemo, useCallback } from "react";
import type { RawCourse, CourseGraph, GraphConfig } from "@/types/graph";
import { DEFAULT_GRAPH_CONFIG } from "@/types/graph";
import {
  buildCourseGraph,
  createCourseMap,
  buildReversePrereqMap,
} from "@/lib/graphBuilder";
import { normalizeCourseCode } from "@/lib/prerequisiteParser";

export interface UseSingleCourseGraphResult {
  graph: CourseGraph;
  masterCourseCode: string;
  setMasterCourse: (code: string) => void;
  isLoading: boolean;
  error: Error | null;
  courseExists: boolean;
  searchCourses: (query: string) => string[];
  config: GraphConfig;
  updateConfig: <K extends keyof GraphConfig>(key: K, value: GraphConfig[K]) => void;
  resetConfig: () => void;
}

export function useSingleCourseGraph(
  initialCourseCode: string,
  catalog: RawCourse[] | undefined,
  isLoading: boolean,
  error: Error | null
): UseSingleCourseGraphResult {
  const [masterCourseCode, setMasterCourseCode] = useState(initialCourseCode);
  const [config, setConfig] = useState<GraphConfig>(DEFAULT_GRAPH_CONFIG);

  const courseMap = useMemo(() => {
    if (!catalog) return new Map<string, RawCourse>();
    return createCourseMap(catalog);
  }, [catalog]);

  const reversePrereqMap = useMemo(() => {
    if (!catalog || courseMap.size === 0) return undefined;
    return buildReversePrereqMap(courseMap);
  }, [catalog, courseMap]);

  const courseExists = useMemo(() => {
    const normalized = normalizeCourseCode(masterCourseCode);
    return courseMap.has(normalized);
  }, [courseMap, masterCourseCode]);

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

  const setMasterCourse = useCallback((code: string) => {
    const normalized = normalizeCourseCode(code);
    setMasterCourseCode(normalized);
  }, []);

  const updateConfig = useCallback(<K extends keyof GraphConfig>(
    key: K,
    value: GraphConfig[K]
  ) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetConfig = useCallback(() => {
    setConfig(DEFAULT_GRAPH_CONFIG);
  }, []);

  const searchCourses = useCallback(
    (query: string): string[] => {
      if (!query || query.length < 2) return [];
      const upperQuery = query.toUpperCase().replace(/\s+/g, "");

      const results: string[] = [];
      for (const [code] of courseMap) {
        if (code.startsWith(upperQuery)) {
          results.push(code);
          if (results.length >= 10) break;
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
    updateConfig,
    resetConfig,
  };
}
