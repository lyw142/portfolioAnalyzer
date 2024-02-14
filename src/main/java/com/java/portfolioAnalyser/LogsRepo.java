package com.java.portfolioAnalyser;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository interface for managing log entities.
 */
@Repository
public interface LogsRepo extends MongoRepository<Logs, String> { }
