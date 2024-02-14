package com.java.portfolioAnalyser;

import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.springframework.stereotype.Component;

import org.springframework.beans.factory.annotation.Value;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.time.LocalDate;
import java.util.Dictionary;
import java.util.Hashtable;
import java.util.TreeMap;

/**
 * Class to call the AlphaVantage API to retrieve stock data.
 */
@Component
public class AlphaVantage {
    /** API key for AlphaVantage API. */
    @Value("${alphavantage.api.key}")
    private String API_KEY;

    /** Base url for AlphaVantage API. */
    private static final String BASE_URL = "https://www.alphavantage.co/query?";

    /** Function to get daily time series from AlphaVantage API. */
    private static final String FUNCTION_TIME_SERIES_DAILY =
        "TIME_SERIES_DAILY";

    /** Function to get monthly time series from AlphaVantage API. */
    private static final String TIME_SERIES_MONTHLY_ADJUSTED =
        "TIME_SERIES_MONTHLY_ADJUSTED";

    /** Function to get company details from AlphaVantage API. */
    private static final String FUNCTION_OVERVIEW = "OVERVIEW";

    /** Error message when API limit is exceeded. */
    private static final String EXCEED_API_MESSAGE =
        "Thank you for using Alpha Vantage! Our standard API rate limit is "
        + "25 requests per day. Please subscribe "
        + "to any of the premium plans at "
        + "https://www.alphavantage.co/premium/ to instantly remove all "
        + "daily rate limits.";

    /**
     * calls the AlphaVantage API to retrieve the close price for each day.
     *
     * @param symbol Stock symbol
     * @return TreeMap of LocalDate and adjusted close price for each day
     * @throws ApiErrorException if API limit is exceeded
     *                           or IOException | ParseException
     */
    public TreeMap<LocalDate, Double>
        getTimeSeriesDaily(final String symbol) throws ApiErrorException {
        try {
            String urlStr = buildApiUrl(FUNCTION_TIME_SERIES_DAILY, symbol);
            String jsonResponse = sendGetRequest(urlStr);
            JSONParser parser = new JSONParser();
            JSONObject jsonData = (JSONObject) parser.parse(jsonResponse);

            if (jsonData.containsKey("Information")
                && jsonData.get("Information").equals(EXCEED_API_MESSAGE)) {
                throw new ApiErrorException("Error retrieving data from API "
                        + "in getTimeSeriesDaily; exceeded API limit");
            }

            String timeSeriesKey = "Time Series (Daily)";
            JSONObject timeSeries = (JSONObject) jsonData.get(timeSeriesKey);
            if (timeSeries == null || timeSeries.isEmpty()) {
                throw new ApiErrorException(
                        "Error retrieving data from API in getTimeSeriesDaily"
                        + "; timeSeries is null or empty");
            }

            // JSON object keys from api are strings
            @SuppressWarnings("unchecked")
            Iterable<String> keys = timeSeries.keySet();
            TreeMap<LocalDate, Double> closeValue = new TreeMap<>();

            for (String key : keys) {
                JSONObject value = (JSONObject) timeSeries.get(key);
                LocalDate date = LocalDate.parse(key);
                String closeStr = (String) value.get("4. close");
                Double adjustedClose = Double.parseDouble(closeStr);
                closeValue.put(date, adjustedClose);
            }

            return closeValue;
        } catch (IOException | ParseException e) {
            throw new ApiErrorException(
                    "Error retrieving data from API in getTimeSeriesDaily"
                    + "; IOException | ParseException");
        }
    }

    /**
     * calls the AlphaVantage API to retrieve the adjusted close price for each
     * month.
     *
     * @param symbol Stock symbol
     * @return TreeMap of LocalDate and adjusted close price for each month
     * @throws ApiErrorException if API limit is exceeded
     *                           or IOException | ParseException
     */
    public TreeMap<LocalDate, Double>
        getTimeSeriesMonthlyAdjusted(final String symbol)
        throws ApiErrorException {

        try {
            String urlStr = buildApiUrl(TIME_SERIES_MONTHLY_ADJUSTED, symbol);
            String jsonResponse = sendGetRequest(urlStr);
            JSONObject jsonData;
            jsonData = (JSONObject) new JSONParser().parse(jsonResponse);

            if (jsonData.containsKey("Information")
                && jsonData.get("Information").equals(EXCEED_API_MESSAGE)) {
                throw new ApiErrorException(
                    "Error retrieving data from API in "
                    + "getTimeSeriesMonthlyAdjusted; "
                    + "exceeded API limit");
            }

            JSONObject timeSeries =
            (JSONObject) jsonData.get("Monthly Adjusted Time Series");

            if (timeSeries == null || timeSeries.isEmpty()) {
                throw new ApiErrorException(
                        "Error retrieving data from API in getTimeSeriesDaily"
                        + "; Monthly Adjusted Time Series is null or empty");
            }

            // JSON object keys from api are strings
            @SuppressWarnings("unchecked")
            Iterable<String> keys = timeSeries.keySet();
            TreeMap<LocalDate, Double> adjustedCloseValue = new TreeMap<>();

            for (String key : keys) {
                JSONObject value = (JSONObject) timeSeries.get(key);
                LocalDate date = LocalDate.parse(key);
                String adjustedCloseStr =
                (String) value.get("5. adjusted close");
                Double adjustedClose = Double.parseDouble(adjustedCloseStr);
                adjustedCloseValue.put(date, adjustedClose);
            }
            return adjustedCloseValue;
        } catch (IOException | ParseException e) {
            throw new ApiErrorException(
                "Error retrieving data from API in getTimeSeriesMonthlyAdjusted"
                + "; IOException | ParseException");
        }
    }

    /**
     * calls the AlphaVantage API to retrieve the company details of the given
     * stock.
     *
     * @param symbol Stock symbol
     * @return Dictionary of company details. Keys: companyName, companyDesc,
     *         country, sector, exchange, industry
     * @throws ApiErrorException if API limit is exceeded
     *         or IOException | ParseException
     */
    public Dictionary<String, String>
        getCompanyDetails(final String symbol) throws ApiErrorException {

        Dictionary<String, String> dict = new Hashtable<>();
        try {
            String urlStr = buildApiUrl(FUNCTION_OVERVIEW, symbol);

            String jsonResponse = sendGetRequest(urlStr);

            JSONObject jsonData;
            jsonData = (JSONObject) new JSONParser().parse(jsonResponse);

            if (jsonData.containsKey("Information")
                && jsonData.get("Information").equals(EXCEED_API_MESSAGE)) {
                throw new ApiErrorException("Error retrieving data from API in "
                                    + "getCompanyDetails; exceeded API limit");
            }

            if (jsonData.containsKey("Name")) {
                dict.put("companyName", (String) jsonData.get("Name"));
            }
            if (jsonData.containsKey("Description")) {
                dict.put("companyDesc", (String) jsonData.get("Description"));
            }
            if (jsonData.containsKey("Country")) {
                dict.put("country", (String) jsonData.get("Country"));
            }
            if (jsonData.containsKey("Sector")) {
                dict.put("sector", (String) jsonData.get("Sector"));
            }
            if (jsonData.containsKey("Exchange")) {
                dict.put("exchange", (String) jsonData.get("Exchange"));
            }
            if (jsonData.containsKey("Industry")) {
                dict.put("industry", (String) jsonData.get("Industry"));
            }

            return dict;

        } catch (IOException | ParseException e) {
            e.printStackTrace();
            throw new ApiErrorException("Error retrieving data from API in "
                        + "getCompanyDetails; IOException | ParseException");
        }
    }

    /**
     * builds the url for the AlphaVantage API call.
     *
     * @param symbol   Stock symbol
     * @param function Function to call from AlphaVantage API
     * @return String of the url
     */
    private String buildApiUrl(final String function, final String symbol) {
        String baseURL = BASE_URL + "function=";
        String functionPart = function + "&symbol=";
        String symbolPart = symbol + "&apikey=";
        return baseURL + functionPart + symbolPart + API_KEY;
    }

    /**
     * sends the HTTP GET request to the AlphaVantage API.
     *
     * @param urlStr URL to send the GET request to
     * @return String of the JSON response
     * @throws IOException if there is an error with the connection
     */
    private String sendGetRequest(final String urlStr) throws IOException {
        URL url = new URL(urlStr);
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
        connection.setRequestMethod("GET");

        try (
            BufferedReader reader = new BufferedReader(
                new InputStreamReader(
                    connection.getInputStream()
                )
            )
        ) {
            StringBuilder response = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                response.append(line);
            }
            return response.toString();
        }
    }
}
