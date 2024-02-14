package com.java.portfolioAnalyser;

import java.security.SecureRandom;

import java.util.ArrayList;
import java.util.Random;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.annotation.Id;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Represents a user in the application.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "user")
public class User {
    /** User Name. */
    @Field(name = "userName")
    private String userName;

    /** User Password. */
    @Field(name = "password")
    private String password;

    /** User Email. */
    @Field(name = "email")
    private String email;

    /** Portfolio List. */
    private ArrayList<String> portfolio;

    /**
     * User has forgotten password.
     * temporary password is generated and sent to user's email
     * password has to be reset on login
     */
    @Field(name = "forgot")
    private boolean hasForgottenPassword = false;

    /** User ID. */
    @Id
    private String id;

    /**
     * Constructor for the User class.
     *
     * @param email    The user's email for login.
     * @param password The user's password for login.
     */
    public User(String email, String password) {
        this.password = password;
        this.email = email;

        // Extract the username by taking the part before the @ symbol.
        // NOTE: Username is not unique. Only email is unique.
        int firstPartIndex = email.indexOf('@');
        String firstPart = email.substring(0, firstPartIndex);
        this.userName = firstPart;
    }

    /**
     * Retrieves the user's password.
     *
     * @return The user's password.
     */
    public String getPassword() {
        return password;
    }

    /**
     * Checks whether the user's password is marked as forgotten.
     *
     * @return true if the password is marked as forgotten; otherwise, false.
     */
    public boolean getHasForgottenPassword() {
        return hasForgottenPassword;
    }

    /**
     * Marks the user's password as forgotten.
     */
    public void forgottenPassword() {
        this.hasForgottenPassword = true;
    }

    /**
     * Marks the user's password as reset (not forgotten).
     */
    public void passwordResetted() {
        this.hasForgottenPassword = false;
    }

    /**
     * Checks if the password is valid according to the specified rules.
     * Rulse are as follows:
     * It contains at least 8 characters and at most 20 characters.
     * It contains at least one digit.
     * It contains at least one upper case alphabet.
     * It contains at least one lower case alphabet.
     * It contains at least one special character which includes !@#$%&*()-+=^.
     * It doesn’t contain any white space.
     *
     * @param password password
     * @return Boolean indicating whether the password is valid or not
     */
    public static boolean isValidPassword(String password) {

        if (password == null) {
            return false;
        }

        String regex = "^(?=.*[0-9])"
                + "(?=.*[a-z])(?=.*[A-Z])"
                + "(?=.*[@#$%^&+=!])"
                + "(?=\\S+$).{8,20}$";

        Pattern p = Pattern.compile(regex);
        Matcher m = p.matcher(password);
        return m.matches();
    }

    /**
     * Creates a random valid password.
     * @return Randomly generated valid password
     */
    public static String generateRandomPassword() {
        final String LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
        final String UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        final String DIGITS = "0123456789";
        final String SPECIAL_CHARACTERS = "@#$%^&+=";
        int length = (int) ((Math.random() * (20 - 8)) + 8);

        StringBuilder password = new StringBuilder();
        Random random = new SecureRandom();

        // Ensure at least one character from each category
        password.append(LOWERCASE.charAt(random.nextInt(LOWERCASE.length())));
        password.append(UPPERCASE.charAt(random.nextInt(UPPERCASE.length())));
        password.append(DIGITS.charAt(random.nextInt(DIGITS.length())));
        password.append(
            SPECIAL_CHARACTERS.charAt(
                random.nextInt(SPECIAL_CHARACTERS.length())));

        // Fill the rest of the password with random characters
        for (int i = 4; i < length; i++) {
                String characterSet = LOWERCASE + UPPERCASE + DIGITS
                    + SPECIAL_CHARACTERS;
            password.append(
                characterSet.charAt(random.nextInt(characterSet.length())));
        }

        // Shuffle the characters to make it more random
        char[] passwordChars = password.toString().toCharArray();
        for (int i = 0; i < length; i++) {
            int randomIndex = random.nextInt(length);
            char temp = passwordChars[i];
            passwordChars[i] = passwordChars[randomIndex];
            passwordChars[randomIndex] = temp;
        }

        String newpass = new String(passwordChars);
        if (isValidPassword(newpass)) {
            return newpass;
        } else {
            return "error occured. try again";
        }
    }

    /**
     * Checks if the email address entered is a valid email format.
     * Rules are as follows:
     * It can contain (a-z), uppercase letters (A-Z), digits (0-9), and special
     * characters _, +, &, *, -, ', ", and !
     * It can only contain 1 @ in the entire email string
     * It cannot have .@ as part of the name. All . symbols must have content
     * before and after eg: email.email@.... is valid
     * The top level domain name must be 2-7 characters. eg: .com, .net .uk
     * .usa is valid
     * domain names before the final . don't matter. so email@1234567890.com is
     * still considered valid
     * 2 consecutive . is not allowed at any point
     *
     * @param email email address
     * @return Boolean whether the email is a valid format or not
     */
    public static boolean isValidEmailAddress(String email) {

        if (email == null) {
            return false;
        }

        String emailRegex = "^[a-zA-Z0-9_+&*'\"!-]+(?:\\."
                + "[a-zA-Z0-9_+&*'\"!-]+)*@"
                + "(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,7}$";

        Pattern pat = Pattern.compile(emailRegex);
        return pat.matcher(email).matches();
    }

    /**
     * Sets a new password for the user.
     *
     * @param password The new password to be set for the user.
     */
    public void setPassword(String password) {
        this.password = password;
    }

    /**
     * Retrieves the email of the user.
     *
     * @return The email associated with the user.
     */
    public String getEmail() {
        return email;
    }

    /**
     * Sets the email associated with a user.
     *
     * @param email The unique email address identifying the user.
     */
    public void setEmail(String email) {
        this.email = email;
    }

    /**
     * Retrieves the user name of the user.
     *
     * @return The unique user name associated with the user.
     */
    public String getUserName() {
        return userName;
    }

    /**
     * Sets the userName associated with a user.
     *
     * @param userName one of the unique identifier belong to the user
     */
    public void setUserName(String userName) {
        this.userName = userName;
    }

    /**
     * Retrieves all the portfolio ID belong to the user.
     *
     * @return The list of portfolio associated with the user.
     */
    public ArrayList<String> getPortfolio() {
        return portfolio;
    }

    /**
     * Sets the list of portfolio IDs associated with a user.
     *
     * @param portfolio An array of portfolio ID strings representing
     *                   the portfolios belonging to the user.
     */
    public void setPortfolio(ArrayList<String> portfolio) {
        this.portfolio = portfolio;
    }

    /**
     * Retrieves the unique identifier (ID) of the user.
     *
     * @return The unique identifier (ID) associated with the user.
     */
    public String getId() {
        return this.id;
    }

    /**
     * Adds a new portfolio ID to the portfolio list associated with
     * a user's email in the database.
     *
     * @param repo        The User repository used for database operations.
     * @param email       The email address of the user to whom the portfolio ID
     *                    will be added.
     * @param portfolioID The ID of the new portfolio to be added to the user's
     *                    portfolio list.
     * @return A message showing the result of the portfolio addition
     */
    public String addPortfolioList(final UserRepo repo,
                                   final String email,
                                   final String portfolioID) {
        User user = repo.findUserByEmail(email);
        if (user != null) {
            ArrayList<String> portfolioList = new ArrayList<>();
            if (user.getPortfolio() != null) {
                portfolioList = user.getPortfolio();
            }
            portfolioList.add(portfolioID);
            user.setPortfolio(portfolioList);
            repo.save(user);
            return "New Portfolio Added";
        }
        return "Unsuccessful update";
    }
}
