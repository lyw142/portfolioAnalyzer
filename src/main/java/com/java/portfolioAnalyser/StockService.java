package com.java.portfolioAnalyser;

import java.time.LocalDate;
import java.util.Dictionary;
import java.util.Map;
import java.util.TreeMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/** Service for Stock. Wrapper for API calls. */
@Service
public class StockService {
    /** AlphaVantage API wrapper. */
    private final AlphaVantage av;
    /** MongoDB Repository for Stock. */
    private final StockRepo stockRepo;
    /** MongoDB Repository for Historical Price Stock. */
    private final HistoricalPriceStockRepo historicalPriceStockRepo;

    /**
     * Constructor for StockService.
     *
     * @param av                        AlphaVantage API wrapper
     * @param stockRepo                 MongoDB Repository for Stock
     * @param historicalPriceStockRepo  MongoDB Repository for Historical Price
     *                                  Stock
     */
    @Autowired
    public StockService(AlphaVantage av,
                    StockRepo stockRepo,
                    HistoricalPriceStockRepo historicalPriceStockRepo) {
        this.av = av;
        this.stockRepo = stockRepo;
        this.historicalPriceStockRepo = historicalPriceStockRepo;
    }

    /**
     * Create a Stock and Historical Price from API.
     *
     * @param stockSymbol   stock symbol
     * @param exchangeInput exchange
     * @return String of message
     * @throws ApiErrorException if API call fails
     */
    public String createStockAndHistoricalPriceFromApi(String stockSymbol,
                                                       String exchangeInput)
            throws ApiErrorException {

        if (!exchangeInput.equals("NYSE") && !exchangeInput.equals("NASDAQ")
                && !stockSymbol.endsWith("." + exchangeInput)) {
            stockSymbol = stockSymbol + "." + exchangeInput;
        }

        Stock databaseStock = stockRepo.findStockByStockSymbol(stockSymbol);
        if (databaseStock != null) {
            return "Stock already exists in database";
        }

        TreeMap<LocalDate, Double> timeSeriesDaily;
        TreeMap<LocalDate, Double> timeSeriesMonthly;
        Dictionary<String, String> companyDetails;

        // err from av are propagated up to controller
        timeSeriesDaily = av.getTimeSeriesDaily(stockSymbol);
        timeSeriesMonthly = av.getTimeSeriesMonthlyAdjusted(stockSymbol);
        companyDetails = av.getCompanyDetails(stockSymbol);

        TreeMap<String, Double> timeSeriesDailyString = new TreeMap<>();
        TreeMap<String, Double> timeSeriesMonthlyString = new TreeMap<>();
        // Convert LocalDate to String
        for (Map.Entry<LocalDate, Double> entry
            : timeSeriesDaily.entrySet()) {
            timeSeriesDailyString
            .put(entry.getKey().toString(), entry.getValue());
        }
        for (Map.Entry<LocalDate, Double> entry
            : timeSeriesMonthly.entrySet()) {
            timeSeriesMonthlyString
            .put(entry.getKey().toString(), entry.getValue());
        }

        String stockName = companyDetails.get("companyName");
        String stockDescription = companyDetails.get("companyDesc");
        String country = companyDetails.get("country");
        String sector = companyDetails.get("sector");
        String exchange = companyDetails.get("exchange");
        String industry = companyDetails.get("industry");

        Stock s = new Stock(stockSymbol);
        s.setStockName(stockName);
        s.setStockDescription(stockDescription);
        s.setCountry(country);
        s.setSector(sector);
        s.setExchange(exchange);
        s.setIndustry(industry);
        s.setLatestDateRetrieved(LocalDate.now().toString());

        HistoricalPriceStock historicalPrice = new HistoricalPriceStock();
        historicalPrice.setDatePriceDailyMap(timeSeriesDailyString);
        historicalPrice.setDatePriceMonthlyMap(timeSeriesMonthlyString);

        s.setHistoricalStockPrice(historicalPrice);

        s.runStatisticsCalculations();

        historicalPriceStockRepo.save(historicalPrice);
        stockRepo.save(s);
        return "Stock and Historical Price added successfully";
    }

    /**
     * Update the Historical Price of a Stock from API. If latest trading day
     * from API is the same as the latest trading day in the database, then the
     * Historical Price is not updated. If the latest trading day from API is
     * different from the latest trading day in the database, then Historical
     * Price is updated.
     *
     * @param stock Stock
     * @return String of message
     * @throws ApiErrorException if API call fails
     */
    public String updateHistoricalPrice(Stock stock) throws ApiErrorException {

        String todayString = LocalDate.now().toString();
        if (stock.getLatestDateRetrieved().equals(todayString)) {
            return "Historical Price has been retrieved today";
        }

        TreeMap<LocalDate, Double> timeSeriesDailyAPI;

        timeSeriesDailyAPI = av.getTimeSeriesDaily(stock.getStockSymbol());

        TreeMap<String, Double> timeSeriesDailyAPIString = new TreeMap<>();
        for (Map.Entry<LocalDate, Double> entry
            : timeSeriesDailyAPI.entrySet()) {

            timeSeriesDailyAPIString
            .put(entry.getKey().toString(), entry.getValue());
        }

        if (stock.getLatestTradingDay()
            .equals(timeSeriesDailyAPIString.lastKey())) {
            stock.setLatestDateRetrieved(todayString);
            stockRepo.save(stock);
            return "Daily Historical Price already up to date, "
                    + "no need to check monthly";
        }

        HistoricalPriceStock historicalPrice = stock.getHistoricalStockPrice();
        TreeMap<String, Double> dbTimeSeriesDaily =
        new TreeMap<>(historicalPrice.getDatePriceDailyMap());

        for (Map.Entry<String, Double> entry
            : timeSeriesDailyAPIString.descendingMap().entrySet()) {
            String newDate = entry.getKey();
            if (!dbTimeSeriesDaily.containsKey(newDate)) {
                dbTimeSeriesDaily.put(newDate, entry.getValue());
            } else {
                break;
            }
        }

        historicalPrice.setDatePriceDailyMap(dbTimeSeriesDaily);

        TreeMap<String, Double> dbTimeSeriesMonthly =
        new TreeMap<>(historicalPrice.getDatePriceMonthlyMap());

        // 2021-01-01 -> 2021-01
        String lastMonthYrInDB = dbTimeSeriesMonthly.lastKey().substring(0, 7);
        String todayMonthYr = todayString.substring(0, 7);

        // if Monthly Historical price is not up to date
        if (!lastMonthYrInDB.equals(todayMonthYr)) {
            TreeMap<LocalDate, Double> timeSeriesMonthlyAPI;
            TreeMap<String, Double> timeSeriesMonthlyAPIString =
            new TreeMap<>();

            timeSeriesMonthlyAPI =
            av.getTimeSeriesMonthlyAdjusted(stock.getStockSymbol());

            for (Map.Entry<LocalDate, Double> entry
                : timeSeriesMonthlyAPI.entrySet()) {

                timeSeriesMonthlyAPIString
                .put(entry.getKey().toString(), entry.getValue());
            }

            // del last entry in db of month as it is not the latest
            dbTimeSeriesMonthly.remove(dbTimeSeriesMonthly.lastKey());

            for (Map.Entry<String, Double> entry
                : timeSeriesMonthlyAPIString.descendingMap().entrySet()) {
                String newDate = entry.getKey();
                if (!dbTimeSeriesMonthly.containsKey(newDate)) {
                    dbTimeSeriesMonthly.put(newDate, entry.getValue());
                } else {
                    break;
                }
            }
            historicalPrice.setDatePriceMonthlyMap(dbTimeSeriesMonthly);
        }

        stock.setLatestDateRetrieved(todayString);
        stock.runStatisticsCalculations();
        historicalPriceStockRepo.save(historicalPrice);
        stockRepo.save(stock);
        return "Historical Price updated successfully";
    }
}
