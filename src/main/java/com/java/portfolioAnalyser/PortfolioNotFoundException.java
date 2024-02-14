package com.java.portfolioAnalyser;

/**
 * Exception thrown when the portfolio is not found.
 */
public class PortfolioNotFoundException extends RuntimeException {
    /**
     * Constructs a new exception with the specified detail message.
     * @param message the detail message
     */
    public PortfolioNotFoundException(final String message) {
        super(message);
    }
}
