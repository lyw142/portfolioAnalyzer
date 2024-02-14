package com.java.portfolioAnalyser;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.TreeMap;

/**
 * This class represents a REST controller for handling
 * portfolio-related API requests.
 * It provides methods for managing portfolios,
 * calculating rebalanced portfolios,
 * and retrieving historical price data.
 */
@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("api/v1/portfolios")
public class PortfolioController {

    /** Repository for managing portfolios. */
    private final PortfolioRepo portfolioRepository;

    /** Repository for accessing stock data. */
    @Autowired
    private final StockRepo stockRepo;

    /** Service for managing stock-related operations. */
    @Autowired
    private final StockService stockService;

    /** Repository for historical price data with portfolios. */
    @Autowired
    private final HistoricalPricePortfolioRepo historicalPricePortfolioRepo;

    /**
     * Constructs a new PortfolioController instance.
     *
     * @param sRepo              Repository for stock data.
     * @param pRepository        Repository for portfolios.
     * @param sService           Service for managing stock-related operations.
     * @param histPricePortfolioRepo Repository for historical price data.
     */
    @Autowired
    public PortfolioController(final StockRepo sRepo,
                               final PortfolioRepo pRepository,
                               final StockService sService,
                               final HistoricalPricePortfolioRepo
                                           histPricePortfolioRepo) {
        this.stockRepo = sRepo;
        this.portfolioRepository = pRepository;
        this.stockService = sService;
        this.historicalPricePortfolioRepo = histPricePortfolioRepo;
    }

    /**
     * Retrieves a list of all portfolios.
     *
     * @return A list of portfolios.
     */
    @GetMapping
    public List<Portfolio> fetchAllPortfolios() {

        return portfolioRepository.findAll();
    }

    /**
     * Calculates the rebalanced portfolio for a specified portfolio.
     *
     * @param portfolioId The ID of the portfolio.
     * @return A map containing the rebalanced portfolio
     *          with stock symbols and quantities.
     * @throws PortfolioNotFoundException
     *          If the specified portfolio is not found.
     */
    @GetMapping("/{portfolioId}/rebalancedPortfolio")
    public Map<String, Integer> rebalancedPortfolio(
            final @PathVariable String portfolioId) {

        Optional<Portfolio> optionalPortfolio =
                portfolioRepository.findByPortfolioId(portfolioId);

        if (optionalPortfolio.isPresent()) {
            Portfolio portfolio = optionalPortfolio.get();
            return portfolio.rebalancedPortfolio(stockRepo);
        } else {
            throw new PortfolioNotFoundException(
                    "Portfolio not found with ID: " + portfolioId);
        }
    }

    /**
     * Calculates the historical price percentage change
     * for a specified portfolio within a time interval.
     *
     * @param portfolioId    The ID of the portfolio.
     * @param tInterval   The time interval for calculating
     *                       percentage change (e.g., "daily" or "monthly").
     * @return A map containing the historical price percentage change data.
     * @throws PortfolioNotFoundException
     *          If the specified portfolio is not found.
     */
    @GetMapping("/{portfolioId}/historicalPricePercentageChange/{tInterval}")
    public TreeMap<String, Double> calculateHistoricalPricePercentageChange(
            final @PathVariable String portfolioId,
            final @PathVariable String tInterval) {

        Optional<Portfolio> optionalPortfolio =
                portfolioRepository.findByPortfolioId(portfolioId);

        if (optionalPortfolio.isPresent()) {
            Portfolio portfolio = optionalPortfolio.get();
            HistoricalPricePortfolio historicalPricePortfolio =
                    portfolio.getHistoricalPricePortfolio();
            return historicalPricePortfolio.calcuatePercentageChange(tInterval);
        } else {
            throw new PortfolioNotFoundException(
                    "Portfolio not found with ID: " + portfolioId);
        }
    }

    /**
     * Retrieves historical price data for a
     * specified portfolio within a time interval.
     *
     * @param portfolioId    The ID of the portfolio.
     * @param timeInterval   The time interval for retrieving
     *                       historical price data.
     * @return A map containing historical price data.
     * @throws PortfolioNotFoundException
     *          If the specified portfolio is not found.
     * @throws IllegalArgumentException
     *          If the provided time interval is invalid.
     */
    @GetMapping("/{portfolioId}/historicalPrice/{timeInterval}")
    public Map<String, Double> getHistoricalPrice(
            final @PathVariable String portfolioId,
            final @PathVariable String timeInterval) {

        Optional<Portfolio> optionalPortfolio =
                portfolioRepository.findByPortfolioId(portfolioId);

        if (optionalPortfolio.isPresent()) {
            Portfolio portfolio = optionalPortfolio.get();
            if (timeInterval.equals("monthly")) {
                HistoricalPricePortfolio hpp =
                        portfolio.getHistoricalPricePortfolio();
                return hpp.getDatePriceMonthlyMap();
            } else if (timeInterval.equals("daily")) {
                HistoricalPricePortfolio hpp =
                        portfolio.getHistoricalPricePortfolio();
                return hpp.getDatePriceDailyMap();
            } else {
                throw new IllegalArgumentException(
                        "timeInterval must be either monthly or daily");
            }
        } else {
            throw new PortfolioNotFoundException(
                    "Portfolio not found with ID: " + portfolioId);
        }
    }

}
