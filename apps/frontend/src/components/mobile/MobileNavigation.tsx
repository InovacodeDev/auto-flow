import React, { useState, useEffect } from "react";
import { Home, Workflow, BarChart3, Settings, Zap, Menu, X } from "lucide-react";
import { Button } from "../ui/button";

interface MobileNavigationProps {
    currentPage?: string;
    onNavigate: (page: string) => void;
}

interface NavItem {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    href: string;
    badge?: number;
}

const navItems: NavItem[] = [
    {
        id: "dashboard",
        label: "Início",
        icon: Home,
        href: "/dashboard",
    },
    {
        id: "workflows",
        label: "Workflows",
        icon: Workflow,
        href: "/workflows",
    },
    {
        id: "templates",
        label: "Templates",
        icon: Zap,
        href: "/templates",
    },
    {
        id: "analytics",
        label: "Analytics",
        icon: BarChart3,
        href: "/analytics",
    },
    {
        id: "settings",
        label: "Ajustes",
        icon: Settings,
        href: "/settings",
    },
];

export const MobileNavigation: React.FC<MobileNavigationProps> = ({ currentPage = "dashboard", onNavigate }) => {
    const [isMobile, setIsMobile] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    const handleNavClick = (item: NavItem) => {
        onNavigate(item.id);
        setIsMenuOpen(false);
    };

    if (!isMobile) {
        return null; // Hide on desktop
    }

    return (
        <>
            {/* Mobile Bottom Navigation */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden">
                <div className="flex justify-around items-center py-2 px-1">
                    {navItems.slice(0, 4).map((item) => {
                        const Icon = item.icon;
                        const isActive = currentPage === item.id;

                        return (
                            <button
                                key={item.id}
                                onClick={() => handleNavClick(item)}
                                className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors min-w-0 flex-1 ${
                                    isActive ? "text-blue-600 bg-blue-50" : "text-gray-600 hover:text-gray-900"
                                }`}
                            >
                                <div className="relative">
                                    <Icon className="h-5 w-5 mb-1" />
                                    {item.badge && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                                            {item.badge}
                                        </span>
                                    )}
                                </div>
                                <span className="text-xs font-medium truncate w-full text-center">{item.label}</span>
                            </button>
                        );
                    })}

                    {/* More menu button */}
                    <button
                        onClick={() => setIsMenuOpen(true)}
                        className="flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors min-w-0 flex-1 text-gray-600 hover:text-gray-900"
                    >
                        <Menu className="h-5 w-5 mb-1" />
                        <span className="text-xs font-medium">Mais</span>
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden">
                    <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-lg p-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Menu</h3>
                            <Button variant="ghost" size="sm" onClick={() => setIsMenuOpen(false)}>
                                <X className="h-5 w-5" />
                            </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = currentPage === item.id;

                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => handleNavClick(item)}
                                        className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                                            isActive ? "text-blue-600 bg-blue-50" : "text-gray-700 hover:bg-gray-50"
                                        }`}
                                    >
                                        <Icon className="h-5 w-5" />
                                        <span className="font-medium">{item.label}</span>
                                        {item.badge && (
                                            <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                                {item.badge}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="grid grid-cols-1 gap-2">
                                <button className="flex items-center space-x-3 p-3 rounded-lg text-gray-700 hover:bg-gray-50">
                                    <Settings className="h-5 w-5" />
                                    <span>Configurações</span>
                                </button>
                                <button className="flex items-center space-x-3 p-3 rounded-lg text-gray-700 hover:bg-gray-50">
                                    <Home className="h-5 w-5" />
                                    <span>Ajuda</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
