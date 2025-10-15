export interface TextNode {
  type: "Text";
  content: string;
  size?: number;
  colour?: string;
  align?: "left" | "center" | "right";
  margin?: [number, number, number, number];
}

export interface SectionNode {
  type: "Section";
  title: string;
  children: VNode[];
}

export interface ContainerNode {
  type: "Doc" | "Page";
  children: VNode[];
}

export type VNode = TextNode | SectionNode | ContainerNode | VNode[];