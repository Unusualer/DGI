package com.dgi.app.service;

import com.dgi.app.model.Attestation;
import com.dgi.app.model.Request;
import com.dgi.app.model.TypeAttestation;
import com.dgi.app.model.User;
import com.dgi.app.repository.AttestationRepository;
import com.dgi.app.repository.RequestRepository;
import com.dgi.app.repository.TypeAttestationRepository;
import com.dgi.app.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import java.util.Map;
import java.util.List;
import java.util.ArrayList;
import java.util.regex.Pattern;
import java.util.regex.Matcher;

@Service
public class ChatbotService {
    @Autowired
    private AttestationRepository attestationRepository;
    @Autowired
    private RequestRepository requestRepository;
    @Autowired
    private TypeAttestationRepository typeAttestationRepository;
    @Autowired
    private UserRepository userRepository;

    private final String OLLAMA_URL = "http://dgiapp-ollama-1:11434/api/generate";
    private final String MODEL = "llama2";

    // French words and patterns for language detection
    private static final String[] FRENCH_WORDS = {
            "bonjour", "salut", "merci", "oui", "non", "comment", "quoi", "où", "quand", "pourquoi",
            "attestation", "demande", "utilisateur", "type", "statut", "créé", "mis", "jour",
            "téléphone", "email", "nom", "prénom", "cin", "ice", "secteur", "état", "remarque",
            "motif", "rejet", "traitement", "entrée", "agent", "rôle", "utilisateur", "créateur",
            "livré", "par", "avec", "pour", "dans", "sur", "sous", "entre", "depuis", "jusqu",
            "avant", "après", "maintenant", "aujourd", "hier", "demain", "semaine", "mois", "année",
            "premier", "dernier", "nouveau", "ancien", "grand", "petit", "bon", "mauvais",
            "tous", "toutes", "aucun", "aucune", "quelques", "plusieurs", "beaucoup", "peu",
            "combien", "quel", "quelle", "quels", "quelles", "montrez", "montre", "voir", "voir",
            "avez", "avez-vous", "avez-vous", "sont", "sont-ils", "sont-elles", "est", "est-ce",
            "peux", "peux-tu", "pouvez", "pouvez-vous", "voulez", "voulez-vous", "allez", "allez-vous"
    };

    // English words and patterns for language detection
    private static final String[] ENGLISH_WORDS = {
            "hello", "hi", "thanks", "yes", "no", "how", "what", "where", "when", "why",
            "attestation", "request", "user", "type", "status", "created", "updated", "phone",
            "email", "name", "first", "last", "cin", "ice", "sector", "state", "remark",
            "reason", "rejection", "processing", "entry", "agent", "role", "creator", "delivered",
            "by", "with", "for", "in", "on", "under", "between", "since", "until", "before",
            "after", "now", "today", "yesterday", "tomorrow", "week", "month", "year",
            "first", "last", "new", "old", "big", "small", "good", "bad", "all", "none",
            "some", "several", "many", "few", "show", "tell", "give", "get", "have", "has",
            "are", "is", "can", "could", "would", "will", "do", "does", "did"
    };

    private String detectLanguage(String text) {
        String lowerText = text.toLowerCase();
        int frenchScore = 0;
        int englishScore = 0;

        // Count French words
        for (String word : FRENCH_WORDS) {
            if (lowerText.contains(word)) {
                frenchScore++;
            }
        }

        // Count English words
        for (String word : ENGLISH_WORDS) {
            if (lowerText.contains(word)) {
                englishScore++;
            }
        }

        // Check for French-specific characters and patterns
        if (lowerText.contains("é") || lowerText.contains("è") || lowerText.contains("à") ||
                lowerText.contains("ç") || lowerText.contains("ù") || lowerText.contains("â") ||
                lowerText.contains("ê") || lowerText.contains("î") || lowerText.contains("ô") ||
                lowerText.contains("û") || lowerText.contains("ë") || lowerText.contains("ï") ||
                lowerText.contains("ü") || lowerText.contains("ÿ")) {
            frenchScore += 5; // Increased weight for French characters
        }

        // Check for French question patterns
        if (lowerText.contains("comment") || lowerText.contains("pourquoi") ||
                lowerText.contains("où") || lowerText.contains("quand") || lowerText.contains("quoi") ||
                lowerText.contains("combien") || lowerText.contains("quel") || lowerText.contains("quelle")) {
            frenchScore += 3;
        }

        // Check for English question patterns
        if (lowerText.contains("how") || lowerText.contains("why") ||
                lowerText.contains("where") || lowerText.contains("when") || lowerText.contains("what") ||
                lowerText.contains("how many") || lowerText.contains("which") || lowerText.contains("who")) {
            englishScore += 3;
        }

        // Check for French greetings
        if (lowerText.contains("bonjour") || lowerText.contains("salut") || lowerText.contains("bonsoir")) {
            frenchScore += 4;
        }

        // Check for English greetings
        if (lowerText.contains("hello") || lowerText.contains("hi") || lowerText.contains("good morning") ||
                lowerText.contains("good afternoon") || lowerText.contains("good evening")) {
            englishScore += 4;
        }

        // Return the detected language
        if (frenchScore > englishScore) {
            return "french";
        } else if (englishScore > frenchScore) {
            return "english";
        } else {
            // Default to French if scores are equal (since it's a French application)
            return "french";
        }
    }

    public String askQuestion(String question) {
        // Detect the language of the question
        String detectedLanguage = detectLanguage(question);
        System.out.println("[Chatbot] Detected language: " + detectedLanguage + " for question: " + question);

        // Extract potential IDs from the question
        String idPattern = "id\\s*=\\s*(\\d+)";
        Pattern pattern = Pattern.compile(idPattern, Pattern.CASE_INSENSITIVE);
        Matcher matcher = pattern.matcher(question);
        String targetId = null;
        if (matcher.find()) {
            targetId = matcher.group(1);
        }

        // Fetch data based on the question content
        List<Attestation> attestations = new ArrayList<>();
        List<Request> requests = new ArrayList<>();
        List<TypeAttestation> typeAttestations = new ArrayList<>();
        List<User> users = new ArrayList<>();

        // Check for specific table mentions
        boolean mentionsAttestation = question.toLowerCase().contains("attestation");
        boolean mentionsRequest = question.toLowerCase().contains("request")
                || question.toLowerCase().contains("demande");
        boolean mentionsType = question.toLowerCase().contains("type");
        boolean mentionsUser = question.toLowerCase().contains("user")
                || question.toLowerCase().contains("utilisateur");

        // If no specific table is mentioned, fetch all data
        if (!mentionsAttestation && !mentionsRequest && !mentionsType && !mentionsUser) {
            if (targetId != null) {
                // If ID is provided, fetch specific records from all tables
                attestationRepository.findById(Long.parseLong(targetId)).ifPresent(attestations::add);
                requestRepository.findById(Long.parseLong(targetId)).ifPresent(requests::add);
                typeAttestationRepository.findById(Long.parseLong(targetId)).ifPresent(typeAttestations::add);
                userRepository.findById(Long.parseLong(targetId)).ifPresent(users::add);
            } else {
                // Fetch recent records from all tables
                attestations = attestationRepository.findAll().stream().limit(5).toList();
                requests = requestRepository.findAll().stream().limit(5).toList();
                typeAttestations = typeAttestationRepository.findAll();
                users = userRepository.findAll().stream().limit(5).toList();
            }
        } else {
            // Fetch data only from mentioned tables
            if (mentionsAttestation) {
                if (targetId != null) {
                    attestationRepository.findById(Long.parseLong(targetId)).ifPresent(attestations::add);
                } else {
                    attestations = attestationRepository.findAll().stream().limit(5).toList();
                }
            }
            if (mentionsRequest) {
                if (targetId != null) {
                    requestRepository.findById(Long.parseLong(targetId)).ifPresent(requests::add);
                } else {
                    requests = requestRepository.findAll().stream().limit(5).toList();
                }
            }
            if (mentionsType) {
                typeAttestations = typeAttestationRepository.findAll();
            }
            if (mentionsUser) {
                if (targetId != null) {
                    userRepository.findById(Long.parseLong(targetId)).ifPresent(users::add);
                } else {
                    users = userRepository.findAll().stream().limit(5).toList();
                }
            }
        }

        // Build a comprehensive prompt based on detected language
        StringBuilder context = new StringBuilder();

        if ("french".equals(detectedLanguage)) {
            context.append("=== INSTRUCTIONS CRITIQUES ===\n");
            context.append("RÉPONDEZ UNIQUEMENT EN FRANÇAIS. AUCUN MOT EN ANGLAIS N'EST AUTORISÉ.\n");
            context.append(
                    "Vous êtes l'Assistant DGI, un chatbot amical et professionnel pour l'application Direction Générale des Impôts (DGI).\n");
            context.append("RÈGLES STRICTES:\n");
            context.append("1. Répondez TOUJOURS en français\n");
            context.append("2. N'utilisez AUCUN mot anglais\n");
            context.append("3. Soyez naturel et conversationnel\n");
            context.append("4. Soyez précis avec les données\n");
            context.append("5. Soyez concis mais informatif\n");
            context.append("6. Si vous ne trouvez pas l'information, dites-le poliment en français\n\n");
        } else {
            context.append("=== CRITICAL INSTRUCTIONS ===\n");
            context.append("RESPOND ONLY IN ENGLISH. NO FRENCH WORDS ARE ALLOWED.\n");
            context.append(
                    "You are DGI Assistant, a friendly and professional chatbot for the Direction Générale des Impôts (DGI) application.\n");
            context.append("STRICT RULES:\n");
            context.append("1. Always respond in English\n");
            context.append("2. Do NOT use ANY French words\n");
            context.append("3. Be natural and conversational\n");
            context.append("4. Be accurate and precise with data\n");
            context.append("5. Be concise but informative\n");
            context.append("6. If you cannot find the information, say so politely in English\n\n");
        }

        // Add all available data
        if (!typeAttestations.isEmpty()) {
            if ("french".equals(detectedLanguage)) {
                context.append("Types d'attestations disponibles:\n");
            } else {
                context.append("Available attestation types:\n");
            }
            typeAttestations.forEach(t -> {
                context.append("- ID: ").append(t.getId())
                        .append(", Label: ").append(t.getLabel())
                        .append(", Créé le: ").append(t.getCreatedAt()).append("\n");
            });
            context.append("\n");
        }

        if (!attestations.isEmpty()) {
            if ("french".equals(detectedLanguage)) {
                context.append("Attestations:\n");
            } else {
                context.append("Attestations:\n");
            }
            attestations.forEach(a -> {
                context.append("- ID: ").append(a.getId())
                        .append(", Type: ").append(a.getType())
                        .append(", CIN: ").append(a.getCin())
                        .append(", IF: ").append(a.getIfValue())
                        .append(", Nom: ").append(a.getNom()).append(" ").append(a.getPrenom())
                        .append(", Email: ").append(a.getEmail())
                        .append(", Téléphone: ").append(a.getPhone())
                        .append(", Statut: ").append(a.getStatus())
                        .append(", Créé le: ").append(a.getCreatedAt())
                        .append(", Mis à jour le: ").append(a.getUpdatedAt())
                        .append(", Créé par: ").append(a.getCreator().getUsername())
                        .append(", Livré par: ")
                        .append(a.getDeliveredBy() != null ? a.getDeliveredBy().getUsername() : "N/A")
                        .append("\n");
            });
            context.append("\n");
        }

        if (!requests.isEmpty()) {
            if ("french".equals(detectedLanguage)) {
                context.append("Demandes:\n");
            } else {
                context.append("Requests:\n");
            }
            requests.forEach(r -> {
                context.append("- ID: ").append(r.getId())
                        .append(", Type: ").append(r.getObjet())
                        .append(", CIN: ").append(r.getCin())
                        .append(", IF: ").append(r.getIfValue())
                        .append(", ICE: ").append(r.getIce())
                        .append(", Nom: ").append(r.getRaisonSocialeNomsPrenom())
                        .append(", Email: ").append(r.getEmail())
                        .append(", Téléphone: ").append(r.getGsm()).append("/").append(r.getFix())
                        .append(", Secteur: ").append(r.getSecteur())
                        .append(", PM/PP: ").append(r.getPmPp())
                        .append(", TP: ").append(r.getTp())
                        .append(", État: ").append(r.getEtat())
                        .append(", Date d'entrée: ").append(r.getDateEntree())
                        .append(", Date de traitement: ").append(r.getDateTraitement())
                        .append(", Motif de rejet: ").append(r.getMotifRejet())
                        .append(", Remarque: ").append(r.getRemarque())
                        .append(", Créé le: ").append(r.getCreatedAt())
                        .append(", Mis à jour le: ").append(r.getUpdatedAt())
                        .append(", Créé par: ").append(r.getCreator().getUsername())
                        .append(", Agent: ").append(r.getAgent() != null ? r.getAgent().getUsername() : "N/A")
                        .append("\n");
            });
            context.append("\n");
        }

        if (!users.isEmpty()) {
            if ("french".equals(detectedLanguage)) {
                context.append("Utilisateurs:\n");
            } else {
                context.append("Users:\n");
            }
            users.forEach(u -> {
                context.append("- ID: ").append(u.getId())
                        .append(", Nom d'utilisateur: ").append(u.getUsername())
                        .append(", Email: ").append(u.getEmail())
                        .append(", Rôle: ").append(u.getRole())
                        .append("\n");
            });
            context.append("\n");
        }

        context.append("Question: ").append(question).append("\n");

        if ("french".equals(detectedLanguage)) {
            context.append("=== RÉPONSE REQUISE ===\n");
            context.append("RÉPONDEZ MAINTENANT EN FRANÇAIS SEULEMENT. AUCUN MOT ANGLAIS.\n");
            context.append("Utilisez les informations ci-dessus pour répondre de manière naturelle et précise.\n");
            context.append("Si vous ne trouvez pas l'information demandée, dites-le poliment en français.\n");
            context.append("RÉPONSE:");
        } else {
            context.append("=== REQUIRED RESPONSE ===\n");
            context.append("RESPOND NOW IN ENGLISH ONLY. NO FRENCH WORDS.\n");
            context.append("Use the information above to respond naturally and precisely.\n");
            context.append("If you cannot find the requested information, say so politely in English.\n");
            context.append("RESPONSE:");
        }

        // Prepare Ollama API request with optimized parameters for llama2
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        Map<String, Object> body = Map.of(
                "model", MODEL,
                "prompt", context.toString(),
                "stream", false,
                "temperature", 0.2, // Lower temperature for more precise responses
                "top_p", 0.95, // Higher top_p for better quality
                "top_k", 50, // Higher top_k for better selection
                "repeat_penalty", 1.2, // Higher penalty to prevent repetition
                "num_predict", 200, // Increased for more detailed responses
                "stop", List.of("Human:", "Assistant:", "User:", "Bot:") // Better conversation control
        );
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            @SuppressWarnings("unchecked")
            ResponseEntity<Map<String, Object>> response = (ResponseEntity<Map<String, Object>>) (ResponseEntity<?>) restTemplate
                    .postForEntity(OLLAMA_URL, entity, Map.class);
            Map<String, Object> responseBody = response.getBody();
            if (response.getStatusCode().is2xxSuccessful() && responseBody != null) {
                Object resp = responseBody.get("response");
                if (resp != null) {
                    String answer = resp.toString().trim();

                    // Validate that the response is in the correct language
                    boolean isCorrectLanguage = false;
                    if ("french".equals(detectedLanguage)) {
                        isCorrectLanguage = isFrenchResponse(answer);
                    } else {
                        isCorrectLanguage = isEnglishResponse(answer);
                    }

                    if (!isCorrectLanguage) {
                        // If the LLM didn't follow language instructions, provide a fallback response
                        if ("french".equals(detectedLanguage)) {
                            answer = "Bonjour ! Je suis l'assistant DGI. Comment puis-je vous aider aujourd'hui ?";
                        } else {
                            answer = "Hello! I am the DGI assistant. How can I help you today?";
                        }
                        System.out.println("[Chatbot] Language validation failed, using fallback response");
                    }

                    return answer;
                } else {
                    return "french".equals(detectedLanguage)
                            ? "Je m'excuse, mais je n'ai pas pu générer une réponse à ce moment."
                            : "I apologize, but I couldn't generate a response at this time.";
                }
            } else {
                return "french".equals(detectedLanguage)
                        ? "Je m'excuse, mais je rencontre des difficultés à traiter votre demande."
                        : "I apologize, but I'm having difficulties processing your request.";
            }
        } catch (Exception e) {
            System.err.println("Error calling Ollama API: " + e.getMessage());
            e.printStackTrace();
            return "french".equals(detectedLanguage)
                    ? "Je m'excuse, mais je rencontre des difficultés techniques. Veuillez réessayer plus tard."
                    : "I apologize, but I'm experiencing technical difficulties. Please try again later.";
        }
    }

    private boolean isFrenchResponse(String response) {
        String lowerResponse = response.toLowerCase();

        // Check for French-specific characters (strongest indicator)
        if (lowerResponse.contains("é") || lowerResponse.contains("è") || lowerResponse.contains("à") ||
                lowerResponse.contains("ç") || lowerResponse.contains("ù") || lowerResponse.contains("â") ||
                lowerResponse.contains("ê") || lowerResponse.contains("î") || lowerResponse.contains("ô") ||
                lowerResponse.contains("û") || lowerResponse.contains("ë") || lowerResponse.contains("ï") ||
                lowerResponse.contains("ü") || lowerResponse.contains("ÿ")) {
            return true;
        }

        // Check for common French words and phrases
        String[] frenchIndicators = {
                "bonjour", "salut", "merci", "oui", "non", "comment", "quoi", "où", "quand", "pourquoi",
                "je", "tu", "il", "elle", "nous", "vous", "ils", "elles", "suis", "es", "est", "sommes", "êtes", "sont",
                "avoir", "être", "faire", "aller", "venir", "voir", "savoir", "pouvoir", "vouloir",
                "avec", "pour", "dans", "sur", "sous", "entre", "depuis", "jusqu", "avant", "après",
                "maintenant", "aujourd", "hier", "demain", "semaine", "mois", "année",
                "attestation", "demande", "utilisateur", "statut", "créé", "mis", "jour",
                "téléphone", "email", "nom", "prénom", "cin", "ice", "secteur", "état", "remarque"
        };

        int frenchWordCount = 0;
        for (String word : frenchIndicators) {
            if (lowerResponse.contains(word)) {
                frenchWordCount++;
            }
        }

        // If we find 3 or more French words, consider it a French response
        return frenchWordCount >= 3;
    }

    private boolean isEnglishResponse(String response) {
        String lowerResponse = response.toLowerCase();

        // Check for common English words and phrases
        String[] englishIndicators = {
                "hello", "hi", "thanks", "yes", "no", "how", "what", "where", "when", "why",
                "i", "you", "he", "she", "we", "they", "am", "is", "are", "was", "were",
                "have", "has", "had", "do", "does", "did", "can", "could", "would", "will",
                "with", "for", "in", "on", "under", "between", "since", "until", "before", "after",
                "now", "today", "yesterday", "tomorrow", "week", "month", "year",
                "attestation", "request", "user", "status", "created", "updated", "phone",
                "email", "name", "first", "last", "cin", "ice", "sector", "state", "remark"
        };

        int englishWordCount = 0;
        for (String word : englishIndicators) {
            if (lowerResponse.contains(word)) {
                englishWordCount++;
            }
        }

        // If we find 3 or more English words, consider it an English response
        return englishWordCount >= 3;
    }
}