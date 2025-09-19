import React, { useEffect, useRef } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import {
    HomeIcon,
    Squares2X2Icon,
    ServerIcon,
    ChartBarIcon,
    PuzzlePieceIcon,
    BoltIcon,
} from "@heroicons/react/24/outline";

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const items = [
    { id: "dashboard", label: "Dashboard", to: "/dashboard", Icon: HomeIcon },
    { id: "workflows", label: "Workflows", to: "/workflows", Icon: Squares2X2Icon },
    { id: "integrations", label: "Integrações", to: "/integrations", Icon: ServerIcon },
    { id: "analytics", label: "Analytics", to: "/analytics", Icon: ChartBarIcon },
    { id: "builder", label: "Constructor Visual", to: "/workflow-builder", Icon: PuzzlePieceIcon },
    { id: "ai", label: "AI Chat", to: "/ai-chat", Icon: BoltIcon },
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
                <h2 className="text-lg font-semibold">AutoFlow</h2>
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
                                    <item.Icon className="h-5 w-5 mr-3 text-gray-500" aria-hidden="true" />
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
