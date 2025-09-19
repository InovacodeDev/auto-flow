import React from "react";
import { PerformanceReports } from "../components/analytics/PerformanceReports";

export const ReportsPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            <PerformanceReports />
        </div>
    );
};
