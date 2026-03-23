export type AnnotationKind = "rectangle" | "circle" | "line" | "text";

export type AnnotationTool = "select" | AnnotationKind;

export type PageSize = {
  width: number;
  height: number;
};

export type BaseAnnotation = {
  id: string;
  kind: AnnotationKind;
  x: number;
  y: number;
  color: string;
};

export type RectangleAnnotation = BaseAnnotation & {
  kind: "rectangle";
  width: number;
  height: number;
};

export type CircleAnnotation = BaseAnnotation & {
  kind: "circle";
  radius: number;
};

export type LineAnnotation = BaseAnnotation & {
  kind: "line";
  /**
   * Points relative to (x, y).
   * For a single segment line: [0, 0, dx, dy].
   */
  points: number[];
};

export type TextAnnotation = BaseAnnotation & {
  kind: "text";
  text: string;
  fontSize: number;
};

export type Annotation =
  | RectangleAnnotation
  | CircleAnnotation
  | LineAnnotation
  | TextAnnotation;

export type AnnotationAddPayload = Annotation;

export type AnnotationMovePayload = {
  id: string;
  x: number;
  y: number;
};

export type AnnotationSelectPayload = {
  id: string | null;
};

export type UpdateRectanglePayload = {
  id: string;
  kind: "rectangle";
  updates: { width: number; height: number; color?: string };
};

export type UpdateCirclePayload = {
  id: string;
  kind: "circle";
  updates: { radius: number; color?: string };
};

export type UpdateLinePayload = {
  id: string;
  kind: "line";
  updates: { points: number[]; color?: string };
};

export type UpdateTextPayload = {
  id: string;
  kind: "text";
  updates: { text: string; fontSize?: number; color?: string };
};

export type UpdateAnnotationPayload =
  | UpdateRectanglePayload
  | UpdateCirclePayload
  | UpdateLinePayload
  | UpdateTextPayload;

export type AddAnnotationAction = {
  type: "ADD_ANNOTATION";
  payload: AnnotationAddPayload;
};

export type UpdateAnnotationAction = {
  type: "UPDATE_ANNOTATION";
  payload: UpdateAnnotationPayload;
};

export type MoveAnnotationAction = {
  type: "MOVE_ANNOTATION";
  payload: AnnotationMovePayload;
};

export type DeleteAnnotationAction = {
  type: "DELETE_ANNOTATION";
  payload: { id: string };
};

export type SelectAnnotationAction = {
  type: "SELECT_ANNOTATION";
  payload: AnnotationSelectPayload;
};

export type AnnotationAction =
  | AddAnnotationAction
  | UpdateAnnotationAction
  | MoveAnnotationAction
  | DeleteAnnotationAction
  | SelectAnnotationAction;

export type AnnotationsState = {
  annotations: Annotation[];
  selectedId: string | null;
};

