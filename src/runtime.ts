// Type definitions
export type VNode = {
    type: string | Function;
    props: Record<string, any>;
    children: VNode[];
};

// JSX factory function
export function createElement(
    type: string | Function,
    props: Record<string, any> | null,
    ...children: any[]
): VNode {
    const normalizedProps = props || {};
    const normalizedChildren = children.flat();
    
    // If type is a function (component), call it with props and children
    if (typeof type === 'function') {
        return type({ ...normalizedProps, children: normalizedChildren });
    }
    
    // Otherwise, return a VNode
    return {
        type,
        props: normalizedProps,
        children: normalizedChildren
    };
}

// JSX namespace declaration for TypeScript
declare global {
    namespace JSX {
        interface IntrinsicElements {
            [key: string]: any;
        }
    }
}