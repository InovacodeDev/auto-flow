import React, { useState } from "react";
import { AnalyticsDashboard } from "../components/analytics/AnalyticsDashboard";

const AnalyticsPage: React.FC = () => {
    const [timeRange, setTimeRange] = useState<"1h" | "24h" | "7d" | "30d">("7d");

    const handleTimeRangeChange = (newRange: "1h" | "24h" | "7d" | "30d") => {
        setTimeRange(newRange);
    };

    return (
        <div className="p-6">
            <AnalyticsDashboard timeRange={timeRange} onTimeRangeChange={handleTimeRangeChange} />
        </div>
    );
};
export default AnalyticsPage;
