package com.java.portfolioAnalyser;

import org.springframework.data.mongodb.repository.DeleteQuery;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

/**
 * Spring Data-MongoDB repository for CRUD operations on User entities.
 */
public interface UserRepo extends MongoRepository<User, String> {

    /**
     * Custom query to find a user by their unique identifier (MongoID).
     *
     * @param id The unique identifier of the user to be retrieved.
     * @return The User object associated with the provided identifier.
     */
    @Query("{_id:'?0'}")
    User findUserByID(String id);

    /**
     * Custom query to find a user by their username.
     *
     * @param name The username of the user to be retrieved.
     * @return The User object associated with the provided username.
     */
    @Query("{userName:'?0'}")
    User findUserByUserName(String name);

    /**
     * Custom query to find a user by their email address.
     *
     * @param email The email address of the user to be retrieved.
     * @return The User object associated with the provided email address.
     */
    @Query("{email:'?0'}")
    User findUserByEmail(String email);

    /**
     * Custom query to delete a user by their email address.
     *
     * @param email The email address of the user to be deleted.
     */
    @DeleteQuery("{email:'?0'}")
    void deleteUserByEmail(String email);

    /**
     * Custom query to delete a user by their unique identifier (MongoID).
     *
     * @param id The unique identifier of the user to be deleted.
     */
    @DeleteQuery("{_id:'?0'}")
    void deleteUserByID(String id);
}


