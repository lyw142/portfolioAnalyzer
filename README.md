<a name="readme-top"></a>

<!-- ABOUT THE PROJECT -->
# Portfolio Analyzer

<!-- ORIGINAL LINK -->
<li>https://github.com/blazefire710/portfolioAnalyzer (Original, Private)</li>
<li>https://github.com/lyw142/portfolioAnalyser (Forked, Private)</li>
<p></p>
<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#java-backend">Java Backend</a></li>
        <li><a href="#react-client">React-client</a></li>
      </ul>
    </li>
    <li>
        <a href="#file-structure">File Structure</a>
    </li>
      <li>
        <a href="#acknowledgements">Acknowledgements</a>
    </li>
  </ol>
</details>


## About The Project



Portfolio Analyzer is a web application which allows one to track their investment portfolios. Each portfolio can be created for different strategies, containing different combinations and quantities of stocks. Analytics can then be viewed for the improvement of investment strategies, guiding one's decision to remove existing or purchase new stocks.

<img width="1103" alt="image" src="https://github.com/blazefire710/portfolioAnalyzer/assets/141037579/6111ef15-73e3-41fb-ba3a-55dd2162d1e4">

Analytics include:
* Market Exposure by industry and sector segment for portfolios
* Annual Return, Annualized return, Annualized volatility for stocks and portfolios
    * Annual Return (%): Change in value of investment over 1 year period
    * Annualized return (%):  Average annual growth rate of portfolio over the specified period of time 
    * Annualized volatility (%): Degree of stock price fluctuation over time period
* Historical return for portfolios (%): Increase in capital if the exact portfolio investment (same stock quantities) was made a specific number of years ago
* Visualisation of historical stock prices 

![localhost_3000_Balanced%20Income%20and%20Growth2023-11-09T00_43_54 715434](https://github.com/blazefire710/portfolioAnalyzer/assets/141037579/56c671d1-4894-41ff-b1f4-d0c634dc3b63)

<p align="right">(<a href="#readme-top">back to top</a>)</p>


### Built With

Major frameworks/libraries used are listed below:

* [React.js](https://react.dev/)
* [Springboot](https://spring.io/projects/spring-boot)
* [MongoDB](https://www.mongodb.com/)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->
## Getting Started

Follow these steps to set up the application. 

### Prerequisites

* Install node.js and npm from [here](https://nodejs.org/en/download/).
* JDK-17 
* Maven

### Java Backend
This sets up the server which interacts with the MongoDB database to create/read/update/delete user, stock and portfolio details. It also interacts with the stock data API Alpha Vantage, and gmail SMTP. 
<br>
1. set up the application.properties file in src/main/resources. Do change the properties to your own.
```sh
# Set the MongoDB Atlas connection string
spring.data.mongodb.database=portfolioAnalyzerDB
spring.data.mongodb.uri= "your mongodb atlas connection string"

# Set the SMTP server details
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username= "your email"
spring.mail.password= "your password"
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true

# Set the Alpha Vantage API key
alphavantage.api.key = "your alpha vantage api key"
```

2. Compile, test and run using maven.
```sh
$ mvn clean compile
```
```sh
$ mvn clean test
```
```sh
$ mvn clean compile && mvn -q exec:java -Dexec.mainClass=com.example.app.AppDriver -Djava.util.logging.config.file=src/main/resources/logging.properties
```
3. Package.
```sh
$ mvn assembly:single
```
4. Run the application: Navigate to `src\main\java\com\java\portfolioAnalyser\DemoApplication.java` and click on the "run" option above the public static void main function.

6. (Optional) Generate java documentation
```sh
$ mvn javadoc:javadoc
```
6. (Optional) Run checkstyle to check adherence to coding standard.
```sh
$ mvn site
```
<br>

### React Client 

This sets up the Graphical User Interface (GUI) for user to view their portfolios, stocks and analytics.
<br>


1. Navigate to react-client directory from main directory.
```sh
cd react-client
```
2. Install all dependencies
```sh
npm install
```
3. Run the application.
```sh
npm start
```
Runs the app in the development mode.
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## File Structure
React Client file structure is shown below.
<br>

    react-client/
    │
    ├── public/
    ├── src/  # Source code
    │   ├── assets/
    │   ├── components/
    │   │   ├── Comparison/ # content for comparison tab
    │   │   │   ├── components/
    │   │   │   │   ├── PortfolioComparison/
    │   │   │   │   ├── StockComparison/
    │   │   ├── Dashboard/
    │   │   ├── Loading/
    │   │   ├── Logs/  # for admin users
    │   │   ├── NavBar/
    │   │   ├── Portfolios/  # content for portfolios tab
    │   │   │   ├── components/
    │   │   │   │   ├── PortfolioAnalytics/
    │   │   │   │   ├── PortfolioCard/ # portfolio card rendered in main page
    │   │   │   │   ├── PortfolioDetails/ # single portfolio page
    │   │   │   │   ├── PortfolioManager/ # manages creation, edit of the portfolios
    │   │   │   │   ├── StockAnalytics/ 
    │   │   ├── Profile/  # profile tab
    │   │   ├── Stocks/ # content for search stocks tab
    │   │   ├── UserAuth/ # login, reset password, sign up, change password
    │   │
    │   ├── utils/
    ├── mockData/  # mock data files
    ├── App.js 
    ├── index.css
    ├── index.js
    ├── routes.js  # API routes (to Java Backend)
    ├── .package.json
    ├── .package-lock.json
    └── .gitignore

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Acknowledgements
This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).
