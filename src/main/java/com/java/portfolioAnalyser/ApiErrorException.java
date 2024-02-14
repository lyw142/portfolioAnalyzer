package com.java.portfolioAnalyser;

/**
 * Exception thrown when there is an error with the API.
 */
public class ApiErrorException extends RuntimeException {
    /**
     * Constructs a new exception with the specified detail message.
     * @param message the detail message
     */
    public ApiErrorException(final String message) {
        super(message);
    }
}
