import { useEffect } from "react";
import { initializeAuth } from "./stores/authStore";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { AppRouter } from "./router";
import { GlobalLoading } from "./components/ui/GlobalLoading";
import { ErrorNotification } from "./components/ui/ErrorNotification";

function App() {
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
