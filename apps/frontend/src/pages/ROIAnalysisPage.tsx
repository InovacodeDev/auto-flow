import React from "react";
import { useParams } from "@tanstack/react-router";
import { ROICalculatorDetail } from "../components/analytics/ROICalculatorDetail";

export const ROIAnalysisPage: React.FC = () => {
    const { workflowId } = useParams({ from: "/analytics/roi/$workflowId" });

    return (
        <div className="min-h-screen bg-gray-50">
            <ROICalculatorDetail workflowId={workflowId} />
        </div>
    );
};
