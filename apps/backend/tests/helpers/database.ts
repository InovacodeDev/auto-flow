/**
 * Database helper para testes
 * Configura banco de dados mockado para testes
 */

let testDb: any = null;

/**
 * Inicializa banco de dados de teste mockado
 */
export async function setupTestDatabase() {
    console.log("🧪 Setting up mocked test database");
    testDb = createMockDatabase();
    console.log("✅ Test database setup completed (mocked)");
    return testDb;
}

/**
 * Limpa banco de dados de teste
 */
export async function cleanupTestDatabase() {
    testDb = null;
    console.log("🧹 Test database cleaned up");
}

/**
 * Cria um banco de dados mockado para quando SQLite não estiver disponível
 */
function createMockDatabase() {
    const mockUsers = [
        {
            id: "temp-user-id",
            email: "test@example.com",
            name: "Test User",
            role: "admin",
            password_hash: "$2b$10$rH0UJK8PO8n8W8Q8eQZr/.N8oO9K7dBQkzY7jCGKP8k9qPp2zRb2S",
            is_active: true,
            organization_id: "temp-org-id",
            last_login_at: null,
            created_at: new Date(),
            updated_at: new Date(),
        },
    ];

    const mockOrganizations = [
        {
            id: "temp-org-id",
            name: "Test Organization",
            plan: "pro",
            created_at: new Date(),
            updated_at: new Date(),
        },
    ];

    const mockWorkflows: any[] = [];

    return {
        select: () => ({
            from: (table: any) => ({
                where: () => ({
                    limit: () => {
                        if (table.name === "users") return mockUsers;
                        if (table.name === "organizations") return mockOrganizations;
                        if (table.name === "workflows") return mockWorkflows;
                        return [];
                    },
                }),
                innerJoin: () => ({
                    where: () => ({
                        limit: () =>
                            mockUsers.map((user) => ({
                                ...user,
                                organizations: mockOrganizations[0],
                            })),
                    }),
                }),
            }),
        }),
        insert: () => ({
            values: () => ({
                returning: () => mockWorkflows,
            }),
        }),
        update: () => ({
            set: () => ({
                where: () => ({
                    returning: () => mockWorkflows,
                }),
            }),
        }),
        delete: () => ({
            where: () => ({
                returning: () => mockWorkflows,
            }),
        }),
    };
}

export { testDb };
