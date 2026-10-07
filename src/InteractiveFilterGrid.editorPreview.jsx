export function preview(props) {
    const filters = props.filterList || [];
    const columns = props.columnList || [];
    const isSidebar = props.filterLayout === "sidebar" || props.filterLayout === "sidebarRight";

    return (
        <div
            style={{
                border: "1px solid #d8dee5",
                borderRadius: "8px",
                padding: "14px",
                background: "#ffffff",
                fontFamily: "Segoe UI, sans-serif"
            }}
        >
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "12px",
                    borderBottom: "1px solid #edf0f2",
                    paddingBottom: "8px"
                }}
            >
                <strong style={{ fontSize: "14px", color: "#1f2937" }}>{props.panelTitle || "Filtros"}</strong>
                <span style={{ fontSize: "12px", color: "#6b7280" }}>
                    Layout: {isSidebar ? "Painel Lateral" : "Superior"} | {filters.length} filtro(s)
                </span>
            </div>

            <div
                style={{
                    display: "flex",
                    gap: "16px",
                    flexDirection: props.filterLayout === "sidebarRight" ? "row-reverse" : isSidebar ? "row" : "column"
                }}
            >
                {/* Filters preview */}
                <div
                    style={{
                        width: isSidebar ? "240px" : "100%",
                        background: "#f8fafc",
                        padding: "10px",
                        borderRadius: "6px",
                        border: "1px solid #e2e8f0"
                    }}
                >
                    <div style={{ fontSize: "12px", fontWeight: "bold", color: "#475569", marginBottom: "8px" }}>
                        Filtros Configurados
                    </div>
                    <div
                        style={{
                            display: "flex",
                            flexDirection: isSidebar ? "column" : "row",
                            flexWrap: "wrap",
                            gap: "8px"
                        }}
                    >
                        {filters.map((f, i) => (
                            <div key={i} style={{ minWidth: "120px" }}>
                                <div style={{ fontSize: "11px", fontWeight: "600", color: "#64748b" }}>
                                    {f.filterLabel || `Filtro ${i + 1}`}
                                </div>
                                <div
                                    style={{
                                        display: "inline-block",
                                        background: "#e0f2fe",
                                        color: "#0369a1",
                                        fontSize: "11px",
                                        padding: "2px 8px",
                                        borderRadius: "10px",
                                        marginTop: "2px"
                                    }}
                                >
                                    {f.filterControlType === "buttons"
                                        ? "Chips/Botões"
                                        : f.filterControlType === "checkboxes"
                                        ? "Checkboxes"
                                        : "Combobox"}
                                </div>
                            </div>
                        ))}
                        {filters.length === 0 && (
                            <div style={{ fontSize: "11px", color: "#94a3b8", fontStyle: "italic" }}>
                                Nenhum filtro configurado.
                            </div>
                        )}
                    </div>
                </div>

                {/* Table preview */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                        <thead>
                            <tr style={{ background: "#f1f5f9", borderBottom: "2px solid #e2e8f0" }}>
                                {columns.map((c, i) => (
                                    <th
                                        key={i}
                                        style={{
                                            textAlign: c.columnAlignment || "left",
                                            padding: "8px 10px",
                                            color: "#334155"
                                        }}
                                    >
                                        {c.columnHeader || `Coluna ${i + 1}`}
                                    </th>
                                ))}
                                {columns.length === 0 && (
                                    <th style={{ padding: "8px 10px" }}>Nenhuma coluna configurada</th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                                {columns.map((_, i) => (
                                    <td key={i} style={{ padding: "8px 10px", color: "#64748b" }}>
                                        Dado de exemplo
                                    </td>
                                ))}
                                {columns.length === 0 && <td style={{ padding: "8px 10px" }}>-</td>}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export function getPreviewOverlay() {
    return null;
}
