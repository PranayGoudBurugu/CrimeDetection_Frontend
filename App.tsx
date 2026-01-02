import React, { useState } from "react";
import { DashboardLayout } from "./components/DashboardLayout";
import { AnalysisPage } from "./pages/AnalysisPage";
import { HistoryPage } from "./pages/HistoryPage";
import { ProfilePage } from "./pages/ProfilePage";
import { SettingsPage } from "./pages/SettingsPage";

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<string>('analysis');

  const renderPage = () => {
    switch (currentPage) {
      case 'analysis':
        return <AnalysisPage />;
      case 'history':
        return <HistoryPage />;
      case 'profile':
        return <ProfilePage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <AnalysisPage />;
    }
  };

  return (
    <DashboardLayout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </DashboardLayout>
  );
};

export default App;
