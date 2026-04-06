/**
 * Replaces "&" with "and" in any display string (e.g. hotel names from DB).
 */
export const formatName = (name) =>
    typeof name === "string" ? name.replace(/\s*&\s*/g, " and ") : name;
