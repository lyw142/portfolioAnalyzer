package com.java.portfolioAnalyser;

import org.springframework.data.mongodb.core.mapping.Document;

/** MongoDB Document for Historical Price Stock. */
@Document(collection = "historicalPriceStock")
public class HistoricalPriceStock extends HistoricalPrice { }
