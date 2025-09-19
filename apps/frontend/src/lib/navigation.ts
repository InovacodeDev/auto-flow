import { useEffect, useState } from "react";

export function navigate(to: string) {
    if (window.location.pathname === to) return;
    history.pushState({}, "", to);
    window.dispatchEvent(new PopStateEvent("popstate"));
}

export function usePathname(): string {
    const [path, setPath] = useState<string>(window.location.pathname);

    useEffect(() => {
        const onPop = () => setPath(window.location.pathname);
        window.addEventListener("popstate", onPop);
        return () => window.removeEventListener("popstate", onPop);
    }, []);

    return path;
}
