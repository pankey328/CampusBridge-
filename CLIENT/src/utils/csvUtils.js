export const downloadJSONasCSV = (dataArray, filename = "data.csv") => {
  if (!dataArray || !dataArray.length) {
    console.warn("No data available to download.");
    return;
  }

  const headers = Object.keys(dataArray[0]);

  const csvRows = [];

  csvRows.push(headers.map((header) => `"${header}"`).join(","));

  for (const row of dataArray) {
    const values = headers.map((header) => {
      let val = row[header];
      if (val === null || val === undefined) {
        val = "";
      }
      const stringVal = String(val).replace(/"/g, '""');
      return `"${stringVal}"`;
    });
    csvRows.push(values.join(","));
  }

  const csvString = csvRows.join("\n");

  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
