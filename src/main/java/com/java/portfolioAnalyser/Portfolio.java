package com.java.portfolioAnalyser;

import lombok.Data;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import com.fasterxml.jackson.annotation.JsonIgnore;

import java.text.DecimalFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.Map;
import java.util.Set;

/**
 * Represents a portfolio in the application.
 */
@Data
@Document(collection = "portfolio")
public class Portfolio {

    /** The unique identifier for the portfolio. */
    @Id
    private String portfolioId;

    /** The name of the portfolio.*/
    private String portfolioName;

    /** The investment strategy of the portfolio. */
    private String portfolioStrategy;

    /** The date and time when the portfolio was created. */
    private LocalDateTime createdDate;

    /** The initial capital amount allocated to the portfolio. */
    private double capitalAmount;

    /**The user's email associated with the portfolio. */
    private String userEmail;

    /** A list of stock details included in the portfolio. */
    private List<StockDetails> stockList;

    /** A map of annual return values for the portfolio by year. */
    private Map<String, Double> annualReturn;

    /** A map of annualized return values for the portfolio by year. */
    private Map<String, Double> annualizedReturn;

    /** A map of annualized volatility values for the portfolio by months. */
    private Map<String, Double> annualizedVolatilityMonths;

    /** A map of annualized volatility values for the portfolio by days. */
    private Map<String, Double> annualizedVolatilityDays;

    /** A map of sector allocation percentages within the portfolio. */
    private Map<String, Double> sectorAllocated;

    /** A map of country allocation percentages within the portfolio. */
    private Map<String, Double> countryAllocated;

    /** A map of stock allocation percentages within the portfolio. */
    private Map<String, Double> percentAllocated;

    /** A map of industry allocation percentages within the portfolio. */
    private Map<String, Double> industryAllocated;

    /** A map of capital allocation percentages within the portfolio. */
    private Map<String, Double> capitalAllocated;

    /** The historical price information for the portfolio. */
    @DBRef(lazy = true)
    @JsonIgnore
    private HistoricalPricePortfolio historicalPricePortfolio;

    /**
     * Constructs a new Portfolio object.
     */
    @Autowired
    public Portfolio() {
    }

    /**
     * Constructs a new Portfolio object with a name and creation date.
     *
     * @param name The name of the portfolio.
     * @param date   The date and time when the portfolio was created.
     */
    public Portfolio(final String name, final LocalDateTime date) {
        portfolioId = name + String.valueOf(date);
        this.portfolioName = name;
        this.createdDate = date;
    }

    /**
     * Constructs a new Portfolio object with a name, strategy,
     * creation date, user email, and capital amount.
     *
     * @param pName    The name of the portfolio.
     * @param pStrategy The investment strategy of the portfolio.
     * @param date     The date and time when the portfolio was created.
     * @param email    The user's email.
     * @param capAmount The initial capital amount allocated to portfolio.
     */
    public Portfolio(final String pName, final String pStrategy,
                     final LocalDateTime date,
                     final String email,
                     final double capAmount) {
        portfolioId = pName + String.valueOf(date);
        this.portfolioStrategy = pStrategy;
        this.createdDate = date;
        this.portfolioName = pName;
        this.userEmail = email;
        this.capitalAmount = capAmount;
    }

    /**
     * Sets the name of the portfolio.
     *
     * @param pName The new name for the portfolio.
     */
    public void setPortfolioName(final String pName) {
        this.portfolioName = pName;
    }

    /**
     * Gets a list of stock details included in the portfolio.
     *
     * @return A list of stock details as a list of maps.
     */
    public List<Map<String, Object>> getStockList() {
        List<Map<String, Object>> finalStockList = new ArrayList<>();

        for (StockDetails sD : stockList) {
            Stock s = sD.getStockReference();
            String symbol = s.getStockSymbol();
            String stockName = s.getStockName();
            int qty = sD.getQty();
            double currentStockPrice = sD.getCurrentStockPrice();
            LocalDateTime purchasedDateTime = sD.getPurchasedDateTime();
            String exchange = s.getExchange();

            Map<String, Object> item = new HashMap<>();
            item.put("stockSymbol", symbol);
            item.put("stockName", stockName);
            item.put("currentStockPrice", currentStockPrice);
            item.put("qty", qty);
            item.put("exchange", exchange);
            item.put("purchasedDateTime", purchasedDateTime);
            finalStockList.add(item);
        }
        return finalStockList;
    }

    /**
     * Combines duplicate stock entries in the portfolio
     * and returns the combined list.
     *
     * @return A list of combined stock entries as a list of maps.
     */
    public List<Map<String, Object>> getCombinedStockList() {
        Map<String, Map<String, Object>> combinedMap = new HashMap<>();

        for (StockDetails sD : stockList) {
            Stock s = sD.getStockReference();
            String symbol = s.getStockSymbol();
            String stockName = s.getStockName();
            int qty = sD.getQty();
            double currentStockPrice = sD.getCurrentStockPrice();
            String exchange = s.getExchange();

            if (combinedMap.containsKey(symbol)) {
                Map<String, Object> existingItem = combinedMap.get(symbol);
                int newQty = (int) existingItem.get("qty") + qty;
                double totalAmount = (double) existingItem.get("totalAmount")
                                        + qty * currentStockPrice;
                double avgStockPrice = totalAmount / newQty;
                existingItem.put("qty", newQty);
                existingItem.put("totalAmount", totalAmount);
                existingItem.put("avgStockPrice", avgStockPrice);
            } else {
                Map<String, Object> newItem = new HashMap<>();
                newItem.put("stockName", stockName);
                newItem.put("avgStockPrice", currentStockPrice);
                newItem.put("qty", qty);
                newItem.put("totalAmount", currentStockPrice * qty);
                newItem.put("exchange", exchange);
                combinedMap.put(symbol, newItem);
            }
        }

        List<Map<String, Object>> convertedList =
                convertToStocksList(combinedMap);

        return convertedList;
    }

    /**
     * Converts a map of combined stock information
     * into a list of individual stock.
     * This method takes a map where each entry represents a stock
     * by its symbol and associated details.
     * It transforms this data into a list of maps,
     * where each map contains information for a single stock,
     * including "stockName," "avgStockPrice," "stockSymbol,"
     * "qty," and "exchange."
     *
     * @param combinedStocksList A map of combined stock information,
     *                           where keys are stock symbols and
     *                          values are maps containing stock details.
     * @return A list of maps, where each map represents an individual stock
     *                          and its information.
     */
    public List<Map<String, Object>> convertToStocksList(final Map<String,
            Map<String, Object>> combinedStocksList) {
        DecimalFormat dfZero = new DecimalFormat("0.00");

        List<Map<String, Object>> stocksList = new ArrayList<>();

        for (Map.Entry<String, Map<String, Object>> entry
                : combinedStocksList.entrySet()) {
            String stockSymbol = entry.getKey();
            Map<String, Object> stockInfo = entry.getValue();

            Map<String, Object> stock = new HashMap<>();
            stock.put("stockName", stockInfo.get("stockName"));
            stock.put("avgStockPrice",
                    dfZero.format((double) stockInfo.get("avgStockPrice")));
            stock.put("stockSymbol", stockSymbol);
            stock.put("qty", stockInfo.get("qty"));
            stock.put("exchange", stockInfo.get("exchange"));

            stocksList.add(stock);
        }

        return stocksList;
    }

    /**
     * Calculates the used capital amount in the portfolio.
     *
     * @param map       A list of stock data in the portfolio.
     * @param stockRepo A reference to the StockRepo for stock data.
     * @return The total amount of capital used in the portfolio.
     */
    public double calculateUsedCapitalAmount(final
                                             List<Map<String, Object>> map,
                                             final StockRepo stockRepo) {
        double amount = 0;
        double currentStockPrice = 0.0;

        for (Map<String, Object> mp : map) {
            if (!(mp.containsKey("currentStockPrice"))) {
                Stock s = stockRepo.findStockByStockSymbol((String)
                        mp.get("stockSymbol"));
                currentStockPrice = s.getCurrentStockPrice();
            } else if (mp.get("currentStockPrice") instanceof String) {
                currentStockPrice = Double.parseDouble((String)
                        mp.get("currentStockPrice"));
            } else {
                currentStockPrice = (double) mp.get("currentStockPrice");
            }
            amount += (int) mp.get("qty") * currentStockPrice;
        }

        return amount;
    }

    /**
     * Adds a stock to the portfolio.
     *
     * @param stockData      Stock data to be added to the portfolio.
     * @param stockRepo      Repository for stock data.
     * @param portfolioRepository    Repository for portfolio data.
     * @param historicalPricePortfolioRepo Repository for historical price data.
     * @param logsRepo        Repository for log data.
     */
    public void addStock(final Map<String, Object> stockData,
                         final StockRepo stockRepo,
                         final PortfolioRepo portfolioRepository,
                         final HistoricalPricePortfolioRepo
                                 historicalPricePortfolioRepo,
                         final LogsRepo logsRepo) {
        // finds the price of the Stock object
        // tgt w the data passed in from Controller; qty, exchange, stockSymbol
        if (this.stockList == null) {
            this.stockList = new ArrayList<>();
        }

        String stockSymbol = (String) stockData.get("stockSymbol");
        Integer qty = (Integer) stockData.get("qty");

        Stock s = stockRepo.findStockByStockSymbol(stockSymbol);
        Double currentStockPrice = s.getCurrentStockPrice();

        StockDetails sd = new StockDetails(s, qty,
                currentStockPrice, LocalDateTime.now());
        this.stockList.add(sd);

        calculateHistoricalPrice(portfolioRepository,
                stockRepo, historicalPricePortfolioRepo);

        // calc the new values and assigning to the portfolio
        this.sectorAllocated = calculateSectorAllocated(stockRepo);
        this.capitalAllocated = calculateCapitalAllocated(stockRepo);
        this.percentAllocated = calculatePercentAllocated(stockRepo);
        this.industryAllocated = calculateIndustryAllocated(stockRepo);
        this.countryAllocated = calculateCountryAllocated(stockRepo);
    }

    /**
     * Removes a stock from the portfolio.
     *
     * @param userData     Stock data to be removed from the portfolio.
     * @param portfolioRepository        Repository for portfolio data.
     * @param stockRepo                 Repository for stock data.
     * @param historicalPricePortfolioRepo Repository for historical price data.
     */
    public void removeStock(final Map<String, Object> userData,
                            final PortfolioRepo portfolioRepository,
                            final StockRepo stockRepo,
                            final HistoricalPricePortfolioRepo
                                    historicalPricePortfolioRepo) {
        if (userData == null) {
            return;
        }

        String userStockSymbol = (String) userData.get("stockSymbol");
        int userQty = (int) userData.get("qty");

        double userStockPrice = Double.parseDouble((String)
                userData.get("currentStockPrice"));

        String userPurchasedDateStr =
                (String) userData.get("purchasedDateTime");

        SimpleDateFormat inputDateFormat =
                new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS");

        SimpleDateFormat outputDateFormat =
                new SimpleDateFormat("EEE MMM dd HH:mm:ss yyyy");

        String outputDateStr = null;

        try {
            Date inputDate = inputDateFormat.parse(userPurchasedDateStr);
            outputDateStr = outputDateFormat.format(inputDate);
        } catch (ParseException e) {
            e.printStackTrace();
        }

        if (this.stockList != null) {
            Iterator<StockDetails> iterator = this.stockList.iterator();
            while (iterator.hasNext()) {
                StockDetails stockDetails = iterator.next();
                Stock s = stockDetails.getStockReference();
                String symbol = s.getStockSymbol();
                double currentStockPrice = stockDetails.getCurrentStockPrice();
                int qty = stockDetails.getQty();
                ZonedDateTime zdt =
                        ZonedDateTime.of(stockDetails.getPurchasedDateTime(),
                                ZoneOffset.UTC);
                DateTimeFormatter formatter =
                        DateTimeFormatter.ofPattern("EEE MMM dd HH:mm:ss yyyy");
                String purchasedDateTime =
                        String.valueOf(zdt.format(formatter));

                if (symbol.equals(userStockSymbol)
                        && currentStockPrice == userStockPrice && qty == userQty
                        && purchasedDateTime.equals(outputDateStr)) {
                    iterator.remove();
                }
            }
        }
        calculateHistoricalPrice(portfolioRepository,
                stockRepo, historicalPricePortfolioRepo);

        // calc the new values and assigning to the portfolio
        this.sectorAllocated = calculateSectorAllocated(stockRepo);
        this.capitalAllocated = calculateCapitalAllocated(stockRepo);
        this.percentAllocated = calculatePercentAllocated(stockRepo);
        this.industryAllocated = calculateIndustryAllocated(stockRepo);
        this.countryAllocated = calculateCountryAllocated(stockRepo);

    }

    /**
     * Calculates the allocation of stocks based on their sectors
     * and returns a map where keys represent sectors
     * and values represent the percentage of allocation.
     *
     * @param stockRepo The repository for accessing stock data.
     * @return A map containing sector allocations,
     * with sectors as keys and allocation percentages as values.
     */
    public Map<String, Double> calculateSectorAllocated(
            final StockRepo stockRepo) {

        Map<String, Double> sectorAllocations = new HashMap<>();

        int totalQuantity = 0;

        for (StockDetails stockData : stockList) {
            Stock s = stockData.getStockReference();
            Integer qty = stockData.getQty();

            if (s != null) {
                totalQuantity += qty;
                String sector = s.getSector();
                sectorAllocations.put(sector,
                        sectorAllocations.getOrDefault(sector,
                                0.0) + qty);
            }
        }

        for (Map.Entry<String, Double> entry : sectorAllocations.entrySet()) {
            String sector = entry.getKey();
            Double qty = entry.getValue();
            double percentage =
                    Math.round(((qty / totalQuantity) * 100) * 100) / 100.0;
            sectorAllocations.put(sector, percentage);
        }

        return sectorAllocations;
    }

    /**
     * Calculates the allocation of stocks based on their countries
     * and returns a map where keys represent countries
     * and values represent the percentage of allocation.
     *
     * @param stockRepo The repository for accessing stock data.
     * @return A map containing country allocations,
     * with countries as keys and allocation percentages as values.
     */
    public Map<String, Double> calculateCountryAllocated(
            final StockRepo stockRepo) {
        Map<String, Double> countryAllocations = new HashMap<>();

        int totalQuantity = 0;

        for (StockDetails stockData : stockList) {
            Stock s = stockData.getStockReference();
            Integer qty = stockData.getQty();

            if (s != null) {
                totalQuantity += qty;
                String country = s.getCountry();
                countryAllocations.put(country,
                        countryAllocations.getOrDefault(country,
                                0.0) + qty);
            }
        }

        for (Map.Entry<String, Double> entry : countryAllocations.entrySet()) {
            String sector = entry.getKey();
            Double qty = entry.getValue();
            double percentage =
                    Math.round(((qty / totalQuantity) * 100) * 100) / 100.0;
            countryAllocations.put(sector, percentage);
        }

        return countryAllocations;
    }

    /**
     * Calculates the allocation of stocks based on their stock symbols
     * and returns a map where keys represent stock symbols
     * and values represent the percentage of allocation.
     *
     * @param stockRepo The repository for accessing stock data.
     * @return A map containing stock symbol allocations,
     * with symbols as keys and allocation percentages as values.
     */
    public Map<String, Double> calculatePercentAllocated(
            final StockRepo stockRepo) {
        Map<String, Double> percentAllocations = new HashMap<>();

        double totalAmt = 0;

        for (StockDetails stockData : stockList) {
            Stock s = stockData.getStockReference();
            Integer qty = stockData.getQty();
            String stockSymbol = s.getStockSymbol();

            if (s != null) {
                double currentStockPrice = s.getCurrentStockPrice();
                double stockAmt = currentStockPrice * qty;
                totalAmt += stockAmt;
                percentAllocations.put(stockSymbol,
                        percentAllocations.getOrDefault(stockSymbol,
                                0.0) + stockAmt);
            }

        }

        for (Map.Entry<String, Double> entry : percentAllocations.entrySet()) {
            String sector = entry.getKey();
            Double stockAmt = entry.getValue();
            double percentage =
                    Math.round(((stockAmt / totalAmt) * 100) * 100) / 100.0;
            percentAllocations.put(sector, percentage);
        }
        this.percentAllocated = percentAllocations;
        return percentAllocations;
    }

    /**
     * Calculates the allocation of stocks based on their industries
     * and returns a map where keys represent industries
     * and values represent the percentage of allocation.
     *
     * @param stockRepo The repository for accessing stock data.
     * @return A map containing industry allocations,
     * with industries as keys and allocation percentages as values.
     */
    public Map<String, Double> calculateIndustryAllocated(
            final StockRepo stockRepo) {
        Map<String, Double> industryAllocations = new HashMap<>();

        int totalQuantity = 0;

        for (StockDetails stockData : stockList) {
            Stock s = stockData.getStockReference();
            Integer qty = stockData.getQty();

            if (s != null) {
                totalQuantity += qty;
                // find country
                String country = s.getIndustry();
                industryAllocations.put(country,
                        industryAllocations.getOrDefault(country,
                                0.0) + qty);
            }
        }

        for (Map.Entry<String, Double> entry : industryAllocations.entrySet()) {
            String sector = entry.getKey();
            Double qty = entry.getValue();
            double percentage =
                    Math.round(((qty / totalQuantity) * 100) * 100) / 100.0;
            industryAllocations.put(sector, percentage);
        }
        return industryAllocations;
    }

    /**
     * Calculates the capital allocated to each stock
     * in the portfolio based on the current stock prices
     * and quantities.
     *
     * @param stockRepo A reference to the StockRepo for stock data.
     * @return A map of stock symbols and
     * the percentage of the total capital allocated to each stock.
     */
    public Map<String, Double> calculateCapitalAllocated(
            final StockRepo stockRepo) {
        Map<String, Double> capitalAllocations = new HashMap<>();
        double totalCapitalAmount = 0;

        for (StockDetails stockData : stockList) {
            Stock s = stockData.getStockReference();
            Integer qty = stockData.getQty();
            String stockSymbol = s.getStockSymbol();

            if (s != null) {
                double currentStockPrice = s.getCurrentStockPrice();
                totalCapitalAmount += qty * currentStockPrice;
                capitalAllocations.put(
                        stockSymbol,
                        capitalAllocations.getOrDefault(stockSymbol, 0.0)
                                + (qty * currentStockPrice));
            }
        }

        for (Map.Entry<String, Double> entry : capitalAllocations.entrySet()) {
            String stockSymbol = entry.getKey();
            Double amount = entry.getValue();
            double percentage =
                    Math.round(((amount / totalCapitalAmount) * 100) * 100)
                            / 100.0;
            capitalAllocations.put(stockSymbol, percentage);
        }
        return capitalAllocations;
    }

    /**
     * Deletes the historical price information of the portfolio.
     *
     * @param historicalPricePortfolioRepo Repository for historical price data.
     */
    public void deleteHistoricalPortfolioPrice(
            final HistoricalPricePortfolioRepo historicalPricePortfolioRepo) {
        if (this.historicalPricePortfolio != null) {
            historicalPricePortfolioRepo.delete(this.historicalPricePortfolio);
            this.historicalPricePortfolio = null;
        }
    }

    /**
     * Calculates the historical price of the portfolio
     * based on the weighted contributions of each stock.
     *
     * @param pRepository        Repository for portfolio data.
     * @param sRepo                 Repository for stock data.
     * @param historicalPricePortfolioRepo Repository for historical price data.
     */
    public void calculateHistoricalPrice(final PortfolioRepo pRepository,
                                         final StockRepo sRepo,
                                         final HistoricalPricePortfolioRepo
                                                 historicalPricePortfolioRepo) {
        // using the weights of each stock,
        // calculate the historical price of the
        // portfolio

        Map<String, Double> percentAllocation =
                calculatePercentAllocated(sRepo);

        ArrayList<Stock> stockArr = new ArrayList<>();
        // preload all the historical prices to reduce I/O
        Map<String, HistoricalPriceStock> historicalPrices = new HashMap<>();

        for (String stockSymbol : percentAllocation.keySet()) {
            Stock s = sRepo.findStockByStockSymbol(stockSymbol);
            stockArr.add(s);
            historicalPrices.put(stockSymbol, s.getHistoricalStockPrice());
        }

        Set<String> uniqueDatesDaily = new HashSet<>();
        Set<String> uniqueDatesMonthly = new HashSet<>();

        for (Map.Entry<String, HistoricalPriceStock> entry
                : historicalPrices.entrySet()) {
            Set<String> datesDaily =
                    entry.getValue().getDatePriceDailyMap().keySet();
            uniqueDatesDaily.addAll(datesDaily);
            Set<String> datesMonthly =
                    entry.getValue().getDatePriceMonthlyMap().keySet();
            uniqueDatesMonthly.addAll(datesMonthly);
        }

        Map<String, Double> datePriceDailyMap = new HashMap<>();
        Map<String, Double> datePriceMonthlyMap = new HashMap<>();

        for (String d : uniqueDatesDaily) {
            double total = 0.0;
            boolean hasDate = true;
            for (Stock s : stockArr) {
                HistoricalPriceStock historicalStockPrice =
                        historicalPrices.get(s.getStockSymbol());
                if
                (historicalStockPrice.getDatePriceDailyMap().containsKey(d)) {
                    total +=
                            historicalStockPrice.getDatePriceDailyMap().get(d)
                            * (percentAllocation.get(s.getStockSymbol()) / 100);
                } else {
                    hasDate = false;
                    break;
                }
            }
            if (hasDate) {
                datePriceDailyMap.put(d, total);
            }
        }

        for (String d : uniqueDatesMonthly) {
            double total = 0.0;
            boolean hasDate = true;
            for (Stock s : stockArr) {
                HistoricalPriceStock historicalStockPrice =
                        historicalPrices.get(s.getStockSymbol());
                if
                (historicalStockPrice.getDatePriceMonthlyMap().containsKey(d)) {
                    total +=
                            historicalStockPrice.getDatePriceMonthlyMap().get(d)
                            * (percentAllocation.get(s.getStockSymbol()) / 100);
                } else {
                    hasDate = false;
                    break;
                }
            }
            if (hasDate) {
                datePriceMonthlyMap.put(d, total);
            }
        }

        HistoricalPricePortfolio output = new HistoricalPricePortfolio();
        output.setDatePriceDailyMap(datePriceDailyMap);
        output.setDatePriceMonthlyMap(datePriceMonthlyMap);

        // delete the old historical price if it exists in the db
        this.deleteHistoricalPortfolioPrice(historicalPricePortfolioRepo);

        this.historicalPricePortfolio = output;

        this.runStatisticsCalculations();

        historicalPricePortfolioRepo.save(output);
        pRepository.save(this);
    }

    /**
     * Runs statistical calculations for the portfolio,
     * including annual returns and volatility.
     *
     * @return A message indicating that statistics calculations
     * have been completed.
     */
    public String runStatisticsCalculations() {

        HistoricalPrice hp = this.historicalPricePortfolio;

        this.annualReturn = hp.calculateAnnualReturn();
        this.annualizedReturn = hp.calculateAnnualizedReturns();
        this.annualizedVolatilityMonths =
                hp.calculateAnnualizedVolatility("months");
        this.annualizedVolatilityDays =
                hp.calculateAnnualizedVolatility("days");

        return "Statistics Calculations Completed";
    }

    /**
     * Calculates the suggested rebalanced quantities for each stock
     * to maintain the desired portfolio allocation.
     *
     * @param stockRepo A reference to the StockRepo for stock data.
     * @return A map of stock symbols and their suggested rebalanced quantities.
     */
    public Map<String, Integer> rebalancedPortfolio(
            final StockRepo stockRepo) {
        // takes the current qty of each stock in the portfolio
        // calculates the new portfolio price = qty x currentStockPrice
        // Amount of $ each stock should have to maintain the
        // % (AmtAllocated) = new portfolio price x percent allocated
        // Qty = Amount of $ / currentStockPrice

        Map<String, Integer> rebalanced = new HashMap<>();
        Map<String, Double> percentAllocate = this.percentAllocated;
        double newPortfolioPrice = 0.0;

        // loop through the stocks array
        for (StockDetails stockData : stockList) {
            Stock s = stockData.getStockReference();
            Integer qty = stockData.getQty();

            if (s != null) {
                double currentStockPrice = s.getCurrentStockPrice();
                newPortfolioPrice += qty * currentStockPrice;
            }
        }
        for (Map.Entry<String, Double> entry : percentAllocate.entrySet()) {
            String stockSymbol = entry.getKey();
            Double allocationPercentage = entry.getValue();

            Stock s = stockRepo.findStockByStockSymbol(stockSymbol);

            if (s != null) {
                double currentStockPrice = s.getCurrentStockPrice();
                double amountAllocated =
                        newPortfolioPrice * (allocationPercentage / 100);
                int qtyAfterReBalancing =
                        (int) Math.round((amountAllocated / currentStockPrice));
                rebalanced.put(stockSymbol, qtyAfterReBalancing);
            }
        }
        // returns a dict of stocks and its suggested qty
        // to maintain the ratio
        return rebalanced;
    }

}
