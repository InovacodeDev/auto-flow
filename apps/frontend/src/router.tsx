import React from "react";
import { createRootRoute, createRoute, createRouter, RouterProvider, Outlet } from "@tanstack/react-router";
import Sidebar from "./components/layout/Sidebar";
import WorkflowBuilder from "./pages/WorkflowBuilder";
import IntegrationsPage from "./pages/IntegrationsPage";
import AIChatPage from "./pages/AIChatPage";
import DashboardPage from "./pages/DashboardPage";
import WorkflowsPage from "./pages/WorkflowsPage";
import AnalyticsPage from "./pages/AnalyticsPage";

// Root layout that includes Sidebar and an outlet for child routes
const RootLayout: React.FC = () => {
    return (
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
    );
};

// Create a root route and child routes using the v1 route-tree API
const rootRoute = createRootRoute({
    component: RootLayout,
});

// Create child routes and attach them to the root route via getParentRoute
createRoute({ getParentRoute: () => rootRoute, path: "/", component: DashboardPage });
createRoute({ getParentRoute: () => rootRoute, path: "/dashboard", component: DashboardPage });
createRoute({ getParentRoute: () => rootRoute, path: "/workflow-builder", component: WorkflowBuilder });
createRoute({ getParentRoute: () => rootRoute, path: "/workflows", component: WorkflowsPage });
createRoute({ getParentRoute: () => rootRoute, path: "/integrations", component: IntegrationsPage });
createRoute({ getParentRoute: () => rootRoute, path: "/analytics", component: AnalyticsPage });
createRoute({ getParentRoute: () => rootRoute, path: "/ai-chat", component: AIChatPage });

// Build the router
export const router = createRouter({
    routeTree: rootRoute,
});

export const AppRouter: React.FC = () => {
    return <RouterProvider router={router} />;
};
