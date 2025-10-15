import type { VNode, TextNode, SectionNode, ContainerNode, BoxNode } from "./types";

type ComponentProps<T = {}> = T & { children?: VNode | VNode[] };

const normalizeChildren = (children?: VNode | VNode[]): VNode[] =>
    Array.isArray(children) ? children : children ? [children] : [];

const createContainer = (type: "Doc" | "Page") => ({ children }: ComponentProps): ContainerNode => ({
    type,
    children: normalizeChildren(children)
});

export const Doc = createContainer("Doc");
export const Page = createContainer("Page");

export const Text = ({
    size = 12,
    colour = "#000000",
    align = "left",
    margin = [0, 0, 0, 0],
    lineHeight,
    font = "Helvetica",
    weight = "normal",
    style = "normal",
    children,
}: ComponentProps<{
    size?: number;
    colour?: string;
    align?: "left" | "center" | "right";
    margin?: [number, number, number, number];
    lineHeight?: number;
    font?: "Helvetica" | "Times" | "Courier";
    weight?: "normal" | "bold";
    style?: "normal" | "italic" | "bold-italic";
}>): TextNode => ({
    type: "Text",
    content: (Array.isArray(children) ? children : [children])
        .filter((c) => typeof c === "string")
        .join(""),
    size,
    colour,
    align,
    margin,
    lineHeight,
    font,
    weight,
    style,
});

export const Section = ({ title, children }: ComponentProps<{ title: string }>): SectionNode => ({
    type: "Section",
    title,
    children: normalizeChildren(children)
});

export const Box = ({
    padding = [0, 0, 0, 0],
    margin = [0, 0, 0, 0],
    children,
    ...props
}: ComponentProps<{
    x?: number;
    y?: number;
    position?: "relative" | "absolute";
    width?: number;
    height?: number;
    padding?: [number, number, number, number];
    margin?: [number, number, number, number];
    border?: { width: number; color: string };
    backgroundColor?: string;
}>): BoxNode => ({
    type: "Box",
    ...props,
    padding,
    margin,
    children: normalizeChildren(children)
});