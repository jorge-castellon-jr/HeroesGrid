/**
 * Check if admin mode is enabled
 * Set VITE_ADMIN_MODE=true in .env to enable
 */
export function isAdminMode() {
	return import.meta.env.VITE_ADMIN_MODE === 'true';
}

export default isAdminMode;
