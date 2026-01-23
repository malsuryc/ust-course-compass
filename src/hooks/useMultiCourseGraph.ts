"use client";

import { useState, useCallback } from "react";
import type { GraphConfig } from "@/types/graph";
import { DEFAULT_GRAPH_CONFIG } from "@/types/graph";

const DEFAULT_MASTER_COURSE = "ISOM3540";

export interface HubInstance {
  id: string;
  masterCourseCode: string;
  config: GraphConfig;
}

export interface UseMultiCourseGraphResult {
  hubs: HubInstance[];
  activeHubId: string | null;
  addHub: (courseCode?: string) => string;
  removeHub: (id: string) => void;
  setActiveHub: (id: string) => void;
  updateHubMaster: (id: string, courseCode: string) => void;
  updateHubConfig: <K extends keyof GraphConfig>(id: string, key: K, value: GraphConfig[K]) => void;
  duplicateHub: (id: string) => string | null;
  getActiveHub: () => HubInstance | null;
}

function generateHubId(): string {
  return `hub_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function useMultiCourseGraph(): UseMultiCourseGraphResult {
  const [hubs, setHubs] = useState<HubInstance[]>([
    { id: generateHubId(), masterCourseCode: DEFAULT_MASTER_COURSE, config: DEFAULT_GRAPH_CONFIG },
  ]);
  const [activeHubId, setActiveHubId] = useState<string | null>(hubs[0]?.id ?? null);

  const addHub = useCallback((courseCode?: string): string => {
    const newHub: HubInstance = {
      id: generateHubId(),
      masterCourseCode: courseCode ?? DEFAULT_MASTER_COURSE,
      config: DEFAULT_GRAPH_CONFIG,
    };
    setHubs((prev) => [...prev, newHub]);
    setActiveHubId(newHub.id);
    return newHub.id;
  }, []);

  const removeHub = useCallback((id: string) => {
    setHubs((prev) => {
      if (prev.length <= 1) return prev;
      const newHubs = prev.filter((hub) => hub.id !== id);
      setActiveHubId((current) => {
        if (current === id) return newHubs[0]?.id ?? null;
        return current;
      });
      return newHubs;
    });
  }, []);

  const setActiveHub = useCallback((id: string) => {
    setActiveHubId(id);
  }, []);

  const updateHubMaster = useCallback((id: string, courseCode: string) => {
    setHubs((prev) =>
      prev.map((hub) =>
        hub.id === id ? { ...hub, masterCourseCode: courseCode.toUpperCase() } : hub
      )
    );
  }, []);

  const updateHubConfig = useCallback(<K extends keyof GraphConfig>(
    id: string,
    key: K,
    value: GraphConfig[K]
  ) => {
    setHubs((prev) =>
      prev.map((hub) =>
        hub.id === id ? { ...hub, config: { ...hub.config, [key]: value } } : hub
      )
    );
  }, []);

  const duplicateHub = useCallback(
    (id: string): string | null => {
      const hubToDuplicate = hubs.find((hub) => hub.id === id);
      if (!hubToDuplicate) return null;

      const newHub: HubInstance = {
        id: generateHubId(),
        masterCourseCode: hubToDuplicate.masterCourseCode,
        config: { ...hubToDuplicate.config },
      };
      setHubs((prev) => [...prev, newHub]);
      setActiveHubId(newHub.id);
      return newHub.id;
    },
    [hubs]
  );

  const getActiveHub = useCallback(() => {
    if (!activeHubId) return null;
    return hubs.find((hub) => hub.id === activeHubId) ?? null;
  }, [hubs, activeHubId]);

  return {
    hubs,
    activeHubId,
    addHub,
    removeHub,
    setActiveHub,
    updateHubMaster,
    updateHubConfig,
    duplicateHub,
    getActiveHub,
  };
}
