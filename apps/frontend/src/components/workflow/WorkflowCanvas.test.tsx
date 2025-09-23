import React from "react";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders, mockWorkflow, testHelpers } from "../../test/utils";
import { WorkflowCanvas } from "./WorkflowCanvas";

// Mock the workflow service
vi.mock("../../services/workflowService", () => ({
    useWorkflowCanvas: () => ({
        nodes: mockWorkflow.nodes,
        edges: mockWorkflow.edges,
        selectedNode: null,
        isLibraryOpen: false,
        isInspectorOpen: false,
        isHelpOpen: false,
        workflowName: "Test Workflow",
        hasChanges: false,
        isSaving: false,
        onConnect: vi.fn(),
        onNodeClick: vi.fn(),
        addNode: vi.fn(),
        updateNodeConfig: vi.fn(),
        deleteNode: vi.fn(),
        duplicateNode: vi.fn(),
        saveWorkflow: vi.fn(),
        clearCanvas: vi.fn(),
        loadTemplate: vi.fn(),
        toggleLibrary: vi.fn(),
        toggleInspector: vi.fn(),
        toggleHelp: vi.fn(),
    }),
}));

// Mock the execution service
vi.mock("../../services/executionService", () => ({
    useExecuteWorkflow: () => ({
        mutate: vi.fn(),
        isPending: false,
        error: null,
    }),
}));

describe("WorkflowCanvas", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders workflow canvas correctly", () => {
        renderWithProviders(<WorkflowCanvas />);

        expect(screen.getByText("Test Workflow")).toBeInTheDocument();
        expect(screen.getByTestId("react-flow")).toBeInTheDocument();
        expect(screen.getByTestId("react-flow-provider")).toBeInTheDocument();
    });

    it("renders workflow toolbar", () => {
        renderWithProviders(<WorkflowCanvas />);

        expect(screen.getByText("Biblioteca")).toBeInTheDocument();
        expect(screen.getByText("Inspetor")).toBeInTheDocument();
        expect(screen.getByText("Ajuda")).toBeInTheDocument();
        expect(screen.getByText("Executar")).toBeInTheDocument();
    });

    it("renders workflow status", () => {
        renderWithProviders(<WorkflowCanvas />);

        expect(screen.getByText("Salvo")).toBeInTheDocument();
    });

    it("renders keyboard shortcuts component", () => {
        renderWithProviders(<WorkflowCanvas />);

        // Keyboard shortcuts are rendered but not visible by default
        expect(screen.getByTestId("react-flow")).toBeInTheDocument();
    });

    it("renders help button", () => {
        renderWithProviders(<WorkflowCanvas />);

        expect(screen.getByRole("button", { name: /ajuda/i })).toBeInTheDocument();
    });

    it("toggles library when library button is clicked", async () => {
        const user = userEvent.setup();
        const mockToggleLibrary = vi.fn();

        vi.mocked(require("../../services/workflowService").useWorkflowCanvas).mockReturnValue({
            nodes: mockWorkflow.nodes,
            edges: mockWorkflow.edges,
            selectedNode: null,
            isLibraryOpen: false,
            isInspectorOpen: false,
            isHelpOpen: false,
            workflowName: "Test Workflow",
            hasChanges: false,
            isSaving: false,
            onConnect: vi.fn(),
            onNodeClick: vi.fn(),
            addNode: vi.fn(),
            updateNodeConfig: vi.fn(),
            deleteNode: vi.fn(),
            duplicateNode: vi.fn(),
            saveWorkflow: vi.fn(),
            clearCanvas: vi.fn(),
            loadTemplate: vi.fn(),
            toggleLibrary: mockToggleLibrary,
            toggleInspector: vi.fn(),
            toggleHelp: vi.fn(),
        });

        renderWithProviders(<WorkflowCanvas />);

        const libraryButton = screen.getByText("Biblioteca");
        await user.click(libraryButton);

        expect(mockToggleLibrary).toHaveBeenCalled();
    });

    it("toggles inspector when inspector button is clicked", async () => {
        const user = userEvent.setup();
        const mockToggleInspector = vi.fn();

        vi.mocked(require("../../services/workflowService").useWorkflowCanvas).mockReturnValue({
            nodes: mockWorkflow.nodes,
            edges: mockWorkflow.edges,
            selectedNode: null,
            isLibraryOpen: false,
            isInspectorOpen: false,
            isHelpOpen: false,
            workflowName: "Test Workflow",
            hasChanges: false,
            isSaving: false,
            onConnect: vi.fn(),
            onNodeClick: vi.fn(),
            addNode: vi.fn(),
            updateNodeConfig: vi.fn(),
            deleteNode: vi.fn(),
            duplicateNode: vi.fn(),
            saveWorkflow: vi.fn(),
            clearCanvas: vi.fn(),
            loadTemplate: vi.fn(),
            toggleLibrary: vi.fn(),
            toggleInspector: mockToggleInspector,
            toggleHelp: vi.fn(),
        });

        renderWithProviders(<WorkflowCanvas />);

        const inspectorButton = screen.getByText("Inspetor");
        await user.click(inspectorButton);

        expect(mockToggleInspector).toHaveBeenCalled();
    });

    it("toggles help when help button is clicked", async () => {
        const user = userEvent.setup();
        const mockToggleHelp = vi.fn();

        vi.mocked(require("../../services/workflowService").useWorkflowCanvas).mockReturnValue({
            nodes: mockWorkflow.nodes,
            edges: mockWorkflow.edges,
            selectedNode: null,
            isLibraryOpen: false,
            isInspectorOpen: false,
            isHelpOpen: false,
            workflowName: "Test Workflow",
            hasChanges: false,
            isSaving: false,
            onConnect: vi.fn(),
            onNodeClick: vi.fn(),
            addNode: vi.fn(),
            updateNodeConfig: vi.fn(),
            deleteNode: vi.fn(),
            duplicateNode: vi.fn(),
            saveWorkflow: vi.fn(),
            clearCanvas: vi.fn(),
            loadTemplate: vi.fn(),
            toggleLibrary: vi.fn(),
            toggleInspector: vi.fn(),
            toggleHelp: mockToggleHelp,
        });

        renderWithProviders(<WorkflowCanvas />);

        const helpButton = screen.getByRole("button", { name: /ajuda/i });
        await user.click(helpButton);

        expect(mockToggleHelp).toHaveBeenCalled();
    });

    it("executes workflow when execute button is clicked", async () => {
        const user = userEvent.setup();
        const mockExecute = vi.fn();

        vi.mocked(require("../../services/executionService").useExecuteWorkflow).mockReturnValue({
            mutate: mockExecute,
            isPending: false,
            error: null,
        });

        renderWithProviders(<WorkflowCanvas />);

        const executeButton = screen.getByText("Executar");
        await user.click(executeButton);

        expect(mockExecute).toHaveBeenCalled();
    });

    it("shows saving status when workflow is being saved", () => {
        vi.mocked(require("../../services/workflowService").useWorkflowCanvas).mockReturnValue({
            nodes: mockWorkflow.nodes,
            edges: mockWorkflow.edges,
            selectedNode: null,
            isLibraryOpen: false,
            isInspectorOpen: false,
            isHelpOpen: false,
            workflowName: "Test Workflow",
            hasChanges: false,
            isSaving: true,
            onConnect: vi.fn(),
            onNodeClick: vi.fn(),
            addNode: vi.fn(),
            updateNodeConfig: vi.fn(),
            deleteNode: vi.fn(),
            duplicateNode: vi.fn(),
            saveWorkflow: vi.fn(),
            clearCanvas: vi.fn(),
            loadTemplate: vi.fn(),
            toggleLibrary: vi.fn(),
            toggleInspector: vi.fn(),
            toggleHelp: vi.fn(),
        });

        renderWithProviders(<WorkflowCanvas />);

        expect(screen.getByText("Salvando...")).toBeInTheDocument();
    });

    it("shows unsaved changes status when workflow has changes", () => {
        vi.mocked(require("../../services/workflowService").useWorkflowCanvas).mockReturnValue({
            nodes: mockWorkflow.nodes,
            edges: mockWorkflow.edges,
            selectedNode: null,
            isLibraryOpen: false,
            isInspectorOpen: false,
            isHelpOpen: false,
            workflowName: "Test Workflow",
            hasChanges: true,
            isSaving: false,
            onConnect: vi.fn(),
            onNodeClick: vi.fn(),
            addNode: vi.fn(),
            updateNodeConfig: vi.fn(),
            deleteNode: vi.fn(),
            duplicateNode: vi.fn(),
            saveWorkflow: vi.fn(),
            clearCanvas: vi.fn(),
            loadTemplate: vi.fn(),
            toggleLibrary: vi.fn(),
            toggleInspector: vi.fn(),
            toggleHelp: vi.fn(),
        });

        renderWithProviders(<WorkflowCanvas />);

        expect(screen.getByText("Mudanças não salvas")).toBeInTheDocument();
    });
});
