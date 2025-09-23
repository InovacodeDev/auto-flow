import React from "react";
import {
    createRootRoute,
    createRoute,
    createRouter,
    RouterProvider,
    Outlet,
} from "@tanstack/react-router";
import Sidebar from "./components/layout/Sidebar";
import WorkflowBuilder from "./pages/WorkflowBuilder";
import IntegrationsPage from "./pages/IntegrationsPage";
import AIChatPage from "./pages/AIChatPage";
import DashboardPage from "./pages/DashboardPage";
import WorkflowsPage from "./pages/WorkflowsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { AuthRedirect } from "./components/auth/AuthRedirect";

// Root layout that includes Sidebar and an outlet for child routes
const RootLayout: React.FC = () => {
    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-white">
                <Sidebar isOpen={true} onClose={() => {}} />
                {/* use margin-left so the fixed sidebar doesn't overlap content */}
                <main className="min-h-screen ml-0 lg:ml-64">
                    {/* Giant content card: margin 8, light gray background, no shadow, visible border */}
                    <div className="m-8 bg-gray-100 shadow-none rounded-none min-h-[calc(100vh-4rem)] overflow-auto border border-gray-200">
                        <Outlet />
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
};

// Auth layout for login/register pages (no sidebar)
const AuthLayout: React.FC = () => {
    return (
        <div className="min-h-screen bg-white">
            <Outlet />
        </div>
    );
};

// Create root route
const rootRoute = createRootRoute({
    component: () => <AuthRedirect />,
});

// Create auth layout route
const authRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/auth",
    component: AuthLayout,
});

// Create main app layout route
const appRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    component: RootLayout,
});

// Auth routes (no protection needed)
createRoute({ getParentRoute: () => authRoute, path: "/login", component: LoginPage });
createRoute({ getParentRoute: () => authRoute, path: "/register", component: RegisterPage });

// Main app routes (protected)
createRoute({ getParentRoute: () => appRoute, path: "/", component: DashboardPage });
createRoute({ getParentRoute: () => appRoute, path: "/dashboard", component: DashboardPage });
createRoute({
    getParentRoute: () => appRoute,
    path: "/workflow-builder",
    component: WorkflowBuilder,
});
createRoute({ getParentRoute: () => appRoute, path: "/workflows", component: WorkflowsPage });
createRoute({ getParentRoute: () => appRoute, path: "/integrations", component: IntegrationsPage });
createRoute({ getParentRoute: () => appRoute, path: "/analytics", component: AnalyticsPage });
createRoute({ getParentRoute: () => appRoute, path: "/ai-chat", component: AIChatPage });

// Build the router
export const router = createRouter({
    routeTree: rootRoute,
});

export const AppRouter: React.FC = () => {
    return <RouterProvider router={router} />;
};
