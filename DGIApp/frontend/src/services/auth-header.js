export default function authHeader() {
    try {
        const user = JSON.parse(localStorage.getItem('user'));

        if (!user) {
            console.warn("Aucun utilisateur trouvé dans localStorage");
            return {};
        }

        // Get token from either property
        const token = user.token || user.accessToken;

        if (!token) {
            console.warn("Aucun jeton trouvé pour l'utilisateur:", user.username);
            return {};
        }

        // Check if the token is expired
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const tokenData = JSON.parse(window.atob(base64));

            // Check token expiration
            const currentTime = Date.now() / 1000;
            if (tokenData.exp && tokenData.exp < currentTime) {
                console.warn("Le jeton est expiré. Date d'expiration:", new Date(tokenData.exp * 1000).toISOString());
                console.warn("Heure actuelle:", new Date(currentTime * 1000).toISOString());
                // Jeton expiré, mais on le renvoie quand même pour que le backend puisse rejeter correctement
                console.log("Envoi du jeton expiré pour traitement côté serveur");
            } else {
                // Calculer le temps restant avant expiration
                if (tokenData.exp) {
                    const timeLeftMinutes = Math.round((tokenData.exp - currentTime) / 60);
                    console.log(`Jeton valide pour encore ~${timeLeftMinutes} minutes`);
                }
            }

            return { Authorization: 'Bearer ' + token };
        } catch (error) {
            console.error("Erreur lors de l'analyse du jeton:", error);
            // Return the token even if we can't parse it
            // Backend will validate and reject if needed
            return { Authorization: 'Bearer ' + token };
        }
    } catch (error) {
        console.error("Erreur dans authHeader:", error);
        return {};
    }
} 