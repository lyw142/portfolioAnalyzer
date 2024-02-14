import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from "antd";

import Login from './components/UserAuth/Login/Login';
import SignUp from './components/UserAuth/SignUp/SignUp';
import ForgotPassword from './components/UserAuth/ForgotPassword/ForgotPassword';
import ResetPassword from './components/UserAuth/ResetPassword/ResetPassword';
import UpdateEmail from './components/UserAuth/UpdateDetails/UpdateEmail';
import ChangePassword from './components/UserAuth/UpdateDetails/ChangePassword';
import Dashboard from './components/Dashboard/Dashboard';

import Portfolios from './components/Portfolios/Portfolios';
import PortfolioDetails from './components/Portfolios/components/PortfolioDetails/PortfolioDetails';
import PortfolioManager from './components/Portfolios/components/PortfolioManager/PortfolioManager';

import Stocks from './components/Stocks/Stocks';
import Profile from './components/Profile/Profile';
import StockAnalytics from './components/Portfolios/components/StockAnalytics/StockAnalytics';
import Comparison from './components/Comparison/Comparison';
import StockComparison from './components/Comparison/components/StockComparison/StockComparison.jsx';
import PortfolioComparison from './components/Comparison/components/PortfolioComparison/PortfolioComparison';
import Logs from './components/Logs/Logs';
import PortfolioAnalytics from './components/Portfolios/components/PortfolioAnalytics/PortfolioAnalytics';

const App = () => {
  return (
    <div className='App'>
      <ConfigProvider
        theme={{
          // algorithm: theme.darkAlgorithm,
          token: {
            colorPrimary: '#2346C0',
            colorLink: '#2346C0',
            borderRadius: 8,
          },
        }}
      >

        <Router>
          <Routes>
            <Route path="/" element={
              <Dashboard />
            }>
              <Route index element={<Portfolios />} />
              <Route path="/:portfolioID" element={<PortfolioDetails />} />
              <Route path="/:portfolioID/edit" element={<PortfolioManager />} />
              <Route path="/new" element={<PortfolioManager />} />
              <Route path="/stocks" element={<Stocks />} />
              <Route path="/logs" element={<Logs />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/comparison" element={<Comparison />} />
              <Route path="/portfolioAnalytics/:portfolioId" element={<PortfolioAnalytics />} />
              <Route path="/stockAnalytics/:stockSymbol" element={<StockAnalytics />} />
              <Route path="/stockComparison" element={<StockComparison />} />
              <Route path="/portfolioComparison" element={<PortfolioComparison />} />
            </Route>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/forgotPassword" element={<ForgotPassword />} />
            <Route path="/resetPassword" element={<ResetPassword />} />
            <Route path="/updateEmail" element={<UpdateEmail />} />
            <Route path="/changePassword" element={<ChangePassword />} />

          </Routes>
        </Router >
      </ConfigProvider>
    </div>
  );
};
export default App;