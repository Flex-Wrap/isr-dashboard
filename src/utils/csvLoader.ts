import Papa from "papaparse";

// Column name mappings - update these if CSV column names change
export const CSV_COLUMNS = {
  RESPONDENT_ID: "Respondent ID",
  COUNTRY: "Which country perspective will you share in this survey?",
  STATE_PROVINCE: "State/Province",
  REGION:
    "Please confirm your region, based on the Council\u2019s regional classification.",
  SECTOR: "Which sector do you represent?",
  ENERGY_FOCUS: "What is your primary energy focus?",
  ORGANISATION_STAGE: "What is the stage of your organisation?",
  ROLE: "What is your current role within the organization?",
  GENDER: "What is your gender?",
  AGE_GROUP: "What is your age group?",
} as const;

export async function loadCSV(
  filePath: string,
  filterColumns?: string[],
): Promise<any[]> {
  console.log("loadCSV called with path:", filePath);
  const response = await fetch(filePath);
  console.log("fetch response:", response);
  const csvText = await response.text();
  console.log("CSV text length:", csvText.length);

  return new Promise((resolve, reject) => {
    console.log("Starting Papa.parse...");
    Papa.parse(csvText, {
      header: true,
      dynamicTyping: false,
      skipEmptyLines: true,
      complete: (results) => {
        console.log("Parse complete, rows:", results.data.length);
        let data = results.data as any[];

        // Filter columns if specified
        if (filterColumns && filterColumns.length > 0) {
          data = data.map((row) => {
            const filteredRow: any = {};
            filterColumns.forEach((col) => {
              filteredRow[col] = row[col];
            });
            return filteredRow;
          });
        }

        resolve(data);
      },
      error: (error: any) => {
        console.error("Parse error:", error);
        reject(error);
      },
    });
  });
}
