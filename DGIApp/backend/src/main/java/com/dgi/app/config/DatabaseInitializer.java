package com.dgi.app.config;

import com.dgi.app.model.ERole;
import com.dgi.app.model.User;
import com.dgi.app.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DatabaseInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Only run if there are no users in the database
        if (userRepository.count() == 0) {
            // Create default users
            createUser("admin", "admin@example.com", "password", ERole.ROLE_ADMIN);
            createUser("manager", "manager@example.com", "password", ERole.ROLE_MANAGER);
            createUser("processing", "processing@example.com", "password", ERole.ROLE_PROCESSING);
            createUser("frontdesk", "frontdesk@example.com", "password", ERole.ROLE_FRONTDESK);

            System.out.println("Default users created successfully!");
        }
    }

    private void createUser(String username, String email, String password, ERole role) {
        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(role);
        userRepository.save(user);
    }
}