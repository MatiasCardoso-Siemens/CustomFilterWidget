import ExcelJS from "exceljs";

function cellValue(column, item, readValue) {
    const { raw, display } = readValue(column.columnAttribute, item);
    if (raw === null || raw === undefined) return null;

    if (column.columnRenderAsHtml) {
        const parsed = new DOMParser().parseFromString(String(raw), "text/html");
        parsed.querySelectorAll("script, style").forEach(element => element.remove());
        parsed.querySelectorAll("br").forEach(element => element.replaceWith("\n"));
        parsed.querySelectorAll("p, div, li").forEach(element => element.append("\n"));
        return parsed.body.textContent.trim();
    }

    if (typeof raw === "string" && column.columnRenderAsTags !== false) {
        const delimiter = column.columnDelimiter || "||";
        if (raw.includes(delimiter)) {
            return Array.from(new Set(raw.split(delimiter).map(value => value.trim()).filter(Boolean))).join("; ");
        }
    }

    if (raw instanceof Date || typeof raw === "number" || typeof raw === "boolean") return raw;
    return String(display ?? raw);
}

export function createExportWorkbook(columns, items, readValue) {
    if (items.length > 1048575 || columns.length > 16384) {
        throw new Error("O resultado excede o limite de linhas ou colunas do Excel.");
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Registros filtrados");
    worksheet.addRow(columns.map((column, index) => column.columnHeader || `Coluna ${index + 1}`));
    items.forEach(item => {
        const row = worksheet.addRow(columns.map(column => cellValue(column, item, readValue)));
        row.eachCell(cell => {
            if (cell.value instanceof Date) cell.numFmt = "dd/mm/yyyy hh:mm:ss";
            cell.alignment = { vertical: "top", wrapText: true };
        });
    });
    worksheet.getRow(1).font = { bold: true };
    worksheet.views = [{ state: "frozen", ySplit: 1 }];
    if (columns.length > 0) {
        worksheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: columns.length } };
        columns.forEach((column, index) => {
            worksheet.getColumn(index + 1).width = Math.min(50, Math.max(20, (column.columnHeader || "").length + 2));
        });
    }
    return workbook;
}

export async function downloadFilteredExcel(columns, items, readValue) {
    const workbook = createExportWorkbook(columns, items, readValue);
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    try {
        link.href = url;
        link.download = `registros-filtrados-${new Date().toISOString().slice(0, 10)}.xlsx`;
        document.body.appendChild(link);
        link.click();
    } finally {
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
}