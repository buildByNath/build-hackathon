import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PriceWatchProvider } from "./context/PriceWatchContext";
import Navbar from "./components/Navbar";
import DemoModeBar from "./components/DemoModeBar";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Cart from "./pages/Cart";
import SavingsVault from "./pages/SavingsVault";
import History from "./pages/History";
import Alternatives from "./pages/Alternatives";

function App() {
  return (
    <PriceWatchProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 font-sans antialiased selection:bg-blue-500/20 selection:text-blue-700">
          <DemoModeBar />
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/watches" element={<Dashboard />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/vault" element={<SavingsVault />} />
              <Route path="/history" element={<History />} />
              <Route path="/alternatives" element={<Alternatives />} />
            </Routes>
          </main>
          
          <footer className="bg-white border-t border-gray-200/80 py-6 text-center text-xs text-gray-500">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                <span className="font-bold text-gray-900">PricePulse</span>
                <span>— AI Personal Price Watcher</span>
              </div>
              <p className="text-gray-400">
                Built for Hackathon • Real-time Price Intelligence & Alternative Discovery
              </p>
            </div>
          </footer>
        </div>
      </BrowserRouter>
    </PriceWatchProvider>
  );
}

export default App;

