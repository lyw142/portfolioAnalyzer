package com.java.portfolioAnalyser;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository interface for managing portfolio entities.
 */
@Repository
public interface PortfolioRepo extends MongoRepository<Portfolio, String> {

    /**
     * Retrieve a portfolio by its unique identifier.
     *
     * @param portfolioId The unique identifier of the portfolio to retrieve.
     * @return An optional containing the portfolio if found,
     *         or empty if not found.
     */

    Optional<Portfolio> findByPortfolioId(String portfolioId);
}
