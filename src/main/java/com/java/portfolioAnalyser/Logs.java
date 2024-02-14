package com.java.portfolioAnalyser;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Represents a log entry in the application.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "logs")
public class Logs {
    /** The unique identifier for the log entry. */
    @Id
    private String id;

    /** The date and time when the log entry was created.*/
    private LocalDateTime logDateTime;

    /** The portfolio ID associated with the log entry. */
    private String portfolioID;

    /** A list of added stock information in the log entry. */
    private List<Map<String, Object>> addedStock;

    /** A list of removed stock information in the log entry. */
    private List<Map<String, Object>> removedStock;

    /** The capital amount associated with the log entry. */
    private double capitalAmount;

    /** The user ID of the user who generated the log entry. */
    private String userID;

    /**
     * Constructs a new Logs object with the specified log entry details.
     *
     * @param logDateTime    The date and time of the log entry.
     * @param portfolioID    The portfolio ID associated with the log entry.
     * @param addedStock     A list of added stock information.
     * @param removedStock   A list of removed stock information.
     * @param capitalAmount  The capital amount associated with the log entry.
     * @param userID         The userID of the user.
     */
    public Logs(final LocalDateTime logDateTime,
                final String portfolioID,
                final List<Map<String, Object>> addedStock,
                final List<Map<String, Object>> removedStock,
                final double capitalAmount,
                final String userID) {
        this.logDateTime = logDateTime;
        this.portfolioID = portfolioID;
        this.addedStock = addedStock;
        this.removedStock = removedStock;
        this.capitalAmount = capitalAmount;
        this.userID = userID;
    }
}
