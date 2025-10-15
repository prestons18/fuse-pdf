import type { VNode, TextNode, SectionNode, ContainerNode, BoxNode } from "./types";

type ComponentProps<T = {}> = T & {
    children?: VNode | VNode[];
};

const normalizeChildren = (children?: VNode | VNode[]): VNode[] =>
    Array.isArray(children) ? children : children ? [children] : [];

// Component factories
export const Doc = ({ children }: ComponentProps): ContainerNode => ({
    type: "Doc",
    children: normalizeChildren(children)
});

export const Page = ({ children }: ComponentProps): ContainerNode => ({
    type: "Page",
    children: normalizeChildren(children)
});

export const Text = ({
    size = 12,
    colour = "#000000",
    align = "left",
    margin = [0, 0, 0, 0],
    font = "Helvetica",
    weight = "normal",
    style = "normal",
    children,
}: ComponentProps<{
    size?: number;
    colour?: string;
    align?: "left" | "center" | "right";
    margin?: [number, number, number, number];
    font?: "Helvetica" | "Times" | "Courier";
    weight?: "normal" | "bold";
    style?: "normal" | "italic" | "bold-italic";
}>): TextNode => ({
    type: "Text" as const,
    content: Array.isArray(children)
        ? children.map((c) => (typeof c === "string" ? c : "")).join("")
        : typeof children === "string"
            ? children
            : "",
    size,
    colour,
    align,
    margin,
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
    x,
    y,
    position,
    width,
    height,
    padding = [0, 0, 0, 0],
    margin = [0, 0, 0, 0],
    border,
    backgroundColor,
    children,
}: ComponentProps<{
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
}>): BoxNode => ({
    type: "Box",
    x,
    y,
    position,
    width,
    height,
    padding,
    margin,
    border,
    backgroundColor,
    children: normalizeChildren(children)
});