import * as XLSX from "xlsx";

/**
 * Downloads an Excel template for bulk import
 */
export function downloadTemplate(type: "players" | "captains") {
  let data: any[] = [];
  let filename = "";

  if (type === "players") {
    data = [
      { name: "Arjun Sharma", hostel: "Hostel 7", year: "3rd", category: "Best", skills: "Smash, Net play" },
      { name: "Rahul Verma", hostel: "Hostel 3", year: "1st", category: "Good", skills: "Defense" },
    ];
    filename = "HBL_Players_Template.xlsx";
  } else {
    data = [
      { name: "John Doe", email: "john@hostel.edu", password: "Captain@123", hostel: "Hostel 1", teamName: "H1 Warriors", color: "#6366f1" },
      { name: "Jane Smith", email: "jane@hostel.edu", password: "Captain@123", hostel: "Hostel 2", teamName: "H2 Titans", color: "#f59e0b" },
    ];
    filename = "HBL_Captains_Template.xlsx";
  }

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Template");
  XLSX.writeFile(wb, filename);
}

/**
 * Parses an Excel file and returns JSON data
 */
export function parseExcel(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(sheet);
        resolve(json);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsBinaryString(file);
  });
}
