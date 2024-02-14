package com.java.portfolioAnalyser;

import java.time.LocalDateTime;

import org.springframework.data.mongodb.core.mapping.DBRef;

import com.fasterxml.jackson.annotation.JsonIgnore;

/**
 * Represents the details of a stock held within a portfolio, including
 * quantity, price, and purchase date.
 * This class is used to store relevant information for a specific portfolio.
 */
public class StockDetails {
    /**
     * The reference to the stock associated with these details.
     */
    @DBRef(lazy = true)
    @JsonIgnore
    private Stock stockReference;

    /**
     * The quantity of this stock held at the time of purchase.
     */
    private int qty;

    /**
     * The current price of the stock at the time of purchase.
     */
    private double currentStockPrice;

    /**
     * The date and time when this stock was purchased within the portfolio.
     */
    private LocalDateTime purchasedDateTime;

    /**
     * Constructs a new StockDetails object with the specified stock reference,
     * quantity, current stock price, and purchase date.
     *
     * @param stockReference    The reference to the stock associated with these
     *                          details.
     * @param qty               The quantity of this stock held within the
     *                          portfolio.
     * @param currentStockPrice The current price of the stock at the time of
     *                          purchase.
     * @param purchasedDateTime The date and time when this stock was purchased
     *                          within the portfolio.
     */
    public StockDetails(Stock stockReference, int qty, double currentStockPrice,
            LocalDateTime purchasedDateTime) {
        this.stockReference = stockReference;
        this.qty = qty;
        this.currentStockPrice = currentStockPrice;
        this.purchasedDateTime = purchasedDateTime;
    }

    /**
     * Retrieves the reference to the stock associated with these details.
     *
     * @return The stock reference.
     */
    public Stock getStockReference() {
        return stockReference;
    }

    /**
     * Retrieves the quantity of this stock held within the portfolio.
     *
     * @return The stock quantity.
     */
    public int getQty() {
        return qty;
    }

    /**
     * Retrieves the current price of the stock at the time of purchase.
     *
     * @return The current stock price.
     */
    public double getCurrentStockPrice() {
        return currentStockPrice;
    }

    /**
     * Retrieves the date and time when this stock was purchased within the
     * portfolio.
     *
     * @return The purchase date and time.
     */
    public LocalDateTime getPurchasedDateTime() {
        return purchasedDateTime;
    }
}
