import assert from "node:assert/strict";
import { test } from "node:test";
import ExcelJS from "exceljs";
import { createExportWorkbook } from "../src/utils/exportExcel.mjs";

const readValue = (attribute, item) => ({ raw: item[attribute], display: String(item[attribute] ?? "") });

test("exports exactly the supplied filtered rows, in order, with configured columns", async () => {
    const columns = [
        { columnHeader: "Nome", columnAttribute: "name" },
        { columnHeader: "Quantidade", columnAttribute: "amount" }
    ];
    const filteredItems = Array.from({ length: 25 }, (_, index) => ({ name: `Item ${25 - index}`, amount: index }));
    const workbook = createExportWorkbook(columns, filteredItems, readValue);
    const restored = new ExcelJS.Workbook();
    await restored.xlsx.load(await workbook.xlsx.writeBuffer());
    const worksheet = restored.worksheets[0];
    assert.equal(worksheet.rowCount, 26);
    assert.deepEqual(worksheet.getRow(1).values.slice(1), ["Nome", "Quantidade"]);
    assert.deepEqual(worksheet.getRow(2).values.slice(1), ["Item 25", 0]);
    assert.deepEqual(worksheet.getRow(26).values.slice(1), ["Item 1", 24]);
});

test("preserves dates, booleans, display labels, empty cells and formula-like text", async () => {
    const date = new Date("2026-10-02T12:30:00Z");
    const columns = ["date", "flag", "empty", "formula", "enum"].map(columnAttribute => ({ columnAttribute }));
    const item = { date, flag: false, empty: null, formula: "=HYPERLINK(\"https://example.com\")", enum: "internal" };
    const workbook = createExportWorkbook(columns, [item], (attribute, row) => ({
        raw: row[attribute], display: attribute === "enum" ? "Label" : String(row[attribute] ?? "")
    }));
    const restored = new ExcelJS.Workbook();
    await restored.xlsx.load(await workbook.xlsx.writeBuffer());
    const row = restored.worksheets[0].getRow(2);
    assert.equal(row.getCell(1).value.toISOString(), date.toISOString());
    assert.equal(row.getCell(2).value, false);
    assert.equal(row.getCell(3).value, null);
    assert.equal(row.getCell(4).value, item.formula);
    assert.equal(row.getCell(5).value, "Label");
});

test("cleans repeated tags and honors custom delimiters and disabled tags", () => {
    const columns = [
        { columnAttribute: "tags" },
        { columnAttribute: "custom", columnDelimiter: ";" },
        { columnAttribute: "tags", columnRenderAsTags: false }
    ];
    const workbook = createExportWorkbook(columns, [{ tags: "||A|| B ||A||", custom: "X;Y;X" }], readValue);
    assert.deepEqual(workbook.worksheets[0].getRow(2).values.slice(1), ["A; B", "X; Y", "||A|| B ||A||"]);
});

test("empty results contain only headers", () => {
    const workbook = createExportWorkbook([{ columnHeader: "Nome", columnAttribute: "name" }], [], readValue);
    assert.equal(workbook.worksheets[0].rowCount, 1);
});