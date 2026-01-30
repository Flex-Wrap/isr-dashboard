import { useMemo, useRef } from "react";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsivePie } from "@nivo/pie";
import { ResponsiveRadar } from "@nivo/radar";
import { CSV_COLUMNS } from "../utils/csvLoader";
import { theme } from "../theme";
import "./Dashboard.css";

interface DashboardProps {
  data: any[];
  selectedCountry: string;
  selectedRegion: string;
}

export function Dashboard({
  data,
  selectedCountry,
  selectedRegion,
}: DashboardProps) {
  const dashboardRef = useRef<HTMLDivElement>(null);

  // Gender distribution
  const genderData = useMemo(() => {
    const counts: Record<string, number> = {};
    data.forEach((row) => {
      const gender = row[CSV_COLUMNS.GENDER] || "Not Specified";
      counts[gender] = (counts[gender] || 0) + 1;
    });
    return Object.entries(counts).map(([gender, count]) => ({
      id: gender,
      label: gender,
      value: count,
    }));
  }, [data]);

  // Age group distribution
  const ageData = useMemo(() => {
    const counts: Record<string, number> = {};
    data.forEach((row) => {
      const age = row[CSV_COLUMNS.AGE_GROUP] || "Not Specified";
      counts[age] = (counts[age] || 0) + 1;
    });
    return Object.entries(counts).map(([age, count]) => ({
      id: age,
      label: age,
      value: count,
    }));
  }, [data]);

  // Sector distribution
  const getSectorDisplay = (fullName: string): string => {
    const parenIndex = fullName.indexOf("(");
    if (parenIndex > 0) {
      return fullName.substring(0, parenIndex).trim();
    }
    return fullName;
  };

  const sectorData = useMemo(() => {
    const counts: Record<string, number> = {};
    data.forEach((row) => {
      const sector = row[CSV_COLUMNS.SECTOR] || "Not Specified";
      counts[sector] = (counts[sector] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([sector, count]) => ({
        sector: getSectorDisplay(sector),
        fullSector: sector,
        count,
      }));
  }, [data]);

  // Organization stage distribution
  const stageData = useMemo(() => {
    const counts: Record<string, number> = {};
    data.forEach((row) => {
      const stage = row[CSV_COLUMNS.ORGANISATION_STAGE] || "Not Specified";
      counts[stage] = (counts[stage] || 0) + 1;
    });
    return Object.entries(counts).map(([stage, count]) => ({
      stage: getSectorDisplay(stage),
      fullStage: stage,
      count,
    }));
  }, [data]);

  // Role distribution
  const roleData = useMemo(() => {
    const counts: Record<string, number> = {};
    data.forEach((row) => {
      const role = row[CSV_COLUMNS.ROLE] || "Not Specified";
      counts[role] = (counts[role] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([role, count]) => ({
        role: getSectorDisplay(role),
        fullRole: role,
        count,
      }));
  }, [data]);

  // Energy focus distribution for radar (excluding Not Specified)
  const energyData = useMemo(() => {
    const counts: Record<string, number> = {};
    data.forEach((row) => {
      const energy = row[CSV_COLUMNS.ENERGY_FOCUS] || "Not Specified";
      counts[energy] = (counts[energy] || 0) + 1;
    });
    return Object.entries(counts)
      .filter(([energy]) => energy !== "Not Specified")
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([energy, count]) => {
        let displayName = getSectorDisplay(energy);
        if (energy.startsWith("Hybrid")) displayName = "Hybrid/Transition";
        else if (energy.startsWith("Other")) displayName = "Other";
        return {
          name: displayName,
          fullName: energy,
          value: count,
        };
      });
  }, [data]);

  // Energy specified vs not specified pie
  const energySpecifiedData = useMemo(() => {
    let specifiedCount = 0;
    let notSpecifiedCount = 0;
    data.forEach((row) => {
      const energy = row[CSV_COLUMNS.ENERGY_FOCUS];
      if (!energy || energy === "Not Specified") {
        notSpecifiedCount++;
      } else {
        specifiedCount++;
      }
    });
    return [
      {
        id: "Specified",
        label: "Specified",
        value: specifiedCount,
      },
      {
        id: "Not Specified",
        label: "Not Specified",
        value: notSpecifiedCount,
      },
    ].filter((d) => d.value > 0);
  }, [data]);

  return (
    <div className="dashboard" ref={dashboardRef}>
      <div className="dashboard-header">
        <h2>Dashboard</h2>
        <p className="record-count">Total Records: {data.length}</p>
      </div>

      {/* Gender Distribution - Pie */}
      <div className="chart-container">
        <h3>Gender Distribution</h3>
        <div className="chart">
          <ResponsivePie
            data={genderData}
            margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
            innerRadius={0.5}
            padAngle={0.7}
            cornerRadius={3}
            colors={[theme.colors.centenaryOrange, theme.colors.centenaryBlue, theme.colors.centenaryRed, theme.colors.centenaryPurple]}
            borderWidth={1}
            borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
            arcLinkLabelsSkipAngle={10}
            arcLinkLabelsTextColor={theme.colors.lightBlue}
            arcLabelsSkipAngle={10}
            arcLabel={(d) => `${d.value}`}
            arcLabelsTextColor="#ffffff"
            theme={{
              text: { fill: "#ffffff", textShadow: "0 1px 3px rgba(0, 0, 0, 0.7)" },
              legends: { text: { fill: theme.colors.lightBlue } },
            }}
            tooltip={({ datum }) => (
              <div className="chart-tooltip">
                <strong>{datum.label}</strong>: {datum.value}
              </div>
            )}
          />
        </div>
      </div>

      {/* Age Group Distribution - Pie */}
      <div className="chart-container">
        <h3>Age Group Distribution</h3>
        <div className="chart">
          <ResponsivePie
            data={ageData}
            margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
            innerRadius={0.5}
            padAngle={0.7}
            cornerRadius={3}
            colors={[theme.colors.centenaryOrange, theme.colors.centenaryBlue, theme.colors.centenaryRed, theme.colors.centenaryPurple]}
            borderWidth={1}
            borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
            arcLinkLabelsSkipAngle={10}
            arcLinkLabelsTextColor={theme.colors.lightBlue}
            arcLabelsSkipAngle={10}
            arcLabel={(d) => `${d.value}`}
            arcLabelsTextColor="#ffffff"
            theme={{
              text: { fill: "#ffffff", textShadow: "0 1px 3px rgba(0, 0, 0, 0.7)" },
              legends: { text: { fill: theme.colors.lightBlue } },
            }}
            tooltip={({ datum }) => (
              <div className="chart-tooltip">
                <strong>{datum.label}</strong>: {datum.value}
              </div>
            )}
          />
        </div>
      </div>

      {/* Sector Distribution - Bar */}
      <div className="chart-container full-width">
        <h3>Sectors</h3>
        <div className="chart">
          <ResponsiveBar
            data={sectorData}
            keys={["count"]}
            indexBy="sector"
            margin={{ top: 50, right: 30, bottom: 100, left: 60 }}
            padding={0.3}
            valueScale={{ type: "linear" }}
            indexScale={{ type: "band", round: true }}
            colors={() => theme.colors.centenaryOrange}
            borderColor={theme.colors.border}
            theme={{
              text: { fill: "#ffffff", textShadow: "0 1px 3px rgba(0, 0, 0, 0.7)" },
              axis: { ticks: { text: { fill: theme.colors.lightBlue } }, legend: { text: { fill: theme.colors.lightBlue } } },
              grid: { line: { stroke: theme.colors.subtleBlue } },
              legends: { text: { fill: theme.colors.lightBlue } },
            }}
            labelTextColor="#ffffff"
            axisTop={null}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: "Number of Respondants",
              legendPosition: "middle",
              legendOffset: -50,
            }}
            axisRight={null}
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: "Sector",
              legendPosition: "middle",
              legendOffset: 60,
            }}
            labelSkipWidth={12}
            labelSkipHeight={12}
            label={(d) => `${d.value}`}
            tooltip={({ data, value }) => (
              <div className="chart-tooltip">
                <strong>{(data as any).fullSector}</strong>: {value}
              </div>
            )}
          />
        </div>
      </div>

      {/* Organization Stage Distribution - Bar */}
      <div className="chart-container">
        <h3>Organization Stage</h3>
        <div className="chart">
          <ResponsiveBar
            data={stageData}
            keys={["count"]}
            indexBy="stage"
            margin={{ top: 50, right: 30, bottom: 100, left: 60 }}
            padding={0.3}
            valueScale={{ type: "linear" }}
            indexScale={{ type: "band", round: true }}
            colors={() => theme.colors.centenaryBlue}
            borderColor={theme.colors.border}
            theme={{
              text: { fill: "#ffffff", textShadow: "0 1px 3px rgba(0, 0, 0, 0.7)" },
              axis: { ticks: { text: { fill: theme.colors.lightBlue } }, legend: { text: { fill: theme.colors.lightBlue } } },
              grid: { line: { stroke: theme.colors.subtleBlue } },
              legends: { text: { fill: theme.colors.lightBlue } },
            }}
            labelTextColor="#ffffff"
            axisTop={null}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: "Number of Respondants",
              legendPosition: "middle",
              legendOffset: -50,
            }}
            axisRight={null}
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: "Stage",
              legendPosition: "middle",
              legendOffset: 60,
            }}
            labelSkipWidth={12}
            labelSkipHeight={12}
            label={(d) => `${d.value}`}
          />
        </div>
      </div>

      {/* Role Distribution - Bar */}
      <div className="chart-container">
        <h3>Roles</h3>
        <div className="chart">
          <ResponsiveBar
            data={roleData}
            keys={["count"]}
            indexBy="role"
            margin={{ top: 50, right: 30, bottom: 100, left: 60 }}
            padding={0.3}
            valueScale={{ type: "linear" }}
            indexScale={{ type: "band", round: true }}
            colors={() => theme.colors.centenaryRed}
            borderColor={theme.colors.border}
            theme={{
              text: { fill: "#ffffff", textShadow: "0 1px 3px rgba(0, 0, 0, 0.7)" },
              axis: { ticks: { text: { fill: theme.colors.lightBlue } }, legend: { text: { fill: theme.colors.lightBlue } } },
              grid: { line: { stroke: theme.colors.subtleBlue } },
              legends: { text: { fill: theme.colors.lightBlue } },
            }}
            labelTextColor="#ffffff"
            axisTop={null}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: "Number of Respondants",
              legendPosition: "middle",
              legendOffset: -50,
            }}
            axisRight={null}
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: "Role",
              legendPosition: "middle",
              legendOffset: 60,
            }}
            labelSkipWidth={12}
            labelSkipHeight={12}
            label={(d) => `${d.value}`}
            tooltip={({ data, value }) => (
              <div className="chart-tooltip">
                <strong>{(data as any).fullRole}</strong>: {value}
              </div>
            )}
          />
        </div>
      </div>

      {/* Energy Focus Distribution */}
      <div className="chart-container full-width">
        <h3>Energy Focus</h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
            height: "400px",
          }}
        >
          {/* Radar Chart */}
          <div className="chart">
            <ResponsiveRadar
              data={energyData}
              keys={["value"]}
              indexBy="name"
              margin={{ top: 60, right: 60, bottom: 60, left: 60 }}
              colors={() => theme.colors.centenaryPurple}
              borderColor={theme.colors.border}
              theme={{
                text: { fill: theme.colors.lightBlue },
                grid: { line: { stroke: theme.colors.border } },
                legends: { text: { fill: theme.colors.lightBlue } },
                tooltip: {
                  container: {
                    background: theme.colors.darkDarker,
                    color: theme.colors.textLight,
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: "4px",
                  },
                },
              }}
              gridLabelOffset={36}
              dotSize={8}
              dotColor={{ from: "color", modifiers: [["darker", 0.3]] }}
              dotBorderColor={theme.colors.lightBlue}
              dotBorderWidth={2}
              enableDotLabel={true}
              dotLabel={(d) => `${d.value}`}
              dotLabelYOffset={-12}
            />
          </div>

          {/* Specified vs Not Specified Pie */}
          <div className="chart">
            <ResponsivePie
              data={energySpecifiedData}
              margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
              innerRadius={0.5}
              padAngle={0.7}
              cornerRadius={3}
              colors={[theme.colors.centenaryBlue, theme.colors.centenaryOrange]}
              borderWidth={1}
              borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
              arcLinkLabelsTextColor={theme.colors.lightBlue}
              arcLabelsSkipAngle={10}
              arcLabel={(d) => `${d.value}`}
              arcLabelsTextColor="#ffffff"
              theme={{
                text: { fill: "#ffffff", textShadow: "0 1px 3px rgba(0, 0, 0, 0.7)" },
                legends: { text: { fill: theme.colors.lightBlue } },
                tooltip: {
                  container: {
                    background: theme.colors.darkDarker,
                    color: theme.colors.textLight,
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: "4px",
                  },
                },
              }}
              tooltip={({ datum }) => (
                <div className="chart-tooltip">
                  <strong>{datum.label}</strong>: {datum.value}
                </div>
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
