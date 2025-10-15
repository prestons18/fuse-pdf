export type { VNode, TextNode, SectionNode, ContainerNode } from "./types";

export function createElement(
    type: string | Function,
    props: Record<string, any> | null,
    ...children: any[]
): any {
    const normalizedProps = props || {};
    const normalizedChildren = children.flat();
    
    return typeof type === 'function'
        ? type({ ...normalizedProps, children: normalizedChildren })
        : { type, props: normalizedProps, children: normalizedChildren };
}

// JSX namespace declaration for TypeScript
declare global {
    namespace JSX {
        interface IntrinsicElements {
            [key: string]: any;
        }
    }
}