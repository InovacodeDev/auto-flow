import { beforeAll, afterAll, beforeEach } from "vitest";
import { FastifyInstance } from "fastify";
import { build } from "../../src/index";

let app: FastifyInstance;

beforeAll(async () => {
    app = build();
    await app.ready();
});

afterAll(async () => {
    await app.close();
});

beforeEach(async () => {
    // Clean up database or reset state if needed
    // This could include:
    // - Clearing test data
    // - Resetting database state
    // - Cleaning up external services
});

export { app };
