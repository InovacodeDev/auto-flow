import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { initializeAuth } from "./stores/authStore";
import { FloatingHelpButton } from "./components/help/FloatingHelpButton";
import Sidebar from "./components/layout/Sidebar";

// Create a client
const queryClient = new QueryClient();

function App() {
    // Initialize auth state on app load
    useEffect(() => {
        initializeAuth();
    }, []);
    const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

    const toggleSidebar = () => setSidebarOpen((s) => !s);

    return (
        <QueryClientProvider client={queryClient}>
            <div className="min-h-screen bg-gray-50">
                <header className="bg-white shadow-sm border-b">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <div className="flex items-center">
                                <button
                                    onClick={toggleSidebar}
                                    className="mr-3 inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:bg-gray-100"
                                    aria-label="Open menu"
                                >
                                    {/* Hamburger icon */}
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M4 6h16M4 12h16M4 18h16"
                                        />
                                    </svg>
                                </button>
                                <h1 className="text-2xl font-bold text-gray-900">AutoFlow</h1>
                                <span className="ml-2 text-sm text-gray-500">Beta</span>
                            </div>
                            <div />
                        </div>
                    </div>
                </header>
                {/* Sidebar */}
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

                <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    <div className="px-4 py-6 sm:px-0">
                        <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
                            <div className="text-center">
                                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                                    🚀 AutoFlow em Desenvolvimento
                                </h2>
                                <p className="text-lg text-gray-600 mb-6">
                                    Plataforma de automação inteligente para PMEs brasileiras
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
                                    <div className="bg-blue-50 p-6 rounded-lg">
                                        <h3 className="text-xl font-semibold text-blue-900 mb-2">
                                            🤖 IA Conversacional
                                        </h3>
                                        <p className="text-blue-700">Crie automações falando em português natural</p>
                                    </div>
                                    <div className="bg-green-50 p-6 rounded-lg">
                                        <h3 className="text-xl font-semibold text-green-900 mb-2">
                                            🔄 Constructor Visual
                                        </h3>
                                        <p className="text-green-700">Drag-and-drop para workflows visuais</p>
                                    </div>
                                    <div className="bg-purple-50 p-6 rounded-lg">
                                        <h3 className="text-xl font-semibold text-purple-900 mb-2">
                                            📊 ROI Transparente
                                        </h3>
                                        <p className="text-purple-700">Métricas claras de economia e ganhos</p>
                                    </div>
                                </div>
                                <div className="mt-8">
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                                        <p className="text-yellow-800">
                                            <strong>Fase 5:</strong> Constructor Visual implementado ✅
                                            <br />
                                            ReactFlow • Drag-and-drop • Nodes configuráveis
                                        </p>
                                    </div>
                                    <a
                                        href="/workflow-builder"
                                        className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                    >
                                        🚀 Testar Constructor Visual
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                {/* Floating Help Button */}
                <FloatingHelpButton context="dashboard" />
            </div>
        </QueryClientProvider>
    );
}

export default App;
