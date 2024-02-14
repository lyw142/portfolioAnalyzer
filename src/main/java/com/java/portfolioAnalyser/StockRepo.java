package com.java.portfolioAnalyser;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;

/** MongoDB Repository for Stock. */
public interface StockRepo extends MongoRepository<Stock, String> {

    /**
     * Find stock by stock symbol.
     * @param stockSymbol stock symbol
     * @return stock
     */
    @Query("{stockSymbol:'?0'}")
    Stock findStockByStockSymbol(String stockSymbol);

    /**
     * Find all stocks.
     * @return list of stocks
     */
    List<Stock> findAll();
}

