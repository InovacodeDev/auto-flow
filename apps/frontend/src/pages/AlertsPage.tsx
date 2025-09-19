import React from "react";
import { AlertsNotifications } from "../components/analytics/AlertsNotifications";

export const AlertsPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            <AlertsNotifications />
        </div>
    );
};
