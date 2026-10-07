import classNames from "classnames";
import { ArrowDown, ArrowUp, ArrowUpDown, Inbox } from "lucide-react";

function resolveSafeLinkHref(value) {
    if (typeof value !== "string" || !value.trim()) return "";

    const href = value.trim();
    try {
        const baseUrl = typeof window !== "undefined" ? window.location.href : "https://localhost/";
        const protocol = new URL(href, baseUrl).protocol;
        return ["http:", "https:", "mailto:", "tel:"].includes(protocol) ? href : "";
    } catch {
        return "";
    }
}

function renderCellValue(col, item, readValue) {
    const valueObj = readValue(col.columnAttribute, item);
    if (col.columnRenderAsLink) {
        const linkValue = col.columnLinkExpression?.get(item)?.value;
        const href = resolveSafeLinkHref(linkValue);
        const label = valueObj.display || "";

        if (!label) return <span className="mx-ifg-empty-cell">-</span>;
        if (!href) return label;

        return (
            <a className="mx-ifg-cell-link" href={href} title={label} onClick={event => event.stopPropagation()}>
                {label}
            </a>
        );
    }

    const isHtml = Boolean(col.columnRenderAsHtml);
    const rawHtml = valueObj.raw !== null && valueObj.raw !== undefined ? String(valueObj.raw) : valueObj.display;

    if (isHtml) {
        return rawHtml ? (
            <div className="mx-ifg-cell-html" dangerouslySetInnerHTML={{ __html: rawHtml }} />
        ) : (
            <span className="mx-ifg-empty-cell">-</span>
        );
    }

    const rawStr =
        typeof valueObj.raw === "string" ? valueObj.raw : typeof valueObj.display === "string" ? valueObj.display : "";
    const shouldRenderTags =
        col.columnRenderAsTags !== false &&
        (rawStr.includes("||") || (col.columnDelimiter && rawStr.includes(col.columnDelimiter)));

    if (shouldRenderTags && rawStr) {
        const delimiter = col.columnDelimiter || "||";
        const tags = Array.from(
            new Set(
                rawStr
                    .split(delimiter)
                    .map(s => s.trim())
                    .filter(Boolean)
            )
        );

        if (tags.length > 0) {
            return (
                <div className="mx-ifg-cell-tags">
                    {tags.map((tag, tIdx) => (
                        <span key={tIdx} className="mx-ifg-cell-tag" title={tag}>
                            {tag}
                        </span>
                    ))}
                </div>
            );
        }
    }

    return valueObj.display || <span className="mx-ifg-empty-cell">-</span>;
}

export function DataTable({
    columns = [],
    items = [],
    sortColumnIndex = -1,
    sortDirection = "asc",
    onSortChange,
    onRowClick,
    readValue,
    emptyMessage = "Nenhum registro encontrado para os filtros selecionados.",
    hasActiveFilters = false,
    onResetAll,
    text = {}
}) {
    function handleHeaderClick(index, isSortable) {
        if (!isSortable) return;
        if (sortColumnIndex === index) {
            if (sortDirection === "asc") {
                onSortChange(index, "desc");
            } else {
                onSortChange(-1, "asc"); // Reset sort
            }
        } else {
            onSortChange(index, "asc");
        }
    }

    return (
        <div className="mx-ifg-table-wrapper">
            <table className="mx-ifg-table">
                <thead>
                    <tr>
                        {columns.map((col, index) => {
                            const isSorted = sortColumnIndex === index;
                            const isSortable = col.columnSortable !== false;
                            const alignment = col.columnAlignment || "left";
                            const widthStyle = col.columnWidth
                                ? { width: col.columnWidth, minWidth: col.columnWidth }
                                : { minWidth: "140px" };

                            return (
                                <th
                                    key={index}
                                    style={widthStyle}
                                    className={classNames(`align-${alignment}`, {
                                        "is-sortable": isSortable,
                                        "is-sorted": isSorted
                                    })}
                                    onClick={() => handleHeaderClick(index, isSortable)}
                                >
                                    <div className={`mx-ifg-th-content justify-${alignment}`}>
                                        <span>{col.columnHeader || `Coluna ${index + 1}`}</span>
                                        {isSortable && (
                                            <span className="mx-ifg-sort-icon">
                                                {isSorted ? (
                                                    sortDirection === "asc" ? (
                                                        <ArrowUp size={14} className="is-active" />
                                                    ) : (
                                                        <ArrowDown size={14} className="is-active" />
                                                    )
                                                ) : (
                                                    <ArrowUpDown size={13} className="is-dimmed" />
                                                )}
                                            </span>
                                        )}
                                    </div>
                                </th>
                            );
                        })}
                    </tr>
                </thead>
                <tbody>
                    {items.length > 0 ? (
                        items.map((item, rowIndex) => {
                            const isClickable = Boolean(onRowClick);

                            return (
                                <tr
                                    key={item.id || rowIndex}
                                    className={classNames({ "is-clickable": isClickable })}
                                    onClick={() => {
                                        if (onRowClick) {
                                            const action = onRowClick.get(item);
                                            if (action?.canExecute) {
                                                action.execute();
                                            }
                                        }
                                    }}
                                >
                                    {columns.map((col, colIndex) => {
                                        const alignment = col.columnAlignment || "left";
                                        const widthStyle = col.columnWidth
                                            ? { width: col.columnWidth, minWidth: col.columnWidth }
                                            : { minWidth: "140px" };

                                        return (
                                            <td key={colIndex} style={widthStyle} className={`align-${alignment}`}>
                                                {renderCellValue(col, item, readValue)}
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan={Math.max(columns.length, 1)} className="mx-ifg-empty-row">
                                <div className="mx-ifg-empty-state">
                                    <Inbox size={36} className="mx-ifg-empty-icon" />
                                    <p className="mx-ifg-empty-text">{emptyMessage}</p>
                                    {hasActiveFilters && onResetAll && (
                                        <button type="button" className="mx-ifg-empty-reset-btn" onClick={onResetAll}>
                                            {text.clearAppliedFilters || "Limpar filtros aplicados"}
                                        </button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
