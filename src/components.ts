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
    children,
}: ComponentProps<{
    size?: number;
    colour?: string;
    align?: "left" | "center" | "right";
    margin?: [number, number, number, number];
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
});

export const Section = ({ title, children }: ComponentProps<{ title: string }>): SectionNode => ({
    type: "Section",
    title,
    children: normalizeChildren(children)
});

export const Box = ({
    width,
    height,
    padding = [0, 0, 0, 0],
    margin = [0, 0, 0, 0],
    border,
    backgroundColor,
    children,
}: ComponentProps<{
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
    width,
    height,
    padding,
    margin,
    border,
    backgroundColor,
    children: normalizeChildren(children)
});