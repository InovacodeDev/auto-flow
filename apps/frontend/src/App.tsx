import { useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { initializeAuth } from "./stores/authStore";
import { AppRouter } from "./router";
import { queryClient } from "./lib/queryClient";
import { GlobalLoading } from "./components/ui/GlobalLoading";
import { ErrorNotification } from "./components/ui/ErrorNotification";

function App() {
    // Initialize auth state on app load
    useEffect(() => {
        initializeAuth();
    }, []);

    return (
        <QueryClientProvider client={queryClient}>
            <AppRouter />
            <GlobalLoading />
            <ErrorNotification />
        </QueryClientProvider>
    );
}

export default App;
