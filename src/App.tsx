import { useState } from "react";
import { loadCSV, CSV_COLUMNS } from "./utils/csvLoader";
import { getUniques } from "./utils/dataHelpers";
import { Dashboard } from "./components/Dashboard";
import LogoWEC from "./assets/LogoWEC.svg";
import "./App.css";

function App() {
  const [allData, setAllData] = useState<any[]>([]);
  const [displayData, setDisplayData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countries, setCountries] = useState<string[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [regions, setRegions] = useState<string[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [showDashboard, setShowDashboard] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 100;

  const desiredColumns = [
    CSV_COLUMNS.COUNTRY,
    CSV_COLUMNS.STATE_PROVINCE,
    CSV_COLUMNS.REGION,
    CSV_COLUMNS.SECTOR,
    CSV_COLUMNS.ENERGY_FOCUS,
    CSV_COLUMNS.ORGANISATION_STAGE,
    CSV_COLUMNS.ROLE,
    CSV_COLUMNS.GENDER,
    CSV_COLUMNS.AGE_GROUP,
  ];

  const handleLoadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const csvData = await loadCSV(
        `${import.meta.env.BASE_URL}1901-R-Input-2026-ISR.csv`,
        desiredColumns,
      );
      setAllData(csvData);
      setDisplayData(csvData);
      const uniqueCountries = getUniques(csvData, CSV_COLUMNS.COUNTRY);
      setCountries(uniqueCountries);

      // Get unique regions, treating empty as "None"
      const regionSet = new Set<string>();
      csvData.forEach((row) => {
        const region = row[CSV_COLUMNS.REGION];
        if (region && region.trim()) {
          regionSet.add(region.trim());
        } else {
          regionSet.add("None");
        }
      });
      const uniqueRegions = Array.from(regionSet).sort((a, b) => {
        if (a === "None") return 1;
        if (b === "None") return -1;
        return a.localeCompare(b);
      });
      setRegions(uniqueRegions);

      setSelectedCountry("");
      setSelectedRegion("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCountrySelect = (country: string) => {
    setSelectedCountry(country);
    applyFilters(country, selectedRegion);
  };

  const handleRegionSelect = (region: string) => {
    setSelectedRegion(region);
    setSelectedCountry(""); // Reset country when region changes

    // Update available countries based on selected region
    let dataToUse = allData;
    if (region) {
      dataToUse = allData.filter((row) => {
        const rowRegion = row[CSV_COLUMNS.REGION];
        if (region === "None") {
          return !rowRegion || !rowRegion.trim();
        }
        return rowRegion && rowRegion.trim() === region;
      });
    }

    // Calculate available countries
    const availableCountries = getUniques(dataToUse, CSV_COLUMNS.COUNTRY);
    setCountries(availableCountries);

    applyFilters("", region);
  };

  const applyFilters = (country: string, region: string) => {
    let filtered = allData;

    if (country) {
      filtered = filtered.filter((row) => row[CSV_COLUMNS.COUNTRY] === country);
    }

    if (region) {
      filtered = filtered.filter((row) => {
        const rowRegion = row[CSV_COLUMNS.REGION];
        if (region === "None") {
          return !rowRegion || !rowRegion.trim();
        }
        return rowRegion && rowRegion.trim() === region;
      });
    }

    setDisplayData(filtered);
    setCurrentPage(1);
  };

  if (loading) return <div style={{ padding: "20px" }}>Loading CSV...</div>;
  if (error)
    return <div style={{ padding: "20px", color: "red" }}>Error: {error}</div>;

  const columns = displayData.length > 0 ? Object.keys(displayData[0]) : [];

  // Pagination
  const totalPages = Math.ceil(displayData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedData = displayData.slice(startIndex, endIndex);

  const handleDownloadJSON = () => {
    if (displayData.length === 0) {
      alert("No data to download. Please load CSV data first.");
      return;
    }
    const jsonString = JSON.stringify(displayData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `isr-data-${new Date().toLocaleDateString()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container">
      {/* Controls Section - Fixed at top */}
      <div className="controls">
        <div className="controls-header">
          <h1>World Energy Issues Monitor Internal</h1>
          <img src={LogoWEC} alt="WEC Logo" className="logo-wec" />
        </div>
        <button onClick={handleLoadData}>Load CSV Data</button>
        <button onClick={handleDownloadJSON}>Download JSON</button>
        {loading && <p>Loading CSV...</p>}
        {error && <p className="error">Error: {error}</p>}
        {allData.length > 0 && (
          <p>
            Total rows: {displayData.length}
            {selectedCountry ? ` (${selectedCountry})` : ""}
          </p>
        )}

        {(countries.length > 0 || regions.length > 0) && (
          <div className="filters-container">
            {regions.length > 0 && (
              <div className="filter-group">
                <label className="filter-label">Region</label>
                <select
                  value={selectedRegion}
                  onChange={(e) => handleRegionSelect(e.target.value)}
                  className="region-select"
                >
                  <option value="">All</option>
                  {regions.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {countries.length > 0 && (
              <div className="filter-group">
                <label className="filter-label">
                  Country ({countries.length})
                </label>
                <select
                  value={selectedCountry}
                  onChange={(e) => handleCountrySelect(e.target.value)}
                  className="country-select"
                >
                  <option value="">All</option>
                  {countries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Page content with margin to account for fixed header */}
      <div className="content">
        {displayData.length > 0 && (
          <>
            {/* Tabs */}
            <div className="view-tabs">
              <button
                className={`tab ${!showDashboard ? "active" : ""}`}
                onClick={() => setShowDashboard(false)}
              >
                Table
              </button>
              <button
                className={`tab ${showDashboard ? "active" : ""}`}
                onClick={() => setShowDashboard(true)}
              >
                Dashboard
              </button>
            </div>

            {/* Content */}
            {showDashboard ? (
              <Dashboard
                data={displayData}
                selectedCountry={selectedCountry}
                selectedRegion={selectedRegion}
              />
            ) : (
              <>
                <table className="data-table">
                  <thead>
                    <tr>
                      {columns.map((col) => (
                        <th key={col}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.map((row, idx) => (
                      <tr key={idx}>
                        {columns.map((col) => (
                          <td key={col}>{String(row[col] || "")}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="pagination">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="pagination-btn"
                  >
                    ← Previous
                  </button>
                  <span className="pagination-info">
                    Page {currentPage} of {totalPages} ({displayData.length}{" "}
                    rows)
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="pagination-btn"
                  >
                    Next →
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;
