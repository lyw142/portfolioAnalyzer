package com.java.portfolioAnalyser;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;

/**
 * This class initializes the database with an admin user if none exists.
 */
@Component
public class AdminInitializer {

    /**
     * The User Repository used for accessing and managing user data.
     */
    @Autowired
    private UserRepo userRepo;

    /**
     * Initializes the database with an admin user if no admin user exists.
     */
    @PostConstruct
    public void init() {
        if (userRepo.findUserByEmail("admin@gmail.com") == null) {
            Admin adminUser = new Admin("admin@gmail.com", "admin123#");
            userRepo.save(adminUser);
        }
    }
}
