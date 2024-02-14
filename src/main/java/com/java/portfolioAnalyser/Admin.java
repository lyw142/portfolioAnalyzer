package com.java.portfolioAnalyser;

import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Represents an admin user.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "User")
public class Admin extends User {
    /** the role of the admin user. */
    @Field(name = "role")
    private String role;

    /**
     * Constructs a new Admin object with the specified email and password.
     *
     * @param email     The email of the admin user.
     * @param password  The password of the admin user.
     */
    public Admin(final String email, final String password) {
        super(email, password);
        this.role = "Admin";
    }

    /**
     * Returns the role of the admin user.
     *
     * @return the role of the admin user.
     */
    public String getRole() {
        return role;
    }
}

