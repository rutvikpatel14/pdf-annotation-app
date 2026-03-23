import type {
  Annotation,
  AnnotationAction,
  AnnotationsState,
} from "./types/annotation.types";

export const ANNOTATIONS_INITIAL_STATE: AnnotationsState = {
  annotations: [],
  selectedId: null,
};

const updateAnnotationById = (
  annotations: Annotation[],
  action: Extract<AnnotationAction, { type: "UPDATE_ANNOTATION" }>
): Annotation[] => {
  const { id, kind, updates } = action.payload;

  return annotations.map((annotation) => {
    if (annotation.id !== id) return annotation;
    if (annotation.kind !== kind) return annotation;

    switch (kind) {
      case "rectangle": {
        return {
          ...annotation,
          width: updates.width,
          height: updates.height,
          color: updates.color ?? annotation.color,
        };
      }
      case "circle": {
        return {
          ...annotation,
          radius: updates.radius,
          color: updates.color ?? annotation.color,
        };
      }
      case "line": {
        return {
          ...annotation,
          points: updates.points,
          color: updates.color ?? annotation.color,
        };
      }
      case "text": {
        const textAnnotation = annotation as Extract<Annotation, { kind: "text" }>;
        return {
          ...annotation,
          text: updates.text,
          fontSize: updates.fontSize ?? textAnnotation.fontSize,
          color: updates.color ?? annotation.color,
        };
      }
    }
  });
};

export const annotationsReducer = (
  state: AnnotationsState,
  action: AnnotationAction
): AnnotationsState => {
  switch (action.type) {
    case "ADD_ANNOTATION": {
      return {
        annotations: [...state.annotations, action.payload],
        selectedId: action.payload.id,
      };
    }
    case "UPDATE_ANNOTATION": {
      return {
        ...state,
        annotations: updateAnnotationById(state.annotations, action),
      };
    }
    case "MOVE_ANNOTATION": {
      return {
        ...state,
        annotations: state.annotations.map((annotation) => {
          if (annotation.id !== action.payload.id) return annotation;
          return { ...annotation, x: action.payload.x, y: action.payload.y };
        }),
      };
    }
    case "DELETE_ANNOTATION": {
      const nextAnnotations = state.annotations.filter(
        (a) => a.id !== action.payload.id
      );
      return {
        annotations: nextAnnotations,
        selectedId:
          state.selectedId === action.payload.id ? null : state.selectedId,
      };
    }
    case "SELECT_ANNOTATION": {
      return {
        ...state,
        selectedId: action.payload.id,
      };
    }
  }
};
