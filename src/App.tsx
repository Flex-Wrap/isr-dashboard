import { useState } from 'react'
import { loadCSV, CSV_COLUMNS } from './utils/csvLoader'
import { getUniques } from './utils/dataHelpers'
import './App.css'

function App() {
  const [allData, setAllData] = useState<any[]>([])
  const [displayData, setDisplayData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [countries, setCountries] = useState<string[]>([])
  const [selectedCountry, setSelectedCountry] = useState<string>('')
  const [regions, setRegions] = useState<string[]>([])
  const [selectedRegion, setSelectedRegion] = useState<string>('')

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
  ]

  const handleLoadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const csvData = await loadCSV('/1901-R-Input-2026-ISR.csv', desiredColumns)
      setAllData(csvData)
      setDisplayData(csvData)
      const uniqueCountries = getUniques(csvData, CSV_COLUMNS.COUNTRY)
      setCountries(uniqueCountries)
      
      // Get unique regions, treating empty as "None"
      const regionSet = new Set<string>()
      csvData.forEach(row => {
        const region = row[CSV_COLUMNS.REGION]
        if (region && region.trim()) {
          regionSet.add(region.trim())
        } else {
          regionSet.add('None')
        }
      })
      const uniqueRegions = Array.from(regionSet).sort((a, b) => {
        if (a === 'None') return 1
        if (b === 'None') return -1
        return a.localeCompare(b)
      })
      setRegions(uniqueRegions)
      
      setSelectedCountry('')
      setSelectedRegion('')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCountrySelect = (country: string) => {
    setSelectedCountry(country)
    applyFilters(country, selectedRegion)
  }

  const handleRegionSelect = (region: string) => {
    setSelectedRegion(region)
    setSelectedCountry('') // Reset country when region changes
    
    // Update available countries based on selected region
    let dataToUse = allData
    if (region) {
      dataToUse = allData.filter(row => {
        const rowRegion = row[CSV_COLUMNS.REGION]
        if (region === 'None') {
          return !rowRegion || !rowRegion.trim()
        }
        return rowRegion && rowRegion.trim() === region
      })
    }
    
    // Calculate available countries
    const availableCountries = getUniques(dataToUse, CSV_COLUMNS.COUNTRY)
    setCountries(availableCountries)
    
    applyFilters('', region)
  }

  const applyFilters = (country: string, region: string) => {
    let filtered = allData

    if (country) {
      filtered = filtered.filter(
        row => row[CSV_COLUMNS.COUNTRY] === country
      )
    }

    if (region) {
      filtered = filtered.filter(row => {
        const rowRegion = row[CSV_COLUMNS.REGION]
        if (region === 'None') {
          return !rowRegion || !rowRegion.trim()
        }
        return rowRegion && rowRegion.trim() === region
      })
    }

    setDisplayData(filtered)
  }

  if (loading) return <div style={{ padding: '20px' }}>Loading CSV...</div>
  if (error) return <div style={{ padding: '20px', color: 'red' }}>Error: {error}</div>

  const columns = displayData.length > 0 ? Object.keys(displayData[0]) : []

  return (
    <div className="container">
      {/* Controls Section - Fixed at top */}
      <div className="controls">
        <h1>ISR Demographic Overview</h1>
        <button onClick={handleLoadData}>
          Load CSV Data
        </button>
        {loading && <p>Loading CSV...</p>}
        {error && <p className="error">Error: {error}</p>}
        {allData.length > 0 && <p>Total rows: {displayData.length}{selectedCountry ? ` (${selectedCountry})` : ''}</p>}

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
                  {regions.map(region => (
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
                  {countries.map(country => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button 
              className="generate-btn"
              disabled={!selectedCountry || !selectedRegion}
            >
              Generate Dashboard
            </button>
          </div>
        )}
      </div>

      {/* Page content with margin to account for fixed header */}
      <div className="content">
        {displayData.length > 0 && (
          <table className="data-table">
            <thead>
              <tr>
                {columns.map(col => (
                  <th key={col}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayData.map((row, idx) => (
                <tr key={idx}>
                  {columns.map(col => (
                    <td key={col}>
                      {String(row[col] || '')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default App
