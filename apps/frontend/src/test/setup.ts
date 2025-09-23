import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock do React Router
vi.mock("@tanstack/react-router", () => ({
    createRootRoute: vi.fn(),
    createRoute: vi.fn(),
    createRouter: vi.fn(),
    RouterProvider: vi.fn(),
    useLocation: vi.fn(() => ({ pathname: "/" })),
    useNavigate: vi.fn(() => vi.fn()),
    useSearch: vi.fn(() => ({})),
    Link: vi.fn(({ children, ...props }) => <a {...props}>{children}</a>),
    Outlet: vi.fn(() => <div data-testid="outlet" />),
}));

// Mock do React Query
vi.mock("@tanstack/react-query", () => ({
    useQuery: vi.fn(),
    useMutation: vi.fn(),
    useQueryClient: vi.fn(() => ({
        invalidateQueries: vi.fn(),
        setQueryData: vi.fn(),
        getQueryData: vi.fn(),
    })),
    QueryClient: vi.fn(),
    QueryClientProvider: vi.fn(({ children }) => children),
}));

// Mock do Axios
vi.mock("axios", () => ({
    default: {
        create: vi.fn(() => ({
            get: vi.fn(),
            post: vi.fn(),
            put: vi.fn(),
            delete: vi.fn(),
            interceptors: {
                request: { use: vi.fn() },
                response: { use: vi.fn() },
            },
        })),
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
    },
}));

// Mock do Zustand
vi.mock("zustand", () => ({
    default: vi.fn(() => ({
        getState: vi.fn(),
        setState: vi.fn(),
        subscribe: vi.fn(),
        destroy: vi.fn(),
    })),
    create: vi.fn(),
}));

// Mock do ReactFlow
vi.mock("reactflow", () => ({
    ReactFlow: vi.fn(({ children }) => <div data-testid="react-flow">{children}</div>),
    ReactFlowProvider: vi.fn(({ children }) => <div data-testid="react-flow-provider">{children}</div>),
    useReactFlow: vi.fn(() => ({
        addNodes: vi.fn(),
        addEdges: vi.fn(),
        getNodes: vi.fn(() => []),
        getEdges: vi.fn(() => []),
        setNodes: vi.fn(),
        setEdges: vi.fn(),
        fitView: vi.fn(),
        getViewport: vi.fn(() => ({ x: 0, y: 0, zoom: 1 })),
        setViewport: vi.fn(),
    })),
    useNodesState: vi.fn(() => [[], vi.fn()]),
    useEdgesState: vi.fn(() => [[], vi.fn()]),
    Handle: vi.fn(({ children, ...props }) => <div data-testid="handle" {...props}>{children}</div>),
    Position: {
        Top: "top",
        Right: "right",
        Bottom: "bottom",
        Left: "left",
    },
    NodeProps: vi.fn(),
    Edge: vi.fn(),
    Node: vi.fn(),
    MarkerType: {
        Arrow: "arrow",
        ArrowClosed: "arrowclosed",
    },
    ConnectionMode: {
        Loose: "loose",
        Strict: "strict",
    },
    Background: vi.fn(({ children, ...props }) => <div data-testid="background" {...props}>{children}</div>),
    Controls: vi.fn(({ children, ...props }) => <div data-testid="controls" {...props}>{children}</div>),
    MiniMap: vi.fn(({ children, ...props }) => <div data-testid="minimap" {...props}>{children}</div>),
    Panel: vi.fn(({ children, ...props }) => <div data-testid="panel" {...props}>{children}</div>),
}));

// Mock do React Hook Form
vi.mock("react-hook-form", () => ({
    useForm: vi.fn(() => ({
        register: vi.fn(),
        handleSubmit: vi.fn((fn) => fn),
        formState: { errors: {} },
        watch: vi.fn(),
        setValue: vi.fn(),
        getValues: vi.fn(),
        reset: vi.fn(),
    })),
    Controller: vi.fn(({ children, ...props }) => <div {...props}>{children}</div>),
}));

// Mock do React Hot Toast
vi.mock("react-hot-toast", () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
        loading: vi.fn(),
        dismiss: vi.fn(),
    },
    Toaster: vi.fn(() => <div data-testid="toaster" />),
}));

// Mock do window.matchMedia
Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(), // deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

// Mock do ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));

// Mock do IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));

// Mock do fetch
global.fetch = vi.fn();

// Mock do console para evitar logs nos testes
global.console = {
    ...console,
    log: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
};
