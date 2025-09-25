import React from "react";
import { createRootRoute, createRoute, createRouter, RouterProvider, Outlet } from "@tanstack/react-router";
import HomePage from "./pages/HomePage";
import TestPage from "./pages/TestPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import FeaturesPage from "./pages/FeaturesPage";
import IntegrationsPagePublic from "./pages/IntegrationsPagePublic";
import PricingPage from "./pages/PricingPage";
import { Sidebar } from "lucide-react";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import AIChatPage from "./pages/AIChatPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import DashboardPage from "./pages/DashboardPage";
import IntegrationsPage from "./pages/IntegrationsPage";
import WorkflowBuilder from "./pages/WorkflowBuilder";
import WorkflowsPage from "./pages/WorkflowsPage";

// Root layout that includes Sidebar and an outlet for child routes
const RootLayout: React.FC = () => {
    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-white">
                <Sidebar />
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

// Create root route
const rootRoute = createRootRoute({
    component: () => (
        <div className="min-h-screen">
            <Outlet />
        </div>
    ),
});

// Create home route
const homeRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    component: HomePage,
});

// Create login route (direct path, no auth parent)
const loginRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/login",
    component: LoginPage,
});

// Create register route (direct path, no auth parent)
const registerRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/register",
    component: RegisterPage,
});

// Create features route
const featuresRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/features",
    component: FeaturesPage,
});

// Create integrations route
const integrationsPublicRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/integrations",
    component: IntegrationsPagePublic,
});

// Create pricing route
const pricingRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/pricing",
    component: PricingPage,
});

// Create main app layout route
const appRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/app",
    component: RootLayout,
});
// App routes (protected)
const dashboardRoute = createRoute({
    getParentRoute: () => appRoute,
    path: "/dashboard",
    component: DashboardPage,
});
const workflowBuilderRoute = createRoute({
    getParentRoute: () => appRoute,
    path: "/workflow-builder",
    component: WorkflowBuilder,
});
const workflowsRoute = createRoute({
    getParentRoute: () => appRoute,
    path: "/workflows",
    component: WorkflowsPage,
});
const integrationsRoute = createRoute({
    getParentRoute: () => appRoute,
    path: "/integrations",
    component: IntegrationsPage,
});
const analyticsRoute = createRoute({
    getParentRoute: () => appRoute,
    path: "/analytics",
    component: AnalyticsPage,
});
const aiChatRoute = createRoute({
    getParentRoute: () => appRoute,
    path: "/ai-chat",
    component: AIChatPage,
});
const testRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/test",
    component: TestPage,
});

// Build the router tree
const routeTree = rootRoute.addChildren([
    homeRoute,
    loginRoute,
    registerRoute,
    featuresRoute,
    integrationsPublicRoute,
    pricingRoute,
    appRoute.addChildren([
        dashboardRoute,
        workflowBuilderRoute,
        workflowsRoute,
        integrationsRoute,
        analyticsRoute,
        aiChatRoute,
    ]),
    testRoute,
]);

// Build the router
export const router = createRouter({
    routeTree,
});

export const AppRouter: React.FC = () => {
    return <RouterProvider router={router} />;
};
