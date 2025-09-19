import React, { useState } from "react";

interface WorkflowToolbarProps {
    workflowName: string;
    onNameChange: (name: string) => void;
    isValid: boolean;
    errors: string[];
    onSave: () => void;
    onTest: () => void;
    readOnly?: boolean;
}

export const WorkflowToolbar: React.FC<WorkflowToolbarProps> = ({
    workflowName,
    onNameChange,
    isValid,
    errors,
    onSave,
    onTest,
    readOnly = false,
}) => {
    const [isEditing, setIsEditing] = useState(false);

    const handleNameSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsEditing(false);
    };

    return (
        <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
                {/* Left section - Workflow name */}
                <div className="flex items-center space-x-4">
                    {isEditing && !readOnly ? (
                        <form onSubmit={handleNameSubmit} className="flex items-center">
                            <input
                                type="text"
                                value={workflowName}
                                onChange={(e) => onNameChange(e.target.value)}
                                onBlur={() => setIsEditing(false)}
                                className="text-xl font-semibold bg-transparent border-b-2 border-blue-500 focus:outline-none focus:border-blue-600"
                                autoFocus
                            />
                        </form>
                    ) : (
                        <h1
                            className={`text-xl font-semibold text-gray-900 ${!readOnly ? "cursor-pointer hover:text-blue-600" : ""}`}
                            onClick={() => !readOnly && setIsEditing(true)}
                        >
                            {workflowName}
                        </h1>
                    )}

                    {/* Status indicator */}
                    <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${isValid ? "bg-green-500" : "bg-red-500"}`} />
                        <span className={`text-sm font-medium ${isValid ? "text-green-700" : "text-red-700"}`}>
                            {isValid ? "Válido" : "Inválido"}
                        </span>

                        {errors.length > 0 && (
                            <div className="relative group">
                                <button className="text-red-500 hover:text-red-700">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path
                                            fillRule="evenodd"
                                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </button>

                                {/* Error tooltip */}
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-red-600 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                    <div className="max-w-xs">
                                        {errors.map((error, index) => (
                                            <div key={index} className="mb-1 last:mb-0">
                                                • {error}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-red-600"></div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right section - Actions */}
                {!readOnly && (
                    <div className="flex items-center space-x-3">
                        {/* Test button */}
                        <button
                            onClick={onTest}
                            disabled={!isValid}
                            className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${
                    isValid
                        ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }
              `}
                        >
                            <div className="flex items-center space-x-2">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                <span>Testar</span>
                            </div>
                        </button>

                        {/* Save button */}
                        <button
                            onClick={onSave}
                            disabled={!isValid}
                            className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${
                    isValid
                        ? "bg-green-600 text-white hover:bg-green-700"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }
              `}
                        >
                            <div className="flex items-center space-x-2">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6a1 1 0 10-2 0v5.586l-1.293-1.293z" />
                                    <path d="M5 14a2 2 0 002 2h6a2 2 0 002-2v-4a2 2 0 00-2-2H7a2 2 0 00-2 2v4z" />
                                </svg>
                                <span>Salvar</span>
                            </div>
                        </button>
                    </div>
                )}

                {/* Read-only indicator */}
                {readOnly && (
                    <div className="flex items-center space-x-2 text-gray-500">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path
                                fillRule="evenodd"
                                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                clipRule="evenodd"
                            />
                        </svg>
                        <span className="text-sm font-medium">Somente Leitura</span>
                    </div>
                )}
            </div>
        </div>
    );
};
