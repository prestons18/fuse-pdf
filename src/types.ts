export interface TextNode {
  type: "Text";
  content: string;
  size?: number;
  colour?: string;
  align?: "left" | "center" | "right";
  margin?: [number, number, number, number];
  font?: "Helvetica" | "Times" | "Courier";
  weight?: "normal" | "bold";
  style?: "normal" | "italic" | "bold-italic";
}

export interface SectionNode {
  type: "Section";
  title: string;
  children: VNode[];
}

export interface BoxNode {
  type: "Box";
  x?: number;
  y?: number;
  position?: "relative" | "absolute";
  width?: number;
  height?: number;
  padding?: [number, number, number, number];
  margin?: [number, number, number, number];
  border?: {
    width: number;
    color: string;
  };
  backgroundColor?: string;
  children: VNode[];
}

export interface ContainerNode {
  type: "Doc" | "Page";
  children: VNode[];
}

export type VNode = TextNode | SectionNode | BoxNode | ContainerNode | VNode[];