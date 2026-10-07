import { useEffect, useMemo, useRef, useState } from "react";
import classNames from "classnames";
import { Download } from "lucide-react";
import { ActiveFilterChips } from "./components/ActiveFilterChips";
import { CascadingFilters } from "./components/CascadingFilters";
import { ComboboxFilter } from "./components/ComboboxFilter";
import { DataTable } from "./components/DataTable";
import { Pagination } from "./components/Pagination";
import { downloadFilteredExcel } from "./utils/exportExcel.mjs";
import "./ui/InteractiveFilterGrid.css";

function resolveItems(dataSource) {
    return Array.isArray(dataSource?.items) ? dataSource.items : [];
}

function resolveTextTemplate(textTemplate, fallback = "") {
    const value = typeof textTemplate === "string" ? textTemplate : textTemplate?.value;
    return typeof value === "string" && value.trim() ? value : fallback;
}

function readValue(attribute, item) {
    if (!attribute || !item) return { raw: null, display: "" };
    const value = attribute.get(item);
    const raw = value?.value;
    if (raw === null || raw === undefined) return { raw: null, display: "" };
    return { raw, display: value.displayValue ?? String(raw) };
}

function valueToken(value) {
    const raw = value.raw;
    if (raw === null || raw === undefined) return "";
    if (raw instanceof Date) return raw.toISOString();
    if (typeof raw.toString === "function") return raw.toString();
    return String(raw);
}

export function splitTokens(str, delimiter) {
    if (!str || typeof str !== "string") return [];
    const delim = delimiter !== undefined && delimiter !== null && delimiter !== "" ? delimiter : "||";

    if (str.includes(delim)) {
        return str
            .split(delim)
            .map(s => s.trim())
            .filter(Boolean);
    }

    if (str.includes("||")) {
        return str
            .split("||")
            .map(s => s.trim())
            .filter(Boolean);
    }

    const trimmed = str.trim();
    return trimmed ? [trimmed] : [];
}

export function extractTokensFromItem(attribute, item, delimiter) {
    const valObj = readValue(attribute, item);
    const raw = valObj.raw;
    if (raw === null || raw === undefined) return [];

    if (typeof raw === "string") {
        const tokens = splitTokens(raw, delimiter);
        return Array.from(new Set(tokens));
    }

    const token = valueToken(valObj);
    return token ? [token] : [];
}

function buildDistinctOptionsWithCount(items, attribute, delimiter) {
    const map = new Map();
    items.forEach(item => {
        const tokens = extractTokensFromItem(attribute, item, delimiter);
        tokens.forEach(token => {
            const current = map.get(token);
            if (current) {
                current.count += 1;
            } else {
                map.set(token, {
                    value: token,
                    label: token,
                    count: 1
                });
            }
        });
    });

    return Array.from(map.values()).sort((a, b) =>
        a.label.localeCompare(b.label, undefined, { numeric: true, sensitivity: "base" })
    );
}

function itemMatchesFilter(item, filterDef, selectedVal) {
    if (!selectedVal || (Array.isArray(selectedVal) && selectedVal.length === 0)) {
        return true;
    }
    const itemTokens = extractTokensFromItem(filterDef.filterAttribute, item, filterDef.filterDelimiter);
    if (itemTokens.length === 0) {
        return false;
    }

    if (Array.isArray(selectedVal)) {
        return selectedVal.some(sel => itemTokens.includes(sel));
    }
    return itemTokens.includes(selectedVal);
}

function buildPresetFilterOptions(items, labelAttribute, valueAttribute) {
    const options = new Map();
    items.forEach(item => {
        const label = readValue(labelAttribute, item).display;
        const rawValue = readValue(valueAttribute, item).raw;
        if (!label || rawValue === null || rawValue === undefined) return;

        const value = String(rawValue);
        if (!options.has(value)) options.set(value, { value, label });
    });
    return Array.from(options.values());
}

export function InteractiveFilterGrid(props) {
    const rawItems = resolveItems(props.dataSource);
    const texts = {
        clearFilters: resolveTextTemplate(props.textClearFilters, "Limpar filtros"),
        clear: resolveTextTemplate(props.textClear, "Limpar"),
        clearAll: resolveTextTemplate(props.textClearAll, "Limpar todos"),
        appliedFilters: resolveTextTemplate(props.textAppliedFilters, "Filtros aplicados:"),
        searchLabel: resolveTextTemplate(props.textSearchLabel, "Busca:"),
        searchOptions: resolveTextTemplate(props.textSearchPlaceholder, "Filtrar opções..."),
        clearSearch: resolveTextTemplate(props.textClearSearch, "Limpar pesquisa"),
        collapseFilters: resolveTextTemplate(props.textCollapseFilters, "Recolher painel de filtros"),
        expandFilters: resolveTextTemplate(props.textExpandFilters, "Expandir painel de filtros"),
        noOptions: resolveTextTemplate(props.textNoOptions, "Nenhuma opção disponível"),
        noOptionsFound: resolveTextTemplate(props.textNoOptionsFound, "Nenhuma opção encontrada"),
        all: resolveTextTemplate(props.textAll, "Todos"),
        selected: resolveTextTemplate(props.textSelected, "selecionados"),
        clearSelection: resolveTextTemplate(props.textClearSelection, "Limpar seleção"),
        showLess: resolveTextTemplate(props.textShowLess, "Mostrar menos"),
        moreOptions: resolveTextTemplate(props.textMoreOptions, "opções"),
        removeFilter: resolveTextTemplate(props.textRemoveFilter, "Remover filtro"),
        clearAppliedFilters: resolveTextTemplate(props.textClearAppliedFilters, "Limpar filtros aplicados"),
        items: resolveTextTemplate(props.textItems, "itens"),
        pageSize: resolveTextTemplate(props.textPageSize, "Itens por página:"),
        showing: resolveTextTemplate(props.textShowing, "Mostrando"),
        to: resolveTextTemplate(props.textTo, "a"),
        of: resolveTextTemplate(props.textOf, "de"),
        page: resolveTextTemplate(props.textPage, "Página"),
        firstPage: resolveTextTemplate(props.textFirstPage, "Primeira página"),
        previousPage: resolveTextTemplate(props.textPreviousPage, "Página anterior"),
        nextPage: resolveTextTemplate(props.textNextPage, "Próxima página"),
        lastPage: resolveTextTemplate(props.textLastPage, "Última página"),
        exportTitle: resolveTextTemplate(props.textExportTitle, "Exportar registros filtrados para Excel"),
        exportExcel: resolveTextTemplate(props.textExportExcel, "Exportar Excel"),
        exporting: resolveTextTemplate(props.textExporting, "Exportando..."),
        exportError: resolveTextTemplate(
            props.textExportError,
            "Não foi possível exportar para Excel. Tente novamente ou reduza o resultado com os filtros."
        )
    };
    const filters = useMemo(
        () =>
            (props.filterList || []).map((filter, index) => ({
                ...filter,
                filterLabel: resolveTextTemplate(filter.filterLabelText, filter.filterLabel || `Filtro ${index + 1}`),
                filterPlaceholder: resolveTextTemplate(
                    filter.filterPlaceholderText,
                    filter.filterPlaceholder || texts.all
                )
            })),
        [props.filterList, texts.all]
    );
    const columns = useMemo(
        () =>
            (props.columnList || []).map((column, index) => ({
                ...column,
                columnHeader: resolveTextTemplate(column.columnHeaderText, column.columnHeader || `Coluna ${index + 1}`)
            })),
        [props.columnList]
    );
    const filterLayout = props.filterLayout || "sidebar";
    const hasPresetFilter = props.enablePresetFilter === true;
    const presetFilterItems = resolveItems(props.presetFilterDataSource);
    const panelTitle = resolveTextTemplate(props.panelTitleText, props.panelTitle || "Filtros");
    const panelDescription = resolveTextTemplate(
        props.panelDescriptionText,
        props.panelDescription || "Combine os filtros para refinar os requisitos"
    );
    const globalSearchPlaceholder = resolveTextTemplate(
        props.globalSearchPlaceholderText,
        props.globalSearchPlaceholder || "Pesquisar nos registros..."
    );
    const emptyMessage = resolveTextTemplate(
        props.emptyMessageText,
        props.emptyMessage || "Nenhum registro encontrado para os filtros selecionados."
    );
    const presetFilterLabel = resolveTextTemplate(
        props.presetFilterLabelText,
        props.presetFilterLabel || "Grupo de ativos"
    );
    const presetFilterPlaceholder = resolveTextTemplate(
        props.presetFilterPlaceholderText,
        props.presetFilterPlaceholder || "Selecione um grupo..."
    );

    const [activeFilters, setActiveFilters] = useState({});
    const [activePresetFilter, setActivePresetFilter] = useState("");
    const [globalSearch, setGlobalSearch] = useState("");
    const [sortState, setSortState] = useState({ index: -1, direction: "asc" });
    const [pageSize, setPageSize] = useState(props.defaultPageSize || 20);
    const [currentPage, setCurrentPage] = useState(1);
    const [isExporting, setIsExporting] = useState(false);
    const [exportError, setExportError] = useState("");
    const [isSidebarOpen, setIsSidebarOpen] = useState(
        props.sidebarDefaultOpen !== undefined ? props.sidebarDefaultOpen : true
    );

    const presetFilterOptions = useMemo(
        () => buildPresetFilterOptions(presetFilterItems, props.presetFilterOptionLabel, props.presetFilterOptionValue),
        [presetFilterItems, props.presetFilterOptionLabel, props.presetFilterOptionValue]
    );

    function itemMatchesPresetFilter(item, selectedValue = activePresetFilter) {
        if (!selectedValue) return true;
        const rawValue = readValue(props.presetFilterTargetAttribute, item).raw;
        return (
            rawValue !== null &&
            rawValue !== undefined &&
            String(rawValue).toLowerCase().includes(selectedValue.toLowerCase())
        );
    }

    // 1. Compute cascading filter options hierarchically (from top filter to bottom filter)
    const filterOptionsList = useMemo(() => {
        const optionsPerFilter = [];
        let runningSubset =
            hasPresetFilter && activePresetFilter ? rawItems.filter(item => itemMatchesPresetFilter(item)) : rawItems;

        for (let i = 0; i < filters.length; i++) {
            const filterDef = filters[i];
            const options = buildDistinctOptionsWithCount(
                runningSubset,
                filterDef.filterAttribute,
                filterDef.filterDelimiter
            );
            optionsPerFilter.push(options);

            // Filter subset down by this filter's active selection before calculating the NEXT filter's options
            const currentSelection = activeFilters[i];
            if (currentSelection && (!Array.isArray(currentSelection) || currentSelection.length > 0)) {
                runningSubset = runningSubset.filter(item => itemMatchesFilter(item, filterDef, currentSelection));
            }
        }

        return optionsPerFilter;
    }, [rawItems, filters, activeFilters, hasPresetFilter, activePresetFilter, props.presetFilterTargetAttribute]);

    // 2. Filter all rows for table display
    const filteredItems = useMemo(() => {
        return rawItems.filter(item => {
            if (hasPresetFilter && !itemMatchesPresetFilter(item)) return false;

            // Check all filters
            for (let i = 0; i < filters.length; i++) {
                const selectedVal = activeFilters[i];
                if (!itemMatchesFilter(item, filters[i], selectedVal)) {
                    return false;
                }
            }

            // Check global search across column attributes
            if (globalSearch.trim()) {
                const q = globalSearch.trim().toLowerCase();
                const matchesAnyColumn = columns.some(col => {
                    const val = readValue(col.columnAttribute, item);
                    return val.display.toLowerCase().includes(q);
                });
                if (!matchesAnyColumn) return false;
            }

            return true;
        });
    }, [
        rawItems,
        filters,
        activeFilters,
        globalSearch,
        columns,
        hasPresetFilter,
        activePresetFilter,
        props.presetFilterTargetAttribute
    ]);

    // 3. Sort filtered rows
    const sortedItems = useMemo(() => {
        if (sortState.index < 0 || sortState.index >= columns.length) {
            return filteredItems;
        }

        const targetColumn = columns[sortState.index];
        const isAsc = sortState.direction === "asc";

        return [...filteredItems].sort((a, b) => {
            const valA = readValue(targetColumn.columnAttribute, a);
            const valB = readValue(targetColumn.columnAttribute, b);

            const rawA = valA.raw;
            const rawB = valB.raw;

            if (rawA === null || rawA === undefined) return isAsc ? 1 : -1;
            if (rawB === null || rawB === undefined) return isAsc ? -1 : 1;

            if (typeof rawA === "number" && typeof rawB === "number") {
                return isAsc ? rawA - rawB : rawB - rawA;
            }

            if (rawA instanceof Date && rawB instanceof Date) {
                return isAsc ? rawA.getTime() - rawB.getTime() : rawB.getTime() - rawA.getTime();
            }

            const strA = valA.display;
            const strB = valB.display;
            const cmp = strA.localeCompare(strB, undefined, { numeric: true, sensitivity: "base" });
            return isAsc ? cmp : -cmp;
        });
    }, [filteredItems, sortState, columns]);

    // 4. Pagination
    const totalItems = sortedItems.length;
    const totalPages = Math.ceil(totalItems / pageSize) || 1;
    const paginatedItems = useMemo(() => {
        if (!props.enablePagination) return sortedItems;
        const start = (currentPage - 1) * pageSize;
        return sortedItems.slice(start, start + pageSize);
    }, [sortedItems, currentPage, pageSize, props.enablePagination]);

    // Handlers
    function handleFilterChange(filterIndex, value) {
        setActiveFilters(prev => {
            const next = { ...prev, [filterIndex]: value };

            // If a parent filter changes, reset downstream child filters that might be affected
            for (let j = filterIndex + 1; j < filters.length; j++) {
                if (next[j]) {
                    delete next[j];
                }
            }

            return next;
        });
        setCurrentPage(1);
    }

    function handleResetAll() {
        setActiveFilters({});
        setActivePresetFilter("");
        setGlobalSearch("");
        setCurrentPage(1);
    }

    function handlePresetFilterChange(value) {
        setActivePresetFilter(value);
        setActiveFilters({});
        setCurrentPage(1);
    }

    function handleGlobalSearchChange(val) {
        setGlobalSearch(val);
        setCurrentPage(1);
    }

    function handleSortChange(index, direction) {
        setSortState({ index, direction });
    }

    function handlePageSizeChange(newSize) {
        setPageSize(newSize);
        setCurrentPage(1);
    }

    async function handleExportExcel() {
        if (isExporting || sortedItems.length === 0 || columns.length === 0) return;
        setIsExporting(true);
        setExportError("");
        try {
            await downloadFilteredExcel(columns, sortedItems, readValue);
        } catch (error) {
            setExportError(texts.exportError);
        } finally {
            setIsExporting(false);
        }
    }

    const rootRef = useRef(null);

    useEffect(() => {
        const styleId = "mx-ifg-scroll-fix-style";
        let style = document.getElementById(styleId);
        if (!style) {
            style = document.createElement("style");
            style.id = styleId;
            style.textContent = `
                .mx-ifg-parent-fix,
                .mx-scrollcontainer-center:has(.mx-interactive-filter-grid),
                .mx-scrollcontainer:has(.mx-interactive-filter-grid),
                .mx-scrollcontainer-wrapper:has(.mx-interactive-filter-grid),
                .mx-scrollcontainer-middle:has(.mx-interactive-filter-grid),
                .mx-placeholder:has(.mx-interactive-filter-grid),
                .mx-layoutgrid:has(.mx-interactive-filter-grid),
                .row:has(.mx-interactive-filter-grid),
                [class*="col-"]:has(.mx-interactive-filter-grid) {
                    min-width: 0 !important;
                }
            `;
            document.head.appendChild(style);
        }

        if (rootRef.current) {
            let el = rootRef.current.parentElement;
            while (el && el !== document.body) {
                el.style.minWidth = "0";
                el.classList.add("mx-ifg-parent-fix");
                el = el.parentElement;
            }
        }
    }, []);

    const hasActiveFilters =
        Object.values(activeFilters).some(v => v && (!Array.isArray(v) || v.length > 0)) ||
        Boolean(activePresetFilter) ||
        Boolean(globalSearch.trim());

    const isSidebarLayout = filterLayout === "sidebar" || filterLayout === "sidebarRight";
    const exportToolbar = (
        <div className="mx-ifg-grid-toolbar">
            <button
                type="button"
                className="mx-ifg-export-btn"
                onClick={handleExportExcel}
                disabled={
                    isExporting ||
                    sortedItems.length === 0 ||
                    columns.length === 0 ||
                    props.dataSource?.status !== "available"
                }
                aria-busy={isExporting}
                title={texts.exportTitle}
            >
                <Download size={16} aria-hidden="true" />
                <span>{isExporting ? texts.exporting : texts.exportExcel}</span>
            </button>
        </div>
    );
    const activeFilterChips = (
        <ActiveFilterChips
            filters={filters}
            filterOptionsList={filterOptionsList}
            activeFilters={activeFilters}
            globalSearchQuery={globalSearch}
            onFilterChange={handleFilterChange}
            onGlobalSearchChange={handleGlobalSearchChange}
            onResetAll={handleResetAll}
            presetFilterLabel={presetFilterLabel}
            presetFilterValue={activePresetFilter}
            presetFilterOptions={presetFilterOptions}
            onPresetFilterChange={handlePresetFilterChange}
            text={texts}
        />
    );

    return (
        <div ref={rootRef} className="mx-interactive-filter-grid">
            {hasPresetFilter && (
                <div className="mx-ifg-preset-filter-panel">
                    <ComboboxFilter
                        label={presetFilterLabel}
                        placeholder={presetFilterPlaceholder}
                        mode="single"
                        text={texts}
                        options={presetFilterOptions}
                        selectedValue={activePresetFilter}
                        onChange={handlePresetFilterChange}
                        disabled={presetFilterOptions.length === 0}
                    />
                </div>
            )}
            {isSidebarLayout && exportToolbar}
            {exportError && (
                <div className="mx-ifg-export-error" role="alert">
                    {exportError}
                </div>
            )}
            {isSidebarLayout && activeFilterChips}
            <div className={classNames("mx-ifg-layout-container", `layout-${filterLayout}`)}>
                {/* Filters Panel (Sidebar or Top) */}
                {(filters.length > 0 || hasPresetFilter) && (
                    <CascadingFilters
                        filters={filters}
                        filterOptionsList={filterOptionsList}
                        activeFilters={activeFilters}
                        onFilterChange={handleFilterChange}
                        onResetAll={handleResetAll}
                        hasActiveFilters={hasActiveFilters}
                        panelTitle={panelTitle}
                        panelDescription={panelDescription}
                        layout={filterLayout}
                        isSidebarOpen={isSidebarOpen}
                        onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
                        sidebarWidth={props.sidebarWidth || "280px"}
                        enableGlobalSearch={props.enableGlobalSearch !== false}
                        globalSearchQuery={globalSearch}
                        onGlobalSearchChange={handleGlobalSearchChange}
                        globalSearchPlaceholder={globalSearchPlaceholder}
                        totalCount={rawItems.length}
                        filteredCount={filteredItems.length}
                        text={texts}
                    />
                )}

                {/* Main Content Area (Active Chips + Table + Pagination) */}
                <div className="mx-ifg-main-content">
                    {!isSidebarLayout && exportToolbar}
                    {!isSidebarLayout && exportError && (
                        <div className="mx-ifg-export-error" role="alert">
                            {exportError}
                        </div>
                    )}
                    {!isSidebarLayout && activeFilterChips}

                    <DataTable
                        columns={columns}
                        items={paginatedItems}
                        sortColumnIndex={sortState.index}
                        sortDirection={sortState.direction}
                        onSortChange={handleSortChange}
                        onRowClick={props.onRowClick}
                        readValue={readValue}
                        emptyMessage={emptyMessage}
                        hasActiveFilters={hasActiveFilters}
                        onResetAll={handleResetAll}
                        text={texts}
                    />

                    {props.enablePagination !== false && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            pageSize={pageSize}
                            totalItems={totalItems}
                            onPageChange={setCurrentPage}
                            onPageSizeChange={handlePageSizeChange}
                            text={texts}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
