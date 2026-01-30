import { useState, useEffect } from "react";
import { Dashboard } from "./components/Dashboard";
import LogoWEC from "./assets/LogoWEC.svg";
import "./App.css";

function App() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Get the key from URL query parameters
        const params = new URLSearchParams(window.location.search);
        const key = params.get("key");

        if (!key) {
          setError("No API key provided. Please include ?key=your_key in the URL.");
          setLoading(false);
          return;
        }

        // Fetch data from API using the provided key
        const response = await fetch(`/api/data?key=${encodeURIComponent(key)}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.statusText}`);
        }

        const jsonData = await response.json();
        setData(Array.isArray(jsonData) ? jsonData : jsonData.data || []);
      } catch (err: any) {
        setError(err.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="container">
      {/* Header Section - Fixed at top */}
      <div className="controls">
        <div className="controls-header">
          <h1>Issues Monitor Dashboard</h1>
          <img src={LogoWEC} alt="WEC Logo" className="logo-wec" />
        </div>
      </div>

      {/* Page content with margin to account for fixed header */}
      <div className="content">
        {loading && (
          <div style={{ padding: "20px", textAlign: "center" }}>
            Loading dashboard...
          </div>
        )}
        
        {error && (
          <div style={{ padding: "20px", color: "red", textAlign: "center" }}>
            Error: {error}
          </div>
        )}
        
        {!loading && !error && data.length > 0 && (
          <Dashboard data={data} selectedCountry="" selectedRegion="" />
        )}

        {!loading && !error && data.length === 0 && (
          <div style={{ padding: "20px", textAlign: "center" }}>
            No data available
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
