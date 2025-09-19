import React, { useState } from "react";
import { HelpCircle } from "lucide-react";
import { HelpSystem } from "./HelpSystem";
import { Button } from "../ui/button";

interface FloatingHelpButtonProps {
    context?: string;
    position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
}

export const FloatingHelpButton: React.FC<FloatingHelpButtonProps> = ({ context, position = "bottom-right" }) => {
    const [isHelpOpen, setIsHelpOpen] = useState(false);

    const getPositionClasses = () => {
        switch (position) {
            case "bottom-right":
                return "bottom-6 right-6";
            case "bottom-left":
                return "bottom-6 left-6";
            case "top-right":
                return "top-6 right-6";
            case "top-left":
                return "top-6 left-6";
            default:
                return "bottom-6 right-6";
        }
    };

    return (
        <>
            <div className={`fixed ${getPositionClasses()} z-40`}>
                <Button
                    onClick={() => setIsHelpOpen(true)}
                    className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-shadow"
                    title="Ajuda"
                >
                    <HelpCircle className="h-6 w-6" />
                </Button>
            </div>

            <HelpSystem isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} context={context} />
        </>
    );
};
