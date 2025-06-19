package com.dgi.app.controller;

import com.dgi.app.service.ChatbotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import com.dgi.app.security.services.UserDetailsImpl;

@RestController
@RequestMapping("/api/chatbot")
public class ChatbotController {
    @Autowired
    private ChatbotService chatbotService;

    @PostMapping("/ask")
    public ResponseEntity<?> ask(@RequestBody Map<String, String> payload) {
        String question = payload.get("question");
        if (question == null || question.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Question is required."));
        }
        // Fetch current authenticated user for logging
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = "anonymous";
        if (authentication != null && authentication.getPrincipal() instanceof UserDetailsImpl) {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            username = userDetails.getUsername();
        }
        System.out.println("[Chatbot] User '" + username + "' asked: " + question);
        String answer = chatbotService.askQuestion(question);
        return ResponseEntity.ok(Map.of("answer", answer));
    }
}