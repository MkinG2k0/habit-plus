import { type JSX, lazy } from "react";
import { Route, Routes, Navigate } from "react-router-dom";

const HomePage = lazy(() =>
  import("@/pages/HomePage").then((m) => ({ default: m.HomePage })),
);
const EditHabitPage = lazy(() =>
  import("@/pages/EditHabitPage").then((m) => ({ default: m.EditHabitPage })),
);
const HabitRemindersPage = lazy(() =>
  import("@/pages/HabitRemindersPage").then((m) => ({
    default: m.HabitRemindersPage,
  })),
);
const SettingsPage = lazy(() =>
  import("@/pages/SettingsPage").then((m) => ({ default: m.SettingsPage })),
);
const DataBackupPage = lazy(() =>
  import("@/pages/DataBackupPage").then((m) => ({ default: m.DataBackupPage })),
);
const HabitArchivePage = lazy(() =>
  import("@/pages/HabitArchivePage").then((m) => ({
    default: m.HabitArchivePage,
  })),
);
const LifeBalanceQuizPage = lazy(() =>
  import("@/pages/LifeBalanceQuizPage").then((m) => ({
    default: m.LifeBalanceQuizPage,
  })),
);
const StatsPage = lazy(() =>
  import("@/pages/StatsPage").then((m) => ({ default: m.StatsPage })),
);

export const AppRoutes = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/quiz"
        element={
          <ProtectedRoute>
            <LifeBalanceQuizPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/stats"
        element={
          <ProtectedRoute>
            <StatsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/add"
        element={
          <ProtectedRoute>
            <EditHabitPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/edit/:id/reminders"
        element={
          <ProtectedRoute>
            <HabitRemindersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/edit/:id"
        element={
          <ProtectedRoute>
            <EditHabitPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings/backup"
        element={
          <ProtectedRoute>
            <DataBackupPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings/archive"
        element={
          <ProtectedRoute>
            <HabitArchivePage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  return children;
};
