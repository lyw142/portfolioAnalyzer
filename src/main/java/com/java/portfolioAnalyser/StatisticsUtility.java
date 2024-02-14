package com.java.portfolioAnalyser;

/**
 * Utility class for statistics.
 */
public class StatisticsUtility {

    /**
     * Private constructor to prevent instantiation.
     */
    private StatisticsUtility() {
        throw new IllegalStateException("Utility class");
    }

    /**
     * Mean is the average of the numbers.
     * @param data array of doubles
     * @return mean
     */
    public static double calculateMean(final Double[] data) {
        double sum = 0.0;
        for (double a : data) {
            sum += a;
        }
        return sum / data.length;
    }

    /**
     * Variance is the average of squared deviations.
     * @param data array of doubles
     * @return variance
     */
    public static double calculateVariance(final Double[] data) {
        double mean = calculateMean(data);
        double temp = 0;
        for (double a : data) {
            temp += (a - mean) * (a - mean);
        }
        return temp / (data.length - 1);
    }

    /**
     * Standard deviation is square root of variance.
     * @param data array of doubles
     * @return standard deviation
     */
    public static double calculateStdDev(final Double[] data) {
        return Math.sqrt(calculateVariance(data));
    }
}
