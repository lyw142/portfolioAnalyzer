package com.java.portfolioAnalyser;

import java.util.Map;

import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import com.fasterxml.jackson.annotation.JsonIgnore;

import org.springframework.data.annotation.Id;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Represents a stock in the application.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "stock")
public class Stock {

    /** Stock ID. */
    @Id
    /** Stock symbol. */
    private String stockSymbol;

    /** Stock name. */
    private String stockName;

    /** Stock description. */
    private String stockDescription;

    /** Stock country. */
    private String country;

    /** Stock sector. */
    private String sector;

    /** Stock exchange. */
    private String exchange;

    /** Stock industry. */
    private String industry;

    /** Stock annual return. Key: year, Value: annual return. */
    private Map<String, Double> annualReturn;

    /** Stock annualized return. Key: year, Value: annualized return. */
    private Map<String, Double> annualizedReturn;

    /** Stock annualized volatility. Key: year, Value: annualized volatility. */
    private Map<String, Double> annualizedVolatilityMonths;

    /** Stock annualized volatility.
     * Key: time period, Value: annualized volatility.
    */
    private Map<String, Double> annualizedVolatilityDays;

    /** Stock latest date retrieved from api. */
    private String latestDateRetrieved;

    /** Stock latest trading day. */
    private String latestTradingDay;

    /** Stock current stock price. */
    private Double currentStockPrice;

    /** Stock historical price. */
    @DBRef(lazy = true)
    @JsonIgnore
    private HistoricalPriceStock historicalStockPrice;

    /**
     * Constructor for Stock.
     *
     * @param stockSymbol Stock symbol
     */
    public Stock(final String stockSymbol) {
        this.stockSymbol = stockSymbol;
    }

    /**
     * Runs the statistics calculations for the stock.
     */
    public void runStatisticsCalculations() {

        HistoricalPrice hp = this.historicalStockPrice;

        this.annualReturn = hp.calculateAnnualReturn();
        this.annualizedReturn = hp.calculateAnnualizedReturns();
        this.annualizedVolatilityMonths =
            hp.calculateAnnualizedVolatility("months");
        this.annualizedVolatilityDays =
            hp.calculateAnnualizedVolatility("days");
        this.latestTradingDay = hp.getLatestTradingDay();
        this.currentStockPrice = hp.getCurrentStockPrice();
    }
}
