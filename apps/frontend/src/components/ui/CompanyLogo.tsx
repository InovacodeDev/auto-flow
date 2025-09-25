import React, { useEffect, useState } from "react";

// Keep simple-icons as a reliable static fallback
import {
    siWhatsapp,
    siTelegram,
    siShopify,
    siGoogle,
    siFacebook,
    siInstagram,
    siX,
    siSlack,
    siTrello,
    siMysql,
    siPostgresql,
    siMercadopago,
    siPix,
    siGooglesheets,
    siGoogledrive,
    siGooglecalendar,
    siMailchimp,
} from "simple-icons";

interface CompanyLogoProps {
    company: string;
    size?: number;
    className?: string;
}

/**
 * CompanyLogo
 * - Tries to dynamically load the `react-logos` (gilbarbara/logos) package at runtime
 *   and render the specific React component (preferred).
 * - Falls back to rendering an SVG from `simple-icons` when the logo component
 *   isn't available or the dynamic import fails.
 * - Keeps a small set of custom text-based fallbacks for Brazil-only integrations.
 */
const CompanyLogo: React.FC<CompanyLogoProps> = ({ company, size = 24, className = "" }) => {
    const [logosModule, setLogosModule] = useState<any | null>(undefined);

    useEffect(() => {
        let cancelled = false;
        // Try to dynamically import the react-logos package (this matches the
        // gilbarbara/logos usage pattern when installed as `react-logos` or `logos`).
        import("react-logos")
            .then((m) => {
                if (!cancelled) setLogosModule(m);
            })
            .catch(() => {
                // If react-logos isn't available, set to null and we'll use simple-icons
                if (!cancelled) setLogosModule(null);
            });

        return () => {
            cancelled = true;
        };
    }, []);

    const logoStyle: React.CSSProperties = {
        width: `${size}px`,
        height: `${size}px`,
        display: "inline-flex",
    };

    const simpleIcons: Record<string, any> = {
        whatsapp: siWhatsapp,
        telegram: siTelegram,
        shopify: siShopify,
        google: siGoogle,
        facebook: siFacebook,
        instagram: siInstagram,
        twitter: siX,
        x: siX,
        slack: siSlack,
        trello: siTrello,
        mysql: siMysql,
        postgresql: siPostgresql,
        mercadopago: siMercadopago,
        pix: siPix,
        sheets: siGooglesheets,
        googledrive: siGoogledrive,
        googlecalendar: siGooglecalendar,
        mailchimp: siMailchimp,
    };

    const companyKey = (company || "").toLowerCase();

    // Mapping from common keys to hopeful component names in react-logos
    const logoComponentNames: Record<string, string> = {
        whatsapp: "Whatsapp",
        telegram: "Telegram",
        shopify: "Shopify",
        google: "Google",
        "google-sheets": "GoogleSheets",
        googlesheets: "GoogleSheets",
        mercadopago: "MercadoPago",
        pix: "Pix",
        slack: "Slack",
        trello: "Trello",
        mysql: "MySQL",
        postgresql: "Postgres",
        omie: "Omie",
        bling: "Bling",
        vtex: "VTEX",
    };

    // If the dynamic logos module loaded and contains a matching component, render it.
    if (logosModule && logoComponentNames[companyKey]) {
        const compName = logoComponentNames[companyKey];
        const Comp = logosModule[compName] || logosModule.default?.[compName] || null;
        if (Comp) {
            // Many logo components accept width/height or size props; pass both as a best-effort.
            return (
                // eslint-disable-next-line react/jsx-no-bind
                <span style={logoStyle} className={className} aria-hidden>
                    <Comp width={size} height={size} size={size} className={className} />
                </span>
            );
        }
    }

    // If dynamic module wasn't found (null) or a component wasn't available, try simple-icons svg path fallback
    const iconData = simpleIcons[companyKey];
    if (iconData && iconData.path) {
        return (
            <svg viewBox="0 0 24 24" style={logoStyle} className={className} aria-hidden>
                <path d={iconData.path} fill={iconData.hex ? `#${iconData.hex}` : "currentColor"} />
            </svg>
        );
    }

    // Small set of custom fallbacks (Brazil-specific or not present in the logos package)
    const customLogos: Record<string, React.ReactElement> = {
        omie: (
            <div
                style={logoStyle}
                className={`${className} bg-blue-600 text-white flex items-center justify-center font-bold text-xs rounded`}
            >
                OMIE
            </div>
        ),
        bling: (
            <div
                style={logoStyle}
                className={`${className} bg-orange-500 text-white flex items-center justify-center font-bold text-xs rounded`}
            >
                BLING
            </div>
        ),
        protheus: (
            <div
                style={logoStyle}
                className={`${className} bg-green-600 text-white flex items-center justify-center font-bold text-xs rounded`}
            >
                TOTVS
            </div>
        ),
        vtex: (
            <div
                style={logoStyle}
                className={`${className} bg-pink-500 text-white flex items-center justify-center font-bold text-sm rounded`}
            >
                VTEX
            </div>
        ),
    };

    if (customLogos[companyKey]) return customLogos[companyKey];

    // Default initials fallback
    return (
        <div
            style={logoStyle}
            className={`${className} bg-gray-400 text-white flex items-center justify-center font-bold text-xs rounded`}
        >
            {company ? company.substring(0, 2).toUpperCase() : "--"}
        </div>
    );
};

export default CompanyLogo;
