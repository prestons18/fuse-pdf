import type { VNode } from "./runtime";

type ComponentProps<T = {}> = T & {
    children?: VNode | VNode[];
};

// Component factories
export const Doc = ({ children }: ComponentProps) => ({
    type: "Doc",
    children: Array.isArray(children) ? children : children ? [children] : []
});

export const Page = ({ children }: ComponentProps) => ({
    type: "Page",
    children: Array.isArray(children) ? children : children ? [children] : []
});

export const Text = ({ size = 12, children }: ComponentProps<{ size?: number }>) => ({
    type: "Text",
    content: Array.isArray(children)
        ? children.map(c => typeof c === 'string' ? c : '').join("")
        : typeof children === 'string' ? children : '',
    size
});

export const Section = ({ title, children }: ComponentProps<{ title: string }>) => ({
    type: "Section",
    title,
    children: Array.isArray(children) ? children : children ? [children] : []
});