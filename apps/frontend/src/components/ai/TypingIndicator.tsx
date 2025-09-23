import React from "react";
import { SparklesIcon } from "@heroicons/react/24/outline";

export const TypingIndicator: React.FC = () => {
    return (
        <div className="flex justify-start">
            <div className="flex items-start space-x-3 max-w-3xl">
                {/* Avatar */}
                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gray-50 border border-gray-200">
                    <SparklesIcon className="w-5 h-5 text-purple-600" />
                </div>

                {/* Typing Animation */}
                <div className="flex-1">
                    <div className="inline-block px-4 py-3 rounded-lg bg-gray-50 border border-gray-200">
                        <div className="flex items-center space-x-1">
                            <span className="text-sm text-gray-600">Alex está digitando</span>
                            <div className="flex space-x-1">
                                <div
                                    className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"
                                    style={{ animationDelay: "0ms" }}
                                />
                                <div
                                    className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"
                                    style={{ animationDelay: "150ms" }}
                                />
                                <div
                                    className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"
                                    style={{ animationDelay: "300ms" }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
