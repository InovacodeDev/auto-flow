import React from "react";
import { createRootRoute, createRoute, createRouter, RouterProvider, Outlet } from "@tanstack/react-router";
import HomePage from "./pages/HomePage";
import TestPage from "./pages/TestPage";

// Create root route
const rootRoute = createRootRoute({
    component: () => (
        <div className="min-h-screen bg-gray-100">
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

// Create test route
const testRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/test",
    component: TestPage,
});

// Build the router tree
const routeTree = rootRoute.addChildren([homeRoute, testRoute]);

// Create the router
export const router = createRouter({
    routeTree,
});

// Router component
export const AppRouter: React.FC = () => {
    return <RouterProvider router={router} />;
};
