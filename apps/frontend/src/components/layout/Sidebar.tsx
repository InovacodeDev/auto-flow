import React, { useEffect, useRef } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { MaterialIcon } from "../ui/MaterialIcon";
import { FullLogo } from "../../assets/logo";

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const items = [
    { id: "dashboard", label: "Dashboard", to: "/dashboard", icon: "home" },
    { id: "workflows", label: "Workflows", to: "/workflows", icon: "hub" },
    { id: "integrations", label: "Integrações", to: "/integrations", icon: "integration_instructions" },
    { id: "analytics", label: "Analytics", to: "/analytics", icon: "analytics" },
    { id: "builder", label: "Constructor Visual", to: "/workflow-builder", icon: "account_tree" },
    { id: "ai", label: "AI Chat", to: "/ai-chat", icon: "smart_toy" },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
    const location = useLocation();
    const pathname = location.pathname;
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    // Basic focus trap: focus first focusable element when opened
    useEffect(() => {
        if (isOpen && containerRef.current) {
            const focusable = containerRef.current.querySelectorAll<HTMLElement>(
                "button, a, input, textarea, select, [tabindex]:not([tabindex='-1'])"
            );
            if (focusable.length) focusable[0].focus();
        }
    }, [isOpen]);

    return (
        <aside
            ref={containerRef}
            className={`fixed inset-y-0 left-0 z-40 w-64 h-screen overflow-auto bg-white border-r transform transition-transform duration-200 ease-in-out ${
                isOpen ? "translate-x-0" : "-translate-x-full"
            } lg:translate-x-0 lg:static lg:flex-shrink-0`}
            aria-hidden={!isOpen}
            role="navigation"
            aria-label="Main navigation"
        >
            <div className="h-16 flex items-center px-4 border-b">
                <FullLogo className="h-6 w-auto" color="#1f2937" />
            </div>
            <nav className="p-4">
                <ul className="space-y-2">
                    {items.map((item) => {
                        const active = pathname === item.to || (item.to === "/dashboard" && pathname === "/");
                        return (
                            <li key={item.id}>
                                <Link
                                    to={item.to}
                                    onClick={() => {
                                        // close on mobile
                                        if (window.innerWidth < 1024) onClose();
                                    }}
                                    className={`flex items-center px-3 py-2 rounded ${
                                        active ? "bg-blue-50 text-blue-700 font-medium" : "hover:bg-gray-100"
                                    }`}
                                >
                                    {/* Icon */}
                                    <MaterialIcon icon={item.icon} className="mr-3 text-gray-500" size={20} />
                                    <span>{item.label}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>
            <div className="absolute bottom-0 w-full p-4 border-t">
                <button onClick={onClose} className="w-full text-left text-sm text-gray-600 hover:text-gray-900">
                    Fechar
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
