import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import { Home, Auth, Orders, Tables, Menu, Dashboard, Landing, CMS, Inventory, FloorPlan, AdminPro, Analytics, Integrations, Settings } from "./pages";
import BIDashboard from "./pages/BIDashboard";
import KitchenDisplay from "./pages/KitchenDisplay";
import { useSelector } from "react-redux";
import useLoadData from "./hooks/useLoadData";
import FullScreenLoader from "./components/shared/FullScreenLoader";
import { AppShell } from "./components/layout";
import { ThemeProvider } from "./context/ThemeContext";

// Protected Route wrapper
function ProtectedRoute({ children }) {
  const { isAuth } = useSelector((state) => state.user);
  if (!isAuth) {
    return <Navigate to="/auth" replace />;
  }
  return children;
}

// Layout wrapper that includes AppShell for authenticated routes
function AuthenticatedLayout({ children }) {
  return (
    <AppShell>
      {children}
    </AppShell>
  );
}

function AppRoutes() {
  const isLoading = useLoadData();
  const location = useLocation();
  const { isAuth } = useSelector((state) => state.user);
  const userData = useSelector((state) => state.user);
  const isAdmin = userData.role?.toLowerCase() === "admin";

  // Public routes (no loader needed)
  const publicRoutes = ["/", "/auth"];
  const isPublicRoute = publicRoutes.includes(location.pathname);

  // Show loader only for authenticated routes
  if (isLoading && !isPublicRoute) {
    return <FullScreenLoader />;
  }

  return (
    <Routes>
      {/* ===== PUBLIC ROUTES ===== */}
      <Route
        path="/"
        element={isAuth ? <Navigate to="/floor-plan" replace /> : <Landing />}
      />
      <Route
        path="/auth"
        element={isAuth ? <Navigate to="/floor-plan" replace /> : <Auth />}
      />

      {/* ===== PROTECTED ROUTES (with AppShell) ===== */}

      {/* Main POS Routes */}
      <Route
        path="/floor-plan"
        element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <FloorPlan />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/tables"
        element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <Tables />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <Orders />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/menu"
        element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <Menu />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/kitchen"
        element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <KitchenDisplay />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />

      {/* Dashboard & Analytics */}
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <Home />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <Dashboard />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />

      {/* Inventory & Settings */}
      <Route
        path="/inventory"
        element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <Inventory />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <Settings />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />

      {/* ===== ADMIN ONLY ROUTES ===== */}
      <Route
        path="/admin_panel"
        element={
          <ProtectedRoute>
            {isAdmin ? (
              <AuthenticatedLayout>
                <AdminPro />
              </AuthenticatedLayout>
            ) : (
              <Navigate to="/floor-plan" replace />
            )}
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin-pro"
        element={
          <ProtectedRoute>
            {isAdmin ? (
              <AuthenticatedLayout>
                <AdminPro />
              </AuthenticatedLayout>
            ) : (
              <Navigate to="/floor-plan" replace />
            )}
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            {isAdmin ? (
              <AuthenticatedLayout>
                <Analytics />
              </AuthenticatedLayout>
            ) : (
              <Navigate to="/floor-plan" replace />
            )}
          </ProtectedRoute>
        }
      />
      <Route
        path="/cms"
        element={
          <ProtectedRoute>
            {isAdmin ? (
              <AuthenticatedLayout>
                <CMS />
              </AuthenticatedLayout>
            ) : (
              <Navigate to="/floor-plan" replace />
            )}
          </ProtectedRoute>
        }
      />
      <Route
        path="/integrations"
        element={
          <ProtectedRoute>
            {isAdmin ? (
              <AuthenticatedLayout>
                <Integrations />
              </AuthenticatedLayout>
            ) : (
              <Navigate to="/floor-plan" replace />
            )}
          </ProtectedRoute>
        }
      />
      <Route
        path="/bi-dashboard"
        element={
          <ProtectedRoute>
            {isAdmin ? (
              <AuthenticatedLayout>
                <BIDashboard />
              </AuthenticatedLayout>
            ) : (
              <Navigate to="/floor-plan" replace />
            )}
          </ProtectedRoute>
        }
      />

      {/* ===== 404 NOT FOUND ===== */}
      <Route
        path="*"
        element={
          <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
            <div className="text-6xl font-bold text-primary-500">404</div>
            <h1 className="text-xl font-semibold text-text-primary">Sahifa topilmadi</h1>
            <p className="text-text-secondary">Siz qidirayotgan sahifa mavjud emas</p>
            <a
              href="/floor-plan"
              className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              Bosh sahifaga qaytish
            </a>
          </div>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AppRoutes />
      </Router>
    </ThemeProvider>
  );
}

export default App;
