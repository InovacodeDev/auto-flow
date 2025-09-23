import React from "react";
import { renderHook, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthEnhanced } from "./useAuthEnhanced";
import { mockUser, mockFunctions, testHelpers } from "../test/utils";

// Mock the auth store
const mockAuthStore = {
    user: mockUser,
    isAuthenticated: true,
    isLoading: false,
    error: null,
    login: mockFunctions.login,
    register: mockFunctions.register,
    logout: mockFunctions.logout,
    refreshToken: mockFunctions.refreshToken,
    setUser: vi.fn(),
    setLoading: vi.fn(),
    setError: vi.fn(),
    clearError: vi.fn(),
};

// Mock the auth mutations
const mockAuthMutations = {
    loginMutation: {
        mutate: mockFunctions.login,
        isPending: false,
        error: null,
    },
    registerMutation: {
        mutate: mockFunctions.register,
        isPending: false,
        error: null,
    },
    logoutMutation: {
        mutate: mockFunctions.logout,
        isPending: false,
        error: null,
    },
    refreshTokenMutation: {
        mutate: mockFunctions.refreshToken,
        isPending: false,
        error: null,
    },
};

// Mock the auth query
const mockAuthQuery = {
    userQuery: {
        data: mockUser,
        isLoading: false,
        error: null,
    },
};

// Mock the services
vi.mock("../stores/authStore", () => ({
    useAuthStore: () => mockAuthStore,
}));

vi.mock("../hooks/useAuthMutations", () => ({
    useAuthMutations: () => mockAuthMutations,
}));

vi.mock("../hooks/useAuthQuery", () => ({
    useAuthQuery: () => mockAuthQuery,
}));

describe("useAuthEnhanced", () => {
    let queryClient: QueryClient;

    beforeEach(() => {
        queryClient = testHelpers.createMockQueryClient();
        vi.clearAllMocks();
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    it("returns user data from store", () => {
        const { result } = renderHook(() => useAuthEnhanced(), { wrapper });

        expect(result.current.user).toEqual(mockUser);
        expect(result.current.isAuthenticated).toBe(true);
    });

    it("returns loading state from store", () => {
        const { result } = renderHook(() => useAuthEnhanced(), { wrapper });

        expect(result.current.isLoading).toBe(false);
    });

    it("returns error state from store", () => {
        const { result } = renderHook(() => useAuthEnhanced(), { wrapper });

        expect(result.current.error).toBe(null);
    });

    it("returns login function", () => {
        const { result } = renderHook(() => useAuthEnhanced(), { wrapper });

        expect(typeof result.current.login).toBe("function");
    });

    it("returns register function", () => {
        const { result } = renderHook(() => useAuthEnhanced(), { wrapper });

        expect(typeof result.current.register).toBe("function");
    });

    it("returns logout function", () => {
        const { result } = renderHook(() => useAuthEnhanced(), { wrapper });

        expect(typeof result.current.logout).toBe("function");
    });

    it("returns refreshToken function", () => {
        const { result } = renderHook(() => useAuthEnhanced(), { wrapper });

        expect(typeof result.current.refreshToken).toBe("function");
    });

    it("calls login function with correct parameters", async () => {
        const { result } = renderHook(() => useAuthEnhanced(), { wrapper });

        const loginData = {
            email: "test@example.com",
            password: "password123",
        };

        await act(async () => {
            await result.current.login(loginData);
        });

        expect(mockFunctions.login).toHaveBeenCalledWith(loginData);
    });

    it("calls register function with correct parameters", async () => {
        const { result } = renderHook(() => useAuthEnhanced(), { wrapper });

        const registerData = {
            name: "João Silva",
            email: "test@example.com",
            password: "password123",
            confirmPassword: "password123",
        };

        await act(async () => {
            await result.current.register(registerData);
        });

        expect(mockFunctions.register).toHaveBeenCalledWith(registerData);
    });

    it("calls logout function", async () => {
        const { result } = renderHook(() => useAuthEnhanced(), { wrapper });

        await act(async () => {
            await result.current.logout();
        });

        expect(mockFunctions.logout).toHaveBeenCalled();
    });

    it("calls refreshToken function", async () => {
        const { result } = renderHook(() => useAuthEnhanced(), { wrapper });

        await act(async () => {
            await result.current.refreshToken();
        });

        expect(mockFunctions.refreshToken).toHaveBeenCalled();
    });

    it("returns hasRole function", () => {
        const { result } = renderHook(() => useAuthEnhanced(), { wrapper });

        expect(typeof result.current.hasRole).toBe("function");
    });

    it("checks user role correctly", () => {
        const { result } = renderHook(() => useAuthEnhanced(), { wrapper });

        expect(result.current.hasRole("admin")).toBe(true);
        expect(result.current.hasRole("user")).toBe(false);
    });

    it("returns isAdmin function", () => {
        const { result } = renderHook(() => useAuthEnhanced(), { wrapper });

        expect(typeof result.current.isAdmin).toBe("function");
    });

    it("checks if user is admin correctly", () => {
        const { result } = renderHook(() => useAuthEnhanced(), { wrapper });

        expect(result.current.isAdmin()).toBe(true);
    });

    it("returns getAccessToken function", () => {
        const { result } = renderHook(() => useAuthEnhanced(), { wrapper });

        expect(typeof result.current.getAccessToken).toBe("function");
    });

    it("returns access token from store", () => {
        const { result } = renderHook(() => useAuthEnhanced(), { wrapper });

        // This would need to be mocked in the actual store
        expect(typeof result.current.getAccessToken()).toBe("string");
    });

    it("combines loading states from mutations", () => {
        const { result } = renderHook(() => useAuthEnhanced(), { wrapper });

        expect(result.current.isLoading).toBe(false);
        expect(result.current.isLoginLoading).toBe(false);
        expect(result.current.isRegisterLoading).toBe(false);
        expect(result.current.isLogoutLoading).toBe(false);
    });

    it("combines error states from mutations", () => {
        const { result } = renderHook(() => useAuthEnhanced(), { wrapper });

        expect(result.current.error).toBe(null);
        expect(result.current.loginError).toBe(null);
        expect(result.current.registerError).toBe(null);
        expect(result.current.logoutError).toBe(null);
    });

    it("handles unauthenticated state", () => {
        const unauthenticatedStore = {
            ...mockAuthStore,
            user: null,
            isAuthenticated: false,
        };

        vi.mocked(require("../stores/authStore").useAuthStore).mockReturnValue(
            unauthenticatedStore
        );

        const { result } = renderHook(() => useAuthEnhanced(), { wrapper });

        expect(result.current.user).toBe(null);
        expect(result.current.isAuthenticated).toBe(false);
        expect(result.current.isAdmin()).toBe(false);
        expect(result.current.hasRole("admin")).toBe(false);
    });

    it("handles loading state", () => {
        const loadingStore = {
            ...mockAuthStore,
            isLoading: true,
        };

        vi.mocked(require("../stores/authStore").useAuthStore).mockReturnValue(loadingStore);

        const { result } = renderHook(() => useAuthEnhanced(), { wrapper });

        expect(result.current.isLoading).toBe(true);
    });

    it("handles error state", () => {
        const errorStore = {
            ...mockAuthStore,
            error: "Authentication failed",
        };

        vi.mocked(require("../stores/authStore").useAuthStore).mockReturnValue(errorStore);

        const { result } = renderHook(() => useAuthEnhanced(), { wrapper });

        expect(result.current.error).toBe("Authentication failed");
    });
});
