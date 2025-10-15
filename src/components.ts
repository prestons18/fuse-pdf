import type { VNode, TextNode, SectionNode, ContainerNode } from "./render";

type ComponentProps<T = {}> = T & {
    children?: VNode | VNode[];
};

// Component factories
export const Doc = ({ children }: ComponentProps): ContainerNode => ({
    type: "Doc",
    children: Array.isArray(children) ? children : children ? [children] : []
});

export const Page = ({ children }: ComponentProps): ContainerNode => ({
    type: "Page",
    children: Array.isArray(children) ? children : children ? [children] : []
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
    children: Array.isArray(children) ? children : children ? [children] : []
});