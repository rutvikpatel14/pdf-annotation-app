"use client";

import type { Stage } from "konva/lib/Stage";
import { useCallback } from "react";

export type StagePointerPosition = { x: number; y: number };

export function useDrag(stageRef: React.RefObject<Stage | null>) {
  const getPointerPosition = useCallback((): StagePointerPosition | null => {
    const stage = stageRef.current;
    if (!stage) return null;

    const pos = stage.getPointerPosition();
    if (!pos) return null;

    return { x: pos.x, y: pos.y };
  }, [stageRef]);

  return { getPointerPosition };
}

