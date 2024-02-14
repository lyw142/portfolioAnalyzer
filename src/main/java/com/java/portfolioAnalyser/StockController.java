package com.java.portfolioAnalyser;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;
import java.util.Map;

/**
 * This class is a REST controller for handling stock-related API requests.
 * It provides methods for managing stocks and retrieving historical price data.
 */
@CrossOrigin(origins = "http://localhost:3000")
@RestController
public class StockController {

    /** Repository for accessing stock data in the database. */
    @Autowired
    private StockRepo repo;

    /** Service for accessing stock data from the API. */
    @Autowired
    private StockService stockService;

    /**
     * Retrieves and returns a list of all stocks from the repository.
     * This endpoint handles HTTP GET requests to retrieve all stock records.
     *
     * @return A {@link List} of {@link Stock} objects representing the
     * stocks retrieved from the database.
     */
    @GetMapping("/findAllStocks")
    public List<Stock> getStocks() {
        return repo.findAll();
    }

    /**
     * Retrieves a stock from the database with the specified stockSymbol.
     * stock price updated here in this method with updateHistoricalPrice
     *
     * @param stockSymbol The stockSymbol of the stock to retrieve.
     * @return A {@link Stock} object representing the
     * stock retrieved from the database.
     */
    @GetMapping("/findStockByStockSymbol/{stockSymbol}")
    public Stock getStockByID(@PathVariable String stockSymbol) {
        Stock stock = repo.findStockByStockSymbol(stockSymbol);
        if (stock == null) {
            return null;
        }
        try {
            stockService.updateHistoricalPrice(stock);
        } catch (ApiErrorException e) {
            // unable to update, return stock without historical price
        }
        return stock;
    }

    /**
     * Generates a new stock and historical price from the API.
     * Stores it in the database.
     *
     * @param payload A map containing stock information,
     *                including "stockSymbol" and "exchange".
     * @return A {@link String}
     *  object representing the message of the result of the operation.
     *  200 if successful,
     *  400 if stock already exist in the database or api error.
     */
    @PostMapping("/newStock")
    public ResponseEntity<String>
        newStock(@RequestBody Map<String, Object> payload) {

        String stockSymbol = (String) payload.get("stockSymbol");
        String exchange = (String) payload.get("exchange");
        try {
            String message = stockService
            .createStockAndHistoricalPriceFromApi(stockSymbol, exchange);

            if (message.equals("Stock already exists in database")) {
                return ResponseEntity.badRequest().body(message);
            }
            return ResponseEntity.ok(message);
        } catch (ApiErrorException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
