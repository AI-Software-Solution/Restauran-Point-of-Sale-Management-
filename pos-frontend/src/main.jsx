import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Provider } from "react-redux";
import store from "./redux/store.js";
import { SnackbarProvider } from "notistack";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LanguageProvider } from "./i18n";
import { ThemeProvider } from "./context/ThemeContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 daqiqa (300000ms) - 30 sekunddan ko'tarildi
      gcTime: 10 * 60 * 1000,   // 10 daqiqa cache
      retry: 2,                 // Xatolikda 2 marta qayta urinish
      refetchOnWindowFocus: false, // Oynaga qaytganda qayta yuklamaslik
    }
  }
})

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <LanguageProvider>
          <SnackbarProvider autoHideDuration={3000}>
            <QueryClientProvider client={queryClient} >
              <App />
            </QueryClientProvider>
          </SnackbarProvider>
        </LanguageProvider>
      </ThemeProvider>
    </Provider>
  </StrictMode>
);
