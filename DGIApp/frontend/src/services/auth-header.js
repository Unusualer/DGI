export default function authHeader() {
    const user = JSON.parse(localStorage.getItem('user'));

    if (user && user.accessToken) {
        // Show token details
        const token = user.accessToken;
        console.log("Found user token:", token.substring(0, 20) + "...");
        console.log("User role from localStorage:", user.role);
        console.log("User username from localStorage:", user.username);

        // Parse token parts for debugging
        try {
            const parts = token.split('.');
            if (parts.length === 3) {
                const header = JSON.parse(atob(parts[0]));
                const payload = JSON.parse(atob(parts[1]));
                console.log("Token header:", header);
                console.log("Token payload:", payload);
            } else {
                console.warn("Token does not have standard JWT format");
            }
        } catch (e) {
            console.error("Error parsing token:", e);
        }

        return { 'Authorization': `Bearer ${token}` };
    } else {
        console.log("No user token found in localStorage");
        return {};
    }
} 