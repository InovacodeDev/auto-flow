import React from "react";

interface MaterialIconProps {
    icon: string;
    className?: string;
    variant?: "outlined" | "rounded" | "sharp" | "filled";
    size?: number;
    filled?: boolean; // legacy alias, kept for backwards compatibility
    weight?: number; // allow numeric weights to pass through
}

export const MaterialIcon: React.FC<MaterialIconProps> = ({
    icon,
    className = "",
    variant = "outlined",
    size = 24,
    filled = false,
    weight = 400,
}) => {
    // Normalize variant: if 'filled' requested via prop or variant, use the rounded/outlined class with FILL variation
    const normalizedVariant = variant === "filled" ? "outlined" : variant;
    const baseClass = `material-symbols-${normalizedVariant}`;

    // fontVariationSettings must be a string like: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"
    const fontVariationSettings = `'FILL' ${filled ? 1 : 0}, 'wght' ${weight}, 'GRAD' 0, 'opsz' ${Math.max(20, Math.min(48, size))}`;

    const styles: React.CSSProperties = {
        fontSize: `${size}px`,
        fontVariationSettings,
        lineHeight: 1,
    };

    return (
        <span className={`${baseClass} ${className}`} style={styles} aria-hidden="true">
            {icon}
        </span>
    );
};

// Componentes específicos para ícones comuns
export const CheckCircleIcon: React.FC<Omit<MaterialIconProps, "icon">> = (props) => (
    <MaterialIcon icon="check_circle" {...props} />
);

export const SettingsIcon: React.FC<Omit<MaterialIconProps, "icon">> = (props) => (
    <MaterialIcon icon="settings" {...props} />
);

export const ChatIcon: React.FC<Omit<MaterialIconProps, "icon">> = (props) => <MaterialIcon icon="chat" {...props} />;

export const BarChartIcon: React.FC<Omit<MaterialIconProps, "icon">> = (props) => (
    <MaterialIcon icon="bar_chart" {...props} />
);

export const SecurityIcon: React.FC<Omit<MaterialIconProps, "icon">> = (props) => (
    <MaterialIcon icon="security" {...props} />
);

export const RocketLaunchIcon: React.FC<Omit<MaterialIconProps, "icon">> = (props) => (
    <MaterialIcon icon="rocket_launch" {...props} />
);

export const BoltIcon: React.FC<Omit<MaterialIconProps, "icon">> = (props) => <MaterialIcon icon="bolt" {...props} />;

export const GroupIcon: React.FC<Omit<MaterialIconProps, "icon">> = (props) => <MaterialIcon icon="group" {...props} />;

export const ScheduleIcon: React.FC<Omit<MaterialIconProps, "icon">> = (props) => (
    <MaterialIcon icon="schedule" {...props} />
);

export const DescriptionIcon: React.FC<Omit<MaterialIconProps, "icon">> = (props) => (
    <MaterialIcon icon="description" {...props} />
);

export const DeveloperModeIcon: React.FC<Omit<MaterialIconProps, "icon">> = (props) => (
    <MaterialIcon icon="developer_mode" {...props} />
);

export const LanguageIcon: React.FC<Omit<MaterialIconProps, "icon">> = (props) => (
    <MaterialIcon icon="language" {...props} />
);

export const LockIcon: React.FC<Omit<MaterialIconProps, "icon">> = (props) => <MaterialIcon icon="lock" {...props} />;

export const PlayCircleIcon: React.FC<Omit<MaterialIconProps, "icon">> = (props) => (
    <MaterialIcon icon="play_circle" {...props} />
);

export const ArrowForwardIcon: React.FC<Omit<MaterialIconProps, "icon">> = (props) => (
    <MaterialIcon icon="arrow_forward" {...props} />
);

export const CloseIcon: React.FC<Omit<MaterialIconProps, "icon">> = (props) => <MaterialIcon icon="close" {...props} />;

export const StarIcon: React.FC<Omit<MaterialIconProps, "icon">> = (props) => <MaterialIcon icon="star" {...props} />;

export const PhoneIcon: React.FC<Omit<MaterialIconProps, "icon">> = (props) => <MaterialIcon icon="phone" {...props} />;

export const HelpIcon: React.FC<Omit<MaterialIconProps, "icon">> = (props) => <MaterialIcon icon="help" {...props} />;
