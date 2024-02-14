package com.java.portfolioAnalyser;

import java.time.LocalDate;
import java.time.Month;
import java.time.Year;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.SortedMap;
import java.util.TreeMap;

import org.springframework.data.annotation.Id;

import lombok.Data;

/**
 * HistoricalPrice class that represents a historical price.
 */
@Data
public abstract class HistoricalPrice {
    /** Historical price ID. */
    @Id
    private String id;

    /**
     * Historical prices. Interval in Days.
     * Date in String, Price in Double
    */
    private Map<String, Double> datePriceDailyMap = new HashMap<>();

    /**
     * Historical prices. Interval in Months.
     * Date in String, Price in Double
    */
    private Map<String, Double> datePriceMonthlyMap = new HashMap<>();

    /**
     * Get the latest trading day.
     * Latest trading day is the last element in the array.
     * @return the latest trading day
     */
    public String getLatestTradingDay() {
        Set<String> keySet = this.datePriceDailyMap.keySet();
        return (String) keySet.toArray()[this.datePriceDailyMap.size() - 1];
    }

    /**
     * Get the price in the latest trading day.
     * @return the price of the latest trading day
     */
    public Double getCurrentStockPrice() {
        return this.datePriceDailyMap.get(this.getLatestTradingDay());
    }

    /**
     * Reformat historical returns from String to LocalDate and Sort by date.
     * @param historicalReturns historical returns in String
     * @return historical returns in LocalDate, sorted by date
     */
    public TreeMap<LocalDate, Double>
        formatStringTreeMap(final Map<String, Double> historicalReturns) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        TreeMap<LocalDate, Double> formattedReturns = new TreeMap<>();
        for (Map.Entry<String, Double> entry : historicalReturns.entrySet()) {
            LocalDate date = LocalDate.parse(entry.getKey(), formatter);
            formattedReturns.put(date, entry.getValue());
        }
        return formattedReturns;
    }

    /**
     * Calculate the annual year-on-year returns.
     * @return the annual year-on-year returns in percentage
     */
    public TreeMap<String, Double> calculateAnnualReturn() {
        TreeMap<LocalDate, Double> formattedReturns;
        formattedReturns = formatStringTreeMap(this.datePriceMonthlyMap);
        TreeMap<String, Double> annualReturn = new TreeMap<>();
        Double previousReturns = 1.0;
        for (Map.Entry<LocalDate, Double> entry : formattedReturns.entrySet()) {
            String year = Year.of(entry.getKey().getYear()).toString();
            Month month = Month.of(entry.getKey().getMonthValue());
            if (month == Month.DECEMBER) {
                double newReturn = entry.getValue() - previousReturns;
                newReturn /= previousReturns;
                newReturn *= 100;
                annualReturn.put(year, newReturn);
                previousReturns = entry.getValue();
            }
        }
        // remove first year because its wrong
        annualReturn.remove(annualReturn.keySet().toArray()[0]);
        return annualReturn;
    }

    /**
     * Calculate the annualized returns of the historical returns.
     * @return the annualized returns of the historical returns
     */
    public TreeMap<String, Double> calculateAnnualizedReturns() {
        // Sort the returns by date in descending order
        SortedMap<LocalDate, Double> sortedReturns;
        sortedReturns = formatStringTreeMap(this.datePriceMonthlyMap);
        sortedReturns = new TreeMap<>(sortedReturns).descendingMap();

        // Get the first entry to determine the start date and value
        Map.Entry<LocalDate, Double> firstEntry;
        firstEntry = sortedReturns.entrySet().iterator().next();
        LocalDate startDate = firstEntry.getKey();
        Double startValue = firstEntry.getValue();

        TreeMap<String, Double> annualizedReturns = new TreeMap<>();
        int[] periods = {1, 3, 5, 10 };

        for (int period : periods) {
            LocalDate endDate = startDate.minusYears(period);
            Map.Entry<LocalDate, Double> endEntry = null;
            for (Map.Entry<LocalDate, Double> entry
                        : sortedReturns.entrySet()) {
                if (!entry.getKey().isAfter(endDate)) {
                    endEntry = entry;
                    break;
                }
            }
            if (endEntry != null) {
                double ratio = startValue / endEntry.getValue();
                double annualizedReturn = Math.pow(ratio, 1.0 / period) - 1;
                annualizedReturns.put(period + " Year", annualizedReturn * 100);
            }
        }
        return annualizedReturns;
    }

    /**
     * Calculate the annualized volatility of the historical returns.
     * @param periodType period type, either "days" or "months"
     * @return the annualized volatility of the historical returns
     */
    public TreeMap<String, Double>
        calculateAnnualizedVolatility(final String periodType) {

        // periodType = "days" or "months" from TimeSeriesMonthlyAdjusted or
        // TimeSeriesDaily
        // Sort the returns by date in descending order (most recent first)

        Map<String, Double> returns = this.datePriceMonthlyMap;
        if (periodType.equals("days")) {
            returns = this.datePriceDailyMap;
        }
        SortedMap<LocalDate, Double> sortedReturns;
        sortedReturns = formatStringTreeMap(returns);
        sortedReturns = new TreeMap<>(sortedReturns).descendingMap();

        List<Double> lnReturns = new ArrayList<>();
        List<Map.Entry<LocalDate, Double>> entries;
        entries = new ArrayList<>(sortedReturns.entrySet());

        for (int i = 0; i < entries.size() - 1; i++) {
            Map.Entry<LocalDate, Double> currentEntry = entries.get(i);
            Map.Entry<LocalDate, Double> nextEntry = entries.get(i + 1);
            double divisor = nextEntry.getValue();
            double logReturn = Math.log(currentEntry.getValue() / divisor);
            lnReturns.add(logReturn);
        }

        TreeMap<String, Double> annualizedReturns = new TreeMap<>();

        // on average there are 252 trading days in a year
        // 21 trading days per month
        // 5 trading days per week

        // get volatility for
        // past 5, 10, 21, 21*2, 21*3, 21*6 days
        // else assume months
        // past 1, 2, 3, 5, 10 years

        int numPeriodsPerYear = 12;
        if (periodType.equals("days")) {
            numPeriodsPerYear = 252;
        }

        Map<String, Integer> periods = new TreeMap<>();
        if (periodType.equals("days")) {
            periods.put("1 week", 5);
            periods.put("2 weeks", 10);
            periods.put("1 month", 21);
            periods.put("2 months", 21 * 2);
            periods.put("3 months", 21 * 3);
            periods.put("6 months", 21 * 6);
        } else {
            periods.put("1 year", 12);
            periods.put("2 years", 12 * 2);
            periods.put("3 years", 12 * 3);
            periods.put("5 years", 12 * 5);
            periods.put("10 years", 12 * 10);
        }

        for (Map.Entry<String, Integer> entry : periods.entrySet()) {
            int period = entry.getValue();
            if (period > lnReturns.size()) {
                break;
            }
            Double[] slicedLnReturns = new Double[period];
            slicedLnReturns = lnReturns
                .subList(0, period)
                .toArray(slicedLnReturns);
            Double stdDev = StatisticsUtility.calculateStdDev(slicedLnReturns);
            double annualizedVolatility = stdDev * Math.sqrt(numPeriodsPerYear);
            annualizedReturns.put(entry.getKey(), annualizedVolatility * 100);
        }
        return annualizedReturns;
    }
}
