/**
 * Admin Check Utility
 * 
 * Determines if a user has admin privileges
 */

// List of admin email addresses
const ADMIN_EMAILS = [
    'anuragnarsingoju@gmail.com'
];

/**
 * Check if the given email is an admin
 * @param email - User's email address
 * @returns true if user is admin, false otherwise
 */
export const isAdmin = (email: string | undefined | null): boolean => {
    if (!email) return false;
    return ADMIN_EMAILS.includes(email.toLowerCase());
};

/**
 * Get list of admin emails (for reference)
 */
export const getAdminEmails = (): string[] => {
    return [...ADMIN_EMAILS];
};
