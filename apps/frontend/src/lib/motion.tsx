import { motion } from "framer-motion";

// Export simple motion aliases with looser typing to avoid friction with project TS/React versions.
// Use these in pages to keep imports consistent and editable in one place.
export const MDiv = motion.div as unknown as any;
export const MSection = motion.section as unknown as any;
export const MHeader = motion.header as unknown as any;

// Common animation variants
export const fadeUp = {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 6 },
};

export const stagger = {
    animate: { transition: { staggerChildren: 0.06, delayChildren: 0 } },
};

export default {
    MDiv,
    MSection,
    MHeader,
    fadeUp,
    stagger,
};
