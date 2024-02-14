package com.java.portfolioAnalyser;

import org.springframework.beans.factory.annotation.Autowired;
// To bypass CORS Errors so that frontend can make non GET requests to backend
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Map;

/**
 * This class represents a REST controller for user-related API requests.
 * It provides methods for managing users and retrieving user data.
 */
@CrossOrigin(origins = "http://localhost:3000")
@RestController
public class UserController {
    /**
     * The User Repository used for accessing and managing user data.
     */
    @Autowired
    private UserRepo userRepo;

    /**
     * The Portfolio Repository used for accessing and managing portfolio data.
     */
    @Autowired
    private PortfolioRepo portRepo;

    /**
     * The Stock Repository used for accessing and managing stock data.
     */
    @Autowired
    private StockRepo stockRepo;

    /**
     * The Logs Repository used for logging and tracking application events.
     */
    @Autowired
    private LogsRepo logsRepo;

    /**
     * The Historical Price Repository used for retrieving historical price of
     * portfolio data.
     */
    @Autowired
    private HistoricalPricePortfolioRepo historicalPricePortfolioRepo;

    /**
     * Handles a POST request to add a new user.
     *
     * @param user The user object to be added to the system.
     * @return A ResponseEntity containing a String message indicating
     *         the result of the operation.
     */
    @PostMapping("/addUser")
    public ResponseEntity<String> addUser(@RequestBody final User user) {

        boolean validEmail;
        // Checks that Email is unique and
        // doesn't already exist in the database

        String email = user.getEmail();
        String password = user.getPassword();
        if (email.indexOf('@') == -1) {
            return ResponseEntity.badRequest()
                    .body("Failed to add. Invalid email format");
        }

        if (userRepo.findUserByEmail(email) != null) {
            validEmail = false; // Email already exists in the database
        } else {
            validEmail = true; // Email does not exist in the database
        }

        int firstPartIndex = email.indexOf('@');
        String userName = email.substring(0, firstPartIndex);
        user.setUserName(userName);

        // Checks if username is the same as the first
        // part of the email (i.e. before the @ symbol
        boolean validUserName = (userName.equals(user.getUserName()));

        // Checks if password matches the requirements
        boolean validPassword = User.isValidPassword(password);

        // Checks if email is in the correct format i.e.
        // contains @ symbol
        boolean validEmailFormat = User.isValidEmailAddress(email);

        boolean validEmailANDPassword = validEmail && validPassword
                && validEmailFormat && validUserName;

        if (validEmailANDPassword) {
            userRepo.save(user);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body("Added Successfully");

        } else {

            if (!validPassword) {

                return ResponseEntity.badRequest().body(
                        "Failed to add. Invalid password."
                                + "\nVALID PASSWORD RULES:"
                                + "\n1. It contains at least 8 characters and"
                                + " at most 20 characters."
                                + "\n2. It contains at least one digit."
                                + "\n3. It contains at least one upper "
                                + "case alphabet."
                                + "\n4. It contains at least one lower "
                                + "case alphabet."
                                + "\n5. It contains at least one special "
                                + "character which includes !@#$%&*()-+=^."
                                + "\n6. It doesn’t contain any white space.");

            } else if (!validEmail) {

                return ResponseEntity.badRequest().body(
                        "Failed to add. Email already exists");
            } else if (!validUserName) {

                return ResponseEntity.badRequest().body(
                        "Failed to add. Username must be the same "
                                + "as the first part "
                                + "of the email (i.e. before the @ symbol). "
                                + "Current Username received: "
                                + user.getUserName() + ". Email received: "
                                + user.getUserName() + ". Email received: "
                                + email);
            } else {
                return ResponseEntity.badRequest()
                        .body("Failed to add. Invalid email format");
            }
        }
    }

    /**
     * Handles a POST request to authenticate a user and log them in.
     *
     * @param credentials The login credentials provided by the user
     *                    (e.g., username and password).
     * @return A ResponseEntity containing a user-specific message
     *         indicating the result of the login attempt.
     */
    @PostMapping("/login")
    public ResponseEntity<String> authenticateUser(
            @RequestBody User credentials) {
        String email = credentials.getEmail();
        String password = credentials.getPassword();
        User user = userRepo.findUserByEmail(email);

        String role = "User";
        if (user != null) {
            if (user.getPassword().equals(password)) {
                if (user.getHasForgottenPassword()) {
                    // returns status code 202
                    return ResponseEntity.status(HttpStatus.ACCEPTED)
                            .body("Please reset your password");
                }

                if (user instanceof Admin) {
                    Admin adminUser = (Admin) user;
                    role = adminUser.getRole();
                }

                return ResponseEntity.ok(role + " Login Successful");

            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Incorrect Password");
            }
        } else {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("User does not exist");
        }
    }

    /**
     * Handles a PUT request to update the email address of a user.
     *
     * @param email    The current email address of the user to be updated.
     * @param newEmail The new email address to set for the user.
     * @return A ResponseEntity containing a String message indicating
     *         the result of the email update operation.
     */
    @PutMapping("/updateUserEmail/{email}") // Working version
    public ResponseEntity<String> updateUserEmail(
            @PathVariable String email,
            @RequestParam String newEmail) {
        // register UI is based on email, and username may not
        // be unique since it is generated from
        // taking the front part of the email

        User user = userRepo.findUserByEmail(email);

        int firstPartIndex = newEmail.indexOf('@');
        String userName = newEmail.substring(0, firstPartIndex);

        boolean userExists;
        if (userRepo.findUserByEmail(newEmail) != null) {
            userExists = true;

            // Returns 403 Forbidden with the visible error msg
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Email already exists. Choose another email "
                            + "or login with your existing account");
        } else {
            userExists = false;
        }

        // Checks if email is in the correct format
        boolean validEmailFormat = User.isValidEmailAddress(newEmail);
        if (!validEmailFormat) {

            // Returns 400 Bad Request with the visible error msg
            return ResponseEntity.badRequest().body(
                    "Invalid Email Format. Please enter a valid email address");
        }

        if (user != null && !userExists) {
            user.setEmail(newEmail);
            user.setUserName(userName);
            // Delete the unmodified user from the database
            // to prevent duplication.
            userRepo.deleteUserByEmail(email);
            // Save the updated user back to the database

            userRepo.save(user);

            return ResponseEntity
                    .ok("Email has been updated"); // Returns 200 OK
        }

        return ResponseEntity.badRequest()
                .body("Email has not been updated"); // Returns 400 Bad Request
    }

    /**
     * Handles a PUT request to change the password of a user.
     *
     * @param email       The email address of the user whose
     *                    password is to be changed.
     * @param credentials The user's new credentials, including
     *                    the updated password.
     * @return A ResponseEntity containing a String message
     *         indicating the result of
     *         the password change operation.
     */
    @PutMapping("/changeUserPassword/{email}")
    public ResponseEntity<String> changeUserPassword(
            @PathVariable String email,
            @RequestBody User credentials) {

        String newPassword = credentials.getPassword();
        // if isTempPassword in JSON is true,
        // then do not run user.passwordResetted();
        boolean isTempPassword = credentials.getHasForgottenPassword();

        User user = userRepo.findUserByEmail(email);
        // to reuse the code from addUser
        boolean validPassword = User.isValidPassword(newPassword);

        // user.setEmail(newEmail);
        if (validPassword) {
            user.setPassword(newPassword);
            user.passwordResetted();
            // Delete the unmodified user from the database
            // to prevent duplication.
            userRepo.deleteUserByEmail(email);
            // Save the updated user back to the database
            userRepo.save(user);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body("Added Successfully");
        } else if (!validPassword) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    "Failed to add. Invalid password."
                            + "\nVALID PASSWORD RULES:"
                            + "\n1. It contains at least 8 characters and"
                            + " at most 20 characters."
                            + "\n2. It contains at least one digit."
                            + "\n3. It contains at least one upper "
                            + "case alphabet."
                            + "\n4. It contains at least one lower "
                            + "case alphabet."
                            + "\n5. It contains at least one special "
                            + "character which includes !@#$%&*()-+=^."
                            + "\n6. It doesn’t contain any white space.");
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("unexpected error");
        }

    }

    /**
     * Handles a DELETE request to change the password of a user.
     *
     * @param email The email address of the user whose password
     *              is to bechanged.
     * @return A ResponseEntity containing a String message
     *         indicating the result of the password change operation.
     */
    @DeleteMapping("/deleteUserByEmail/{email}")
    public String deleteUserByEmail(@PathVariable String email) {
        User user = userRepo.findUserByEmail(email);
        if (user != null) {
            userRepo.deleteUserByEmail(email);
            return "Deleted Successfully";
        }
        return "User does not exist";
    }

    /**
     * Handles a DELETE request to change the password of a user.
     *
     * @param id The id of the user whose password is to be
     *           changed.
     * @return A ResponseEntity containing a String message
     *         indicating the result of the password change operation.
     */
    @DeleteMapping("/deleteUserByID/{id}")
    public String deleteUserById(@PathVariable String id) {
        userRepo.deleteUserByID(id);

        return "Deleted Successfully";
    }

    /**
     * Handles a PUT request to reset a user's password and send
     * a password reset email.
     * This function checks if the email exists in the database
     * and returns an error message on failure
     * It then creates a temporary password and changes the user
     * password to the temporary password
     * It sets the forgot varialbe to true
     * Sends an email to the given email address
     * containing the temporary password
     *
     * @param email The email address of the user requesting a password reset.
     * @return A ResponseEntity containing a message indicating the
     *         result of the password reset operation.
     */

    @PutMapping("/forgetPassword/{email}")
    public ResponseEntity<String> forgetPassword(@PathVariable String email) {
        boolean validEmail = (userRepo.findUserByEmail(email) != null);
        if (validEmail) {
            String newpassword = User.generateRandomPassword();

            User user = userRepo.findUserByEmail(email);
            // set isPasswordForgotten to true for frontend functionality
            user.forgottenPassword();
            user.setPassword(newpassword);
            userRepo.deleteUserByEmail(email);
            userRepo.save(user);
            // Error happens in this zone
            if (EmailService.sendPasswordEmail(email, newpassword)) {
                return ResponseEntity
                        .ok("Password reset email sent successfully");
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Email not sent");
            }
            // Error happens in this zone

        } else {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("User does not exist"); //
        }

    }

    /**
     * Handles a GET request to retrieve a list of all users.
     *
     * @return A list of User objects representing all users in the system.
     */
    @GetMapping("/findAllUsers")
    public List<User> getUsers() {
        return userRepo.findAll();
    }

    /**
     * Handles a GET request to retrieve a user by their unique identifier
     * (MongoID).
     * For testing purposes only, not part of the UML.
     *
     * @param id The unique identifier (MongoID) of the user to retrieve.
     * @return The User object associated with the provided identifier.
     */
    @GetMapping("/findUserByID/{id}")
    public User getUserByID(@PathVariable String id) {
        return userRepo.findUserByID(id);
    }

    /**
     * Handles a GET request to retrieve a user by their username.
     *
     * @param name The username of the user to retrieve.
     * @return The User object associated with the provided username.
     */
    @GetMapping("/findUserByUserName/{name}")
    public User getUserByUserName(@PathVariable String name) {
        return userRepo.findUserByUserName(name);
    }

    /**
     * Handles a GET request to retrieve a user by their email address.
     *
     * @param email The email address of the user to retrieve.
     * @return The User object associated with the provided email address.
     */
    @GetMapping("/findUserByEmail/{email}")
    public User getUserByEmail(@PathVariable String email) {
        return userRepo.findUserByEmail(email);
    }

    /**
     * Handles a POST request to create new portfolios based on the provided
     * details.
     *
     * @param details A map of details specifying the portfolios to be created.
     *                The map may contain keys such as "portfolioName" and
     *                "userEmail."
     * @return A ResponseEntity containing a message indicating the result
     *         of the portfolio creation operation.
     */
    @PostMapping("/createPortfolios")
    public ResponseEntity<String> createPortfolios(
            @RequestBody Map<String, Object> details) {
        String email = (String) details.get("userEmail");
        String portfolioName = (String) details.get("portfolioName");
        String portfolioStrategy = (String) details.get("portfolioStrategy");
        double capitalAmount = Double.parseDouble((String)
            details.get("capitalAmount"));
        List<Map<String, Object>> stocks = (List<Map<String, Object>>)
            details.get("stocks");

        // Get users
        User user = userRepo.findUserByEmail(email);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("User not found");
        }
        String id = user.getId();

        Portfolio portfolio = new Portfolio(portfolioName, portfolioStrategy,
                LocalDateTime.now(), email, capitalAmount);
        for (Map<String, Object> map : stocks) {
            portfolio.addStock(map, stockRepo, portRepo,
                    historicalPricePortfolioRepo, logsRepo);
        }

        double totalFuturePortfolioAmount = portfolio.
                calculateUsedCapitalAmount(stocks, stockRepo);
        if (capitalAmount < totalFuturePortfolioAmount) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Insufficient amount for the portfolio");
        }
        String portfolioId = portfolio.getPortfolioId();
        List<Map<String, Object>> deletedStocks = new ArrayList<>();

        Logs logEntry = new Logs(LocalDateTime.now(), portfolioId, stocks,
                deletedStocks, capitalAmount, id);
        logsRepo.save(logEntry);

        portfolio = portRepo.save(portfolio);

        if (portfolio != null && portfolio.getPortfolioId() != null) {
            // Add the portfolio to the user
            String portfolioID = portfolio.getPortfolioId();
            new User().addPortfolioList(userRepo, email, portfolioID);
            return ResponseEntity.ok("Portfolio created successfully");
        }

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Portfolio creation failed");
    }

    /**
     * Handles a PUT request to update the details of a specific portfolio.
     *
     * @param portfolioId The unique identifier of the portfolio to be updated.
     * @param details     A map of details specifying the updates to be
     *                    applied to the portfolio.
     * @return A ResponseEntity containing a message indicating the result
     *         of the update operation.
     */
    @PutMapping("/{portfolioId}/edit")
    public ResponseEntity<String> updatePortfolios(
            @PathVariable String portfolioId,
            @RequestBody final Map<String, Object> details) {
        String portfolioName = (String) details.get("portfolioName");
        String portfolioStrategy = (String) details.get("portfolioStrategy");
        double capitalAmount = Double.parseDouble((String)
            details.get("capitalAmount"));
        List<Map<String, Object>> addedStocks = (List<Map<String, Object>>)
            details.get("addedStocks");
        List<Map<String, Object>> deletedStocks = (List<Map<String, Object>>)
            details.get("deletedStocks");


        Portfolio portfolio = portRepo.findByPortfolioId(portfolioId)
                .orElse(null);

        if (portfolio == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Portfolio not found");
        }

        double totalFuturePortfolioAmount = portfolio.
                calculateUsedCapitalAmount(portfolio.getStockList(),
                        stockRepo)
                + portfolio.calculateUsedCapitalAmount(addedStocks,
                        stockRepo)
                - portfolio.calculateUsedCapitalAmount(deletedStocks,
                        stockRepo);

        if (capitalAmount < 0 || capitalAmount < totalFuturePortfolioAmount) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
                    "Capital amount must be greater than or equal"
                           + " to the current portfolio's amount.");
        }

        String email = portfolio.getUserEmail();

        // Get users
        User user = userRepo.findUserByEmail(email);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("User not found");
        }

        String userID = user.getId();

        // Add new stock OR add quantity to existing stock
        for (Map<String, Object> map : addedStocks) {
            String stockSymbol = (String) map.get("stockSymbol");
            int qty = (int) map.get("qty");

            Stock stock = stockRepo.findStockByStockSymbol(stockSymbol);
            if (qty <= 0 || stockSymbol.equals(null)
                    || map.get("exchange").equals(null) || stock == null) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Invalid stockSymbol/quantity/exchange inputted");
            }
            portfolio.addStock(map, stockRepo, portRepo,
                    historicalPricePortfolioRepo, logsRepo);
        }

        // Remove existing stock
        for (Map<String, Object> map : deletedStocks) {
            portfolio.removeStock(map, portRepo,
                    stockRepo, historicalPricePortfolioRepo);
        }

        portfolio.setPortfolioName(portfolioName);
        portfolio.setPortfolioStrategy(portfolioStrategy);
        portfolio.setCapitalAmount(capitalAmount);

        Logs logEntry = new Logs(LocalDateTime.now(), portfolioId, addedStocks,
                deletedStocks, capitalAmount, userID);
        logsRepo.save(logEntry);

        portRepo.save(portfolio);

        return ResponseEntity.ok("Portfolio edited successfully");
    }

    /**
     * Handles a GET request to retrieve a list of portfolios associated with a
     * user's email address.
     *
     * @param email The email address of the user for whom portfolios are to be
     *              retrieved.
     * @return A ResponseEntity containing a list of Portfolio
     *         objects representing the user's portfolios.
     */
    @GetMapping("/getPortfolios/{email}")
    public ResponseEntity<List<Portfolio>> getPortfolios(
            @PathVariable String email) {
        List<String> portList = new ArrayList<>();
        List<Portfolio> stockList = new ArrayList<>();
        User user = userRepo.findUserByEmail(email);

        if (user != null) {
            portList = user.getPortfolio();
            if (portList != null) {
                for (String list : portList) {
                    stockList.add(portRepo.findByPortfolioId(list).get());
                }
                return ResponseEntity.ok(stockList);
            }
        }
        // return empty list
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Collections.emptyList());
    }

    /**
     * Handles a DELETE request to delete a specific portfolio by its unique
     * identifier and owner's email address.
     *
     * @param portfolioID The unique identifier of the portfolio to be deleted.
     * @param email       The email address of the owner of the portfolio.
     * @return A ResponseEntity containing a message indicating
     *         the result of the portfolio deletion operation.
     */
    @DeleteMapping("/delete/{portfolioID}/{email}")
    public ResponseEntity<String> deletePortfolios(
            @PathVariable String portfolioID,
            @PathVariable String email) {
        User user = userRepo.findUserByEmail(email);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("User does not exist");
        }

        ArrayList<String> portfolioList = user.getPortfolio();
        if (!portfolioList.contains(portfolioID)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Portfolio not found in User");
        }

        try {
            portRepo.deleteById(portfolioID);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Portfolio deletion not successful");
        }

        portfolioList.remove(portfolioID);
        user.setPortfolio(portfolioList);
        userRepo.save(user);

        return ResponseEntity.ok("Portfolio deleted successfully");
    }

    /**
     * Handles a GET request to retrieve a specific portfolio by its unique
     * identifier.
     *
     * @param portfolioId The unique identifier of
     *                    the portfolio to be retrieved.
     * @return A ResponseEntity containing the Portfolio object
     *         associated with the provided identifier.
     */
    @GetMapping("/getPortfolio/{portfolioId}")
    public ResponseEntity<Portfolio> getPortfolioByID(
            @PathVariable String portfolioId) {
        Portfolio portfolio = null;
        try {
            portfolio = portRepo.findByPortfolioId(portfolioId).get();

            if (portfolio != null) {
                return ResponseEntity.ok(portfolio);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(portfolio);
            }
        } catch (Exception e) {
            // return empty list
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(portfolio);
        }
    }
}
