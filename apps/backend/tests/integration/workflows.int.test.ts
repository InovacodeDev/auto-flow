import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { FastifyInstance } from "fastify";
import { build } from "../../src/index";

describe("Workflows Integration Tests", () => {
    let app: FastifyInstance;
    let accessToken: string;
    let workflowId: string;

    beforeAll(async () => {
        app = build();
        await app.ready();
    });

    afterAll(async () => {
        await app.close();
    });

    beforeEach(async () => {
        // Login to get access token
        const loginResponse = await app.inject({
            method: "POST",
            url: "/api/auth/login",
            payload: {
                email: "test@example.com",
                password: "password123",
            },
        });

        const loginData = JSON.parse(loginResponse.body);
        accessToken = loginData.accessToken;
    });

    describe("POST /api/workflows", () => {
        it("should create workflow with valid data", async () => {
            const workflowData = {
                name: "Test Workflow",
                description: "A test workflow",
                nodes: [
                    {
                        id: "node_1",
                        type: "manualTrigger",
                        position: { x: 100, y: 100 },
                        data: { label: "Start" },
                    },
                    {
                        id: "node_2",
                        type: "httpRequestAction",
                        position: { x: 300, y: 100 },
                        data: { label: "HTTP Request" },
                    },
                ],
                edges: [
                    {
                        id: "edge_1",
                        source: "node_1",
                        target: "node_2",
                    },
                ],
            };

            const response = await app.inject({
                method: "POST",
                url: "/api/workflows",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                payload: workflowData,
            });

            expect(response.statusCode).toBe(201);
            const data = JSON.parse(response.body);
            expect(data).toHaveProperty("id");
            expect(data.name).toBe(workflowData.name);
            expect(data.description).toBe(workflowData.description);
            expect(data.nodes).toHaveLength(2);
            expect(data.edges).toHaveLength(1);

            workflowId = data.id;
        });

        it("should return 400 for invalid workflow data", async () => {
            const invalidData = {
                name: "", // Empty name
                description: "A test workflow",
            };

            const response = await app.inject({
                method: "POST",
                url: "/api/workflows",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                payload: invalidData,
            });

            expect(response.statusCode).toBe(400);
            const data = JSON.parse(response.body);
            expect(data).toHaveProperty("error");
        });

        it("should return 401 without authentication", async () => {
            const workflowData = {
                name: "Test Workflow",
                description: "A test workflow",
            };

            const response = await app.inject({
                method: "POST",
                url: "/api/workflows",
                payload: workflowData,
            });

            expect(response.statusCode).toBe(401);
            const data = JSON.parse(response.body);
            expect(data).toHaveProperty("error");
        });
    });

    describe("GET /api/workflows", () => {
        it("should return list of workflows", async () => {
            const response = await app.inject({
                method: "GET",
                url: "/api/workflows",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            expect(response.statusCode).toBe(200);
            const data = JSON.parse(response.body);
            expect(Array.isArray(data)).toBe(true);
        });

        it("should return 401 without authentication", async () => {
            const response = await app.inject({
                method: "GET",
                url: "/api/workflows",
            });

            expect(response.statusCode).toBe(401);
            const data = JSON.parse(response.body);
            expect(data).toHaveProperty("error");
        });
    });

    describe("GET /api/workflows/:id", () => {
        it("should return workflow by id", async () => {
            const response = await app.inject({
                method: "GET",
                url: `/api/workflows/${workflowId}`,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            expect(response.statusCode).toBe(200);
            const data = JSON.parse(response.body);
            expect(data).toHaveProperty("id");
            expect(data.id).toBe(workflowId);
        });

        it("should return 404 for non-existent workflow", async () => {
            const response = await app.inject({
                method: "GET",
                url: "/api/workflows/non-existent-id",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            expect(response.statusCode).toBe(404);
            const data = JSON.parse(response.body);
            expect(data).toHaveProperty("error");
        });

        it("should return 401 without authentication", async () => {
            const response = await app.inject({
                method: "GET",
                url: `/api/workflows/${workflowId}`,
            });

            expect(response.statusCode).toBe(401);
            const data = JSON.parse(response.body);
            expect(data).toHaveProperty("error");
        });
    });

    describe("PUT /api/workflows/:id", () => {
        it("should update workflow with valid data", async () => {
            const updateData = {
                name: "Updated Workflow",
                description: "An updated test workflow",
                nodes: [
                    {
                        id: "node_1",
                        type: "manualTrigger",
                        position: { x: 100, y: 100 },
                        data: { label: "Start" },
                    },
                    {
                        id: "node_2",
                        type: "httpRequestAction",
                        position: { x: 300, y: 100 },
                        data: { label: "HTTP Request" },
                    },
                    {
                        id: "node_3",
                        type: "emailAction",
                        position: { x: 500, y: 100 },
                        data: { label: "Send Email" },
                    },
                ],
                edges: [
                    {
                        id: "edge_1",
                        source: "node_1",
                        target: "node_2",
                    },
                    {
                        id: "edge_2",
                        source: "node_2",
                        target: "node_3",
                    },
                ],
            };

            const response = await app.inject({
                method: "PUT",
                url: `/api/workflows/${workflowId}`,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                payload: updateData,
            });

            expect(response.statusCode).toBe(200);
            const data = JSON.parse(response.body);
            expect(data.name).toBe(updateData.name);
            expect(data.description).toBe(updateData.description);
            expect(data.nodes).toHaveLength(3);
            expect(data.edges).toHaveLength(2);
        });

        it("should return 400 for invalid update data", async () => {
            const invalidData = {
                name: "", // Empty name
                description: "An updated test workflow",
            };

            const response = await app.inject({
                method: "PUT",
                url: `/api/workflows/${workflowId}`,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                payload: invalidData,
            });

            expect(response.statusCode).toBe(400);
            const data = JSON.parse(response.body);
            expect(data).toHaveProperty("error");
        });

        it("should return 404 for non-existent workflow", async () => {
            const updateData = {
                name: "Updated Workflow",
                description: "An updated test workflow",
            };

            const response = await app.inject({
                method: "PUT",
                url: "/api/workflows/non-existent-id",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                payload: updateData,
            });

            expect(response.statusCode).toBe(404);
            const data = JSON.parse(response.body);
            expect(data).toHaveProperty("error");
        });
    });

    describe("DELETE /api/workflows/:id", () => {
        it("should delete workflow", async () => {
            const response = await app.inject({
                method: "DELETE",
                url: `/api/workflows/${workflowId}`,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            expect(response.statusCode).toBe(200);
            const data = JSON.parse(response.body);
            expect(data).toHaveProperty("message");
        });

        it("should return 404 for non-existent workflow", async () => {
            const response = await app.inject({
                method: "DELETE",
                url: "/api/workflows/non-existent-id",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            expect(response.statusCode).toBe(404);
            const data = JSON.parse(response.body);
            expect(data).toHaveProperty("error");
        });

        it("should return 401 without authentication", async () => {
            const response = await app.inject({
                method: "DELETE",
                url: `/api/workflows/${workflowId}`,
            });

            expect(response.statusCode).toBe(401);
            const data = JSON.parse(response.body);
            expect(data).toHaveProperty("error");
        });
    });

    describe("POST /api/workflows/:id/execute", () => {
        it("should execute workflow", async () => {
            const response = await app.inject({
                method: "POST",
                url: `/api/workflows/${workflowId}/execute`,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            expect(response.statusCode).toBe(200);
            const data = JSON.parse(response.body);
            expect(data).toHaveProperty("executionId");
            expect(data).toHaveProperty("status");
        });

        it("should return 404 for non-existent workflow", async () => {
            const response = await app.inject({
                method: "POST",
                url: "/api/workflows/non-existent-id/execute",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            expect(response.statusCode).toBe(404);
            const data = JSON.parse(response.body);
            expect(data).toHaveProperty("error");
        });

        it("should return 401 without authentication", async () => {
            const response = await app.inject({
                method: "POST",
                url: `/api/workflows/${workflowId}/execute`,
            });

            expect(response.statusCode).toBe(401);
            const data = JSON.parse(response.body);
            expect(data).toHaveProperty("error");
        });
    });
});
