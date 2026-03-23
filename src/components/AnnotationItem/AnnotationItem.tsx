"use client";

import type {
  Annotation,
  AnnotationTool,
  AnnotationMovePayload,
} from "@/features/annotations/types/annotation.types";
import { Circle, Line, Rect, Text } from "react-konva";
import {
  ANNOTATION_CORNER_RADIUS,
  hexToRgba,
  PRIMARY_COLOR,
} from "@/utils/constants";

type AnnotationItemProps = {
  annotation: Annotation;
  isSelected: boolean;
  tool: AnnotationTool;
  onSelect: (id: string) => void;
  onMove: (payload: AnnotationMovePayload) => void;
  onRequestEditText: (id: string) => void;
};

export const AnnotationItem = ({
  annotation,
  isSelected,
  tool,
  onSelect,
  onMove,
  onRequestEditText,
}: AnnotationItemProps) => {
  const draggable = tool === "select" && isSelected;

  const commonProps = {
    onClick: () => {
      if (tool !== "select") return;
      onSelect(annotation.id);
    },
    onTap: () => {
      if (tool !== "select") return;
      onSelect(annotation.id);
    },
  };

  switch (annotation.kind) {
    case "rectangle": {
      const baseColor = annotation.color;
      const strokeColor = isSelected ? PRIMARY_COLOR : baseColor;
      return (
        <Rect
          {...commonProps}
          x={annotation.x}
          y={annotation.y}
          width={annotation.width}
          height={annotation.height}
          cornerRadius={ANNOTATION_CORNER_RADIUS}
          fill={hexToRgba(baseColor, 0.15)}
          stroke={strokeColor}
          strokeWidth={isSelected ? 3 : 1.5}
          shadowForStrokeEnabled
          shadowColor={hexToRgba(baseColor, 0.35)}
          shadowBlur={isSelected ? 10 : 0}
          draggable={draggable}
          onDragEnd={(e) => {
            const node = e.target;
            onMove({ id: annotation.id, x: node.x(), y: node.y() });
          }}
        />
      );
    }
    case "circle": {
      const baseColor = annotation.color;
      const strokeColor = isSelected ? PRIMARY_COLOR : baseColor;
      return (
        <Circle
          {...commonProps}
          x={annotation.x}
          y={annotation.y}
          radius={annotation.radius}
          fill={hexToRgba(baseColor, 0.15)}
          stroke={strokeColor}
          strokeWidth={isSelected ? 3 : 1.5}
          shadowForStrokeEnabled
          shadowColor={hexToRgba(baseColor, 0.35)}
          shadowBlur={isSelected ? 10 : 0}
          draggable={draggable}
          onDragEnd={(e) => {
            const node = e.target;
            onMove({ id: annotation.id, x: node.x(), y: node.y() });
          }}
        />
      );
    }
    case "line": {
      const baseColor = annotation.color;
      const strokeColor = isSelected ? PRIMARY_COLOR : baseColor;
      return (
        <Line
          {...commonProps}
          points={annotation.points}
          x={annotation.x}
          y={annotation.y}
          stroke={strokeColor}
          strokeWidth={isSelected ? 3 : 2}
          lineCap="round"
          lineJoin="round"
          draggable={draggable}
          dash={isSelected ? undefined : [8, 0]}
          shadowColor={hexToRgba(baseColor, 0.35)}
          shadowBlur={isSelected ? 10 : 0}
          onDragEnd={(e) => {
            const node = e.target;
            onMove({ id: annotation.id, x: node.x(), y: node.y() });
          }}
        />
      );
    }
    case "text": {
      const baseColor = annotation.color;
      const fillColor = isSelected ? PRIMARY_COLOR : baseColor;
      const hasText = annotation.text.trim().length > 0;
      const displayText = hasText ? annotation.text : "Click to type";
      const displayOpacity = hasText ? 1 : 0.45;

      return (
        <Text
          {...commonProps}
          x={annotation.x}
          y={annotation.y}
          text={displayText}
          fontSize={annotation.fontSize}
          fill={fillColor}
          opacity={displayOpacity}
          draggable={draggable}
          onDragEnd={(e) => {
            const node = e.target;
            onMove({ id: annotation.id, x: node.x(), y: node.y() });
          }}
          onMouseDown={() => {
            if (tool !== "select") return;
            onSelect(annotation.id);
          }}
          onDblClick={() => {
            if (tool !== "select") return;
            onRequestEditText(annotation.id);
          }}
        />
      );
    }
    default: {
      return null;
    }
  }
};
