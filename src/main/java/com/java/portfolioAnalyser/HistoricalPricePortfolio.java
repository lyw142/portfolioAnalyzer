package com.java.portfolioAnalyser;

import java.time.LocalDate;
import java.util.Map;
import java.util.TreeMap;

import org.springframework.data.mongodb.core.mapping.Document;

/** MongoDB Document for Historical Price Portfolio. */
@Document(collection = "historicalPricePortfolio")
public class HistoricalPricePortfolio extends HistoricalPrice {

    /**
     * Calculate the percentage change of historical prices in the portfolio.
     *
     * @param timeInterval String of either "monthly" or "daily"
     * @return percentageChange TreeMap
     */
    public TreeMap<String, Double>
        calcuatePercentageChange(final String timeInterval) {
        TreeMap<String, Double> percentageChange;
        percentageChange = new TreeMap<String, Double>();
        TreeMap<LocalDate, Double> formattedReturns;
        if (timeInterval.equals("monthly")) {
            Map<String, Double> datePriceMap = super.getDatePriceMonthlyMap();
            formattedReturns = super.formatStringTreeMap(datePriceMap);
        } else if (timeInterval.equals("daily")) {
            Map<String, Double> datePriceMap = super.getDatePriceDailyMap();
            formattedReturns = super.formatStringTreeMap(datePriceMap);
        } else {
            throw new IllegalArgumentException(
                "timeInterval must be either monthly or daily");
        }
        // reverse formattedReturns so that the first date
        // is the first element in the array
        TreeMap<LocalDate, Double> reverseFormattedReturns;
        Map<LocalDate, Double> descendingMap = formattedReturns.descendingMap();
        reverseFormattedReturns = new TreeMap<>(descendingMap);
        Double firstValue = reverseFormattedReturns.firstEntry().getValue();
        for (LocalDate date : reverseFormattedReturns.keySet()) {
            Double percentage = firstValue - reverseFormattedReturns.get(date);
            percentage /= reverseFormattedReturns.get(date);
            percentage *= 100;

            percentageChange.put(date.toString(), percentage);
        }
        return percentageChange;
    }
}
