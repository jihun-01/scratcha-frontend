import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ThemeProvider from './components/ThemeProvider';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import MainPage from './components/pages/MainPage';
import Dashboard from './components/Dashboard';
import Signin from './components/pages/Signin';
import Signup from './components/pages/Signup';
import Overview from './components/pages/Overview';
import Pricing from './components/pages/Pricing';
import Demo from './components/pages/Demo';
import DashboardOverview from './components/pages/DashboardOverview';
import DashboardSettings from './components/pages/DashboardSettings';
import DashboardUsage from './components/pages/DashboardUsage';
import DashboardBilling from './components/pages/DashboardBilling';
import DashboardApp from './components/pages/DashboardApp';
import NotFound from './components/pages/NotFound';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<MainPage />} />
            <Route path="overview" element={<Overview />} />
            <Route path="pricing" element={<Pricing />} />
            <Route path="demo" element={<Demo />} />
          </Route>
          <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>}>
            <Route index element={<DashboardOverview />} />
            <Route path="settings" element={<DashboardSettings />} />
            <Route path="usage" element={<DashboardUsage />} />
            <Route path="billing" element={<DashboardBilling />} />
            <Route path="app" element={<DashboardApp />} />
          </Route>
          <Route path="signin" element={<Signin />} />
          <Route path="signup" element={<Signup />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;