package com.java.portfolioAnalyser;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

/** MongoDB Repository for Historical Price Portfolio. */
@Repository
public interface HistoricalPricePortfolioRepo
    extends MongoRepository<HistoricalPricePortfolio, String> { }
