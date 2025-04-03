export default function authHeader() {
    const user = JSON.parse(localStorage.getItem('user'));

    if (user && (user.token || user.accessToken)) {
        // Get token from either property
        const token = user.token || user.accessToken;

        // Check if the token is expired
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const tokenData = JSON.parse(window.atob(base64));

            // Check token expiration
            const currentTime = Date.now() / 1000;
            if (tokenData.exp && tokenData.exp < currentTime) {
                // Token is expired but we'll let the backend handle rejection
                // This prevents logout on refresh issues
            }

            return { Authorization: 'Bearer ' + token };
        } catch (error) {
            // Return the token even if we can't parse it
            // Backend will validate and reject if needed
            return { Authorization: 'Bearer ' + token };
        }
    } else {
        return {};
    }
} 