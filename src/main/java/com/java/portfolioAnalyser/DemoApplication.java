package com.java.portfolioAnalyser;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;
import org.springframework.web.bind.annotation.CrossOrigin; // To bypass CORS Errors so that frontend can make non GET requests to backend


/**
 * Main Application. Run this to start the backend server.
 */
@CrossOrigin(origins = "http://localhost:3000")
@SpringBootApplication
@EnableMongoRepositories(basePackages = "com.java.portfolioAnalyser")
public class DemoApplication {

    /**
     * Main method. Run this to start the backend server.
     *
     * @param args Command line arguments.
     */
    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }
}

