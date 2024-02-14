package com.java.portfolioAnalyser;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * REST controller for handling logs API requests.
 * It provides access to log information.
 */
@CrossOrigin(origins = "http://localhost:3000")
@RestController
public class LogsController {
    /** Repository for accessing log data in the database.*/
    private final LogsRepo logsRepo;

    /**
     * Constructs a new LogsController with the specified LogsRepo.
     *
     * @param logsRepo The repository for accessing log data in the database.
     */
    @Autowired
    public LogsController(final LogsRepo logsRepo) {
        this.logsRepo = logsRepo;
    }

    /**
     * Retrieves a list of all logs from the database.
     * @return A list of {@link Logs} objects
     * representing the logs retrieved from the database.
     */
    @GetMapping("/logs")
    public List<Logs> getAllLogs() {
        List<Logs> allLogs = logsRepo.findAll();
        return allLogs;
    }
}
