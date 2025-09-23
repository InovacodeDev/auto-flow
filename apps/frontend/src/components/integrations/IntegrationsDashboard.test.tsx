import React from "react";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders, mockIntegration, testHelpers } from "../../test/utils";
import { IntegrationsDashboard } from "./IntegrationsDashboard";

// Mock the integrations service
vi.mock("../../services/integrationsService", () => ({
    useIntegrationsOverview: () => ({
        data: {
            summary: {
                totalIntegrations: 5,
                activeIntegrations: 4,
                errorIntegrations: 1,
                configuringIntegrations: 0,
            },
            metrics: {
                monthlyOperations: 1000,
                successRate: 95.5,
                totalRevenue: 2500.5,
                avgResponseTime: 150,
            },
            byType: {
                whatsapp: 2,
                pix: 1,
                crm: 1,
                erp: 1,
            },
            alerts: [],
        },
        isLoading: false,
        error: null,
    }),
    useIntegrationsHealth: () => ({
        data: [mockIntegration],
        isLoading: false,
        error: null,
    }),
    useIntegrationsStats: () => ({
        data: {
            totalIntegrations: 5,
            activeIntegrations: 4,
            monthlyOperations: 1000,
            successRate: 95.5,
            totalRevenue: 2500.5,
            avgResponseTime: 150,
        },
        isLoading: false,
        error: null,
    }),
    useSyncIntegrations: () => ({
        mutate: vi.fn(),
        isPending: false,
        error: null,
    }),
    useCleanupIntegrations: () => ({
        mutate: vi.fn(),
        isPending: false,
        error: null,
    }),
    useExportIntegrations: () => ({
        mutate: vi.fn(),
        isPending: false,
        error: null,
    }),
}));

describe("IntegrationsDashboard", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders dashboard correctly", () => {
        renderWithProviders(<IntegrationsDashboard />);

        expect(screen.getByText("Dashboard de Integrações")).toBeInTheDocument();
        expect(
            screen.getByText("Monitore e gerencie todas as suas integrações")
        ).toBeInTheDocument();
    });

    it("renders tab navigation", () => {
        renderWithProviders(<IntegrationsDashboard />);

        expect(screen.getByText("Visão Geral")).toBeInTheDocument();
        expect(screen.getByText("Integrações")).toBeInTheDocument();
        expect(screen.getByText("Operações")).toBeInTheDocument();
        expect(screen.getByText("Alertas")).toBeInTheDocument();
    });

    it("shows overview tab by default", () => {
        renderWithProviders(<IntegrationsDashboard />);

        expect(screen.getByText("Visão Geral")).toHaveClass("bg-blue-600");
        expect(screen.getByText("Integrações")).toHaveClass("text-gray-600");
    });

    it("switches to integrations tab when clicked", async () => {
        const user = userEvent.setup();
        renderWithProviders(<IntegrationsDashboard />);

        const integrationsTab = screen.getByText("Integrações");
        await user.click(integrationsTab);

        expect(integrationsTab).toHaveClass("bg-blue-600");
        expect(screen.getByText("Visão Geral")).toHaveClass("text-gray-600");
    });

    it("switches to operations tab when clicked", async () => {
        const user = userEvent.setup();
        renderWithProviders(<IntegrationsDashboard />);

        const operationsTab = screen.getByText("Operações");
        await user.click(operationsTab);

        expect(operationsTab).toHaveClass("bg-blue-600");
        expect(screen.getByText("Visão Geral")).toHaveClass("text-gray-600");
    });

    it("switches to alerts tab when clicked", async () => {
        const user = userEvent.setup();
        renderWithProviders(<IntegrationsDashboard />);

        const alertsTab = screen.getByText("Alertas");
        await user.click(alertsTab);

        expect(alertsTab).toHaveClass("bg-blue-600");
        expect(screen.getByText("Visão Geral")).toHaveClass("text-gray-600");
    });

    it("renders global action buttons", () => {
        renderWithProviders(<IntegrationsDashboard />);

        expect(screen.getByText("Sincronizar Todas")).toBeInTheDocument();
        expect(screen.getByText("Exportar Dados")).toBeInTheDocument();
        expect(screen.getByText("Limpar Dados Antigos")).toBeInTheDocument();
    });

    it("calls sync all when sync button is clicked", async () => {
        const user = userEvent.setup();
        const mockSync = vi.fn();

        vi.mocked(
            require("../../services/integrationsService").useSyncIntegrations
        ).mockReturnValue({
            mutate: mockSync,
            isPending: false,
            error: null,
        });

        renderWithProviders(<IntegrationsDashboard />);

        const syncButton = screen.getByText("Sincronizar Todas");
        await user.click(syncButton);

        expect(mockSync).toHaveBeenCalled();
    });

    it("calls cleanup when cleanup button is clicked", async () => {
        const user = userEvent.setup();
        const mockCleanup = vi.fn();

        vi.mocked(
            require("../../services/integrationsService").useCleanupIntegrations
        ).mockReturnValue({
            mutate: mockCleanup,
            isPending: false,
            error: null,
        });

        renderWithProviders(<IntegrationsDashboard />);

        const cleanupButton = screen.getByText("Limpar Dados Antigos");
        await user.click(cleanupButton);

        expect(mockCleanup).toHaveBeenCalled();
    });

    it("calls export when export button is clicked", async () => {
        const user = userEvent.setup();
        const mockExport = vi.fn();

        vi.mocked(
            require("../../services/integrationsService").useExportIntegrations
        ).mockReturnValue({
            mutate: mockExport,
            isPending: false,
            error: null,
        });

        renderWithProviders(<IntegrationsDashboard />);

        const exportButton = screen.getByText("Exportar Dados");
        await user.click(exportButton);

        expect(mockExport).toHaveBeenCalled();
    });

    it("shows loading state when data is loading", () => {
        vi.mocked(
            require("../../services/integrationsService").useIntegrationsOverview
        ).mockReturnValue({
            data: null,
            isLoading: true,
            error: null,
        });

        renderWithProviders(<IntegrationsDashboard />);

        expect(screen.getByText("Carregando...")).toBeInTheDocument();
    });

    it("shows error state when there is an error", () => {
        vi.mocked(
            require("../../services/integrationsService").useIntegrationsOverview
        ).mockReturnValue({
            data: null,
            isLoading: false,
            error: new Error("Failed to load data"),
        });

        renderWithProviders(<IntegrationsDashboard />);

        expect(screen.getByText("Erro ao carregar dashboard")).toBeInTheDocument();
        expect(screen.getByText("Tente recarregar a página")).toBeInTheDocument();
    });

    it("shows sync loading state when sync is pending", () => {
        vi.mocked(
            require("../../services/integrationsService").useSyncIntegrations
        ).mockReturnValue({
            mutate: vi.fn(),
            isPending: true,
            error: null,
        });

        renderWithProviders(<IntegrationsDashboard />);

        const syncButton = screen.getByText("Sincronizar Todas");
        expect(syncButton).toBeDisabled();
        expect(syncButton).toHaveClass("opacity-50");
    });

    it("renders filters when on integrations tab", async () => {
        const user = userEvent.setup();
        renderWithProviders(<IntegrationsDashboard />);

        const integrationsTab = screen.getByText("Integrações");
        await user.click(integrationsTab);

        // Filters should be rendered in the integrations tab
        expect(screen.getByText("Filtros")).toBeInTheDocument();
    });

    it("renders integration cards when on integrations tab", async () => {
        const user = userEvent.setup();
        renderWithProviders(<IntegrationsDashboard />);

        const integrationsTab = screen.getByText("Integrações");
        await user.click(integrationsTab);

        // Integration cards should be rendered
        expect(screen.getByText("WhatsApp Business")).toBeInTheDocument();
        expect(screen.getByText("Conectado")).toBeInTheDocument();
    });

    it("renders operations table when on operations tab", async () => {
        const user = userEvent.setup();
        renderWithProviders(<IntegrationsDashboard />);

        const operationsTab = screen.getByText("Operações");
        await user.click(operationsTab);

        // Operations table should be rendered
        expect(screen.getByText("Histórico de Operações")).toBeInTheDocument();
    });

    it("renders alerts when on alerts tab", async () => {
        const user = userEvent.setup();
        renderWithProviders(<IntegrationsDashboard />);

        const alertsTab = screen.getByText("Alertas");
        await user.click(alertsTab);

        // Alerts should be rendered
        expect(screen.getByText("Nenhum alerta")).toBeInTheDocument();
    });
});
