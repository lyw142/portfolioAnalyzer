package com.java.portfolioAnalyser;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

/** MongoDB Repository for Historical Price Stock. */
@Repository
public interface HistoricalPriceStockRepo
    extends MongoRepository<HistoricalPriceStock, String> { }
