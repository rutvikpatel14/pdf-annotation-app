"use client";

import { useCallback, useMemo, useReducer } from "react";
import type {
  Annotation,
  AnnotationMovePayload,
  AnnotationsState,
  PageSize,
  UpdateAnnotationPayload,
} from "../types/annotation.types";
import {
  annotationsReducer,
  ANNOTATIONS_INITIAL_STATE,
} from "../annotationReducer";
import {
  exportAnnotationsToJson,
  importAnnotationsFromJson,
} from "../utils/annotationHelpers";

export const useAnnotations = (initialState?: AnnotationsState) => {
  const [state, dispatch] = useReducer(
    annotationsReducer,
    initialState ?? ANNOTATIONS_INITIAL_STATE
  );

  const annotations = state.annotations;
  const selectedId = state.selectedId;

  const selectAnnotation = useCallback((id: string | null) => {
    dispatch({ type: "SELECT_ANNOTATION", payload: { id } });
  }, []);

  const addAnnotation = useCallback((annotation: Annotation) => {
    dispatch({ type: "ADD_ANNOTATION", payload: annotation });
  }, []);

  const updateAnnotation = useCallback((payload: UpdateAnnotationPayload) => {
    dispatch({ type: "UPDATE_ANNOTATION", payload });
  }, []);

  const moveAnnotation = useCallback((payload: AnnotationMovePayload) => {
    dispatch({ type: "MOVE_ANNOTATION", payload });
  }, []);

  const deleteAnnotation = useCallback((id: string) => {
    dispatch({ type: "DELETE_ANNOTATION", payload: { id } });
  }, []);

  const exportJson = useCallback(
    (pageSize: PageSize) => exportAnnotationsToJson(annotations, pageSize),
    [annotations]
  );

  const importJson = useCallback(
    (json: string, currentPageSize: PageSize) => {
      const nextAnnotations = importAnnotationsFromJson(
        json,
        currentPageSize
      );

      // Reducer doesn't include a dedicated "replace" action; delete then add.
      for (const existing of state.annotations) {
        dispatch({ type: "DELETE_ANNOTATION", payload: { id: existing.id } });
      }
      for (const next of nextAnnotations) {
        dispatch({ type: "ADD_ANNOTATION", payload: next });
      }
    },
    [state.annotations]
  );

  return useMemo(
    () => ({
      annotations,
      selectedId,
      selectAnnotation,
      addAnnotation,
      updateAnnotation,
      moveAnnotation,
      deleteAnnotation,
      exportJson,
      importJson,
    }),
    [
      annotations,
      selectedId,
      selectAnnotation,
      addAnnotation,
      updateAnnotation,
      moveAnnotation,
      deleteAnnotation,
      exportJson,
      importJson,
    ]
  );
};
