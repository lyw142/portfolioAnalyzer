const baseURL = 'http://localhost:8080';

export const getAllStocksRoute = `${baseURL}/findAllStocks`;
export const addStockRoute = `${baseURL}/newStock`;

export const getPortfoliosRoute = `${baseURL}/getPortfolios`;
export const getPortfolioRoute = `${baseURL}/getPortfolio`;
export const getStockByStockSymbol = `${baseURL}/findStockByStockSymbol`;
export const deletePortfolioRoute = `${baseURL}/delete`;
export const createPortfolioRoute = `${baseURL}/createPortfolios`;

export const rebalancePortfolioRoute = `${baseURL}/api/v1/portfolios`;
export const historicalPriceRoute = `${baseURL}/api/v1/portfolios`;