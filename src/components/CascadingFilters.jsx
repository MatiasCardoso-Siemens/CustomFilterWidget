import { useId, useState } from "react";
import classNames from "classnames";
import { ChevronDown, ChevronLeft, ChevronRight, Search, SlidersHorizontal, X } from "lucide-react";
import { ButtonFilter } from "./ButtonFilter";
import { ComboboxFilter } from "./ComboboxFilter";

export function CascadingFilters({
    filters = [],
    filterOptionsList = [],
    activeFilters = {},
    onFilterChange,
    panelTitle = "Filtros",
    panelDescription = "Combine os filtros para refinar os requisitos",
    layout = "sidebar", // "sidebar" | "sidebarRight" | "top"
    isSidebarOpen = true,
    onToggleSidebar,
    sidebarWidth = "280px",
    enableGlobalSearch = true,
    globalSearchQuery = "",
    onGlobalSearchChange,
    globalSearchPlaceholder = "Pesquisar nos registros...",
    totalCount = 0,
    filteredCount = 0,
    text = {}
}) {
    const isSidebar = layout === "sidebar" || layout === "sidebarRight";
    const [collapsedFilters, setCollapsedFilters] = useState({});
    const idPrefix = useId();

    return (
        <aside
            className={classNames("mx-ifg-filters-panel", `is-layout-${layout}`, {
                "is-sidebar-collapsed": isSidebar && !isSidebarOpen
            })}
            style={isSidebar && isSidebarOpen ? { width: sidebarWidth, minWidth: sidebarWidth } : {}}
        >
            <div className="mx-ifg-panel-header">
                <div className="mx-ifg-panel-title-group">
                    {!isSidebar && <SlidersHorizontal size={16} className="mx-ifg-panel-icon" />}
                    {(!isSidebar || isSidebarOpen) && panelTitle && (
                        <span className="mx-ifg-panel-title">{panelTitle}</span>
                    )}
                    {!isSidebar && (
                        <span className="mx-ifg-count-badge">
                            {filteredCount === totalCount
                                ? `${totalCount} ${text.items || "itens"}`
                                : `${filteredCount}/${totalCount}`}
                        </span>
                    )}
                </div>

                <div className="mx-ifg-panel-header-actions">
                    {isSidebar && onToggleSidebar && (
                        <button
                            type="button"
                            className="mx-ifg-toggle-sidebar-btn"
                            onClick={onToggleSidebar}
                            title={
                                isSidebarOpen
                                    ? text.collapseFilters || "Recolher painel de filtros"
                                    : text.expandFilters || "Expandir painel de filtros"
                            }
                        >
                            {layout === "sidebar" ? (
                                isSidebarOpen ? (
                                    <ChevronLeft size={16} />
                                ) : (
                                    <ChevronRight size={16} />
                                )
                            ) : isSidebarOpen ? (
                                <ChevronRight size={16} />
                            ) : (
                                <ChevronLeft size={16} />
                            )}
                        </button>
                    )}
                </div>
            </div>

            {isSidebar && isSidebarOpen && panelDescription && (
                <div className="mx-ifg-sidebar-intro">
                    <p className="mx-ifg-panel-description">{panelDescription}</p>
                </div>
            )}

            {/* Global Search inside sidebar or top */}
            {enableGlobalSearch && (!isSidebar || isSidebarOpen) && (
                <div className="mx-ifg-panel-search-box">
                    <Search size={14} className="mx-ifg-search-icon" />
                    <input
                        type="text"
                        className="mx-ifg-global-search-input"
                        placeholder={globalSearchPlaceholder}
                        value={globalSearchQuery}
                        onChange={e => onGlobalSearchChange(e.target.value)}
                    />
                    {globalSearchQuery && (
                        <button
                            type="button"
                            className="mx-ifg-search-clear"
                            onClick={() => onGlobalSearchChange("")}
                            title={text.clearSearch || "Limpar pesquisa"}
                        >
                            <X size={13} />
                        </button>
                    )}
                </div>
            )}

            {/* Filter controls container */}
            {(!isSidebar || isSidebarOpen) && (
                <div className={classNames("mx-ifg-filters-body", `body-${layout}`)}>
                    {filters.map((filter, index) => {
                        const options = filterOptionsList[index] || [];
                        const selectedValue = activeFilters[index];
                        const isDisabled = index > 0 && filterOptionsList[index]?.length === 0;
                        const controlType = filter.filterControlType || "buttons";

                        if (isSidebar) {
                            const isCollapsed = Boolean(collapsedFilters[index]);
                            const optionsId = `${idPrefix}-filter-${index}-options`;

                            return (
                                <section className="mx-ifg-filter-groupbox" key={index}>
                                    <button
                                        type="button"
                                        className="mx-ifg-filter-groupbox-header"
                                        aria-expanded={!isCollapsed}
                                        aria-controls={optionsId}
                                        onClick={() =>
                                            setCollapsedFilters(prev => ({ ...prev, [index]: !prev[index] }))
                                        }
                                    >
                                        <span>{filter.filterLabel || `Filtro ${index + 1}`}</span>
                                        <ChevronDown
                                            size={15}
                                            className={classNames("mx-ifg-filter-groupbox-chevron", {
                                                "is-expanded": !isCollapsed
                                            })}
                                            aria-hidden="true"
                                        />
                                    </button>
                                    <div id={optionsId} className="mx-ifg-filter-groupbox-body" hidden={isCollapsed}>
                                        <ButtonFilter
                                            label={filter.filterLabel || `Filtro ${index + 1}`}
                                            placeholder={filter.filterPlaceholder || "Todos"}
                                            selectionMode={filter.filterSelectionMode || "multi"}
                                            controlType="checkboxes"
                                            options={options}
                                            selectedValue={selectedValue}
                                            onChange={val => onFilterChange(index, val)}
                                            showCounts={false}
                                            maxVisible={filter.filterMaxVisibleButtons ?? 8}
                                            disabled={isDisabled}
                                            showHeader={false}
                                            text={text}
                                        />
                                    </div>
                                </section>
                            );
                        }

                        if (controlType === "combobox") {
                            return (
                                <ComboboxFilter
                                    key={index}
                                    label={filter.filterLabel || `Filtro ${index + 1}`}
                                    placeholder={filter.filterPlaceholder || "Todos"}
                                    mode={filter.filterSelectionMode || "multi"}
                                    options={options}
                                    selectedValue={selectedValue}
                                    onChange={val => onFilterChange(index, val)}
                                    disabled={isDisabled}
                                    text={text}
                                />
                            );
                        }

                        return (
                            <ButtonFilter
                                key={index}
                                label={filter.filterLabel || `Filtro ${index + 1}`}
                                placeholder={filter.filterPlaceholder || "Todos"}
                                selectionMode={filter.filterSelectionMode || "multi"}
                                controlType={controlType}
                                options={options}
                                selectedValue={selectedValue}
                                onChange={val => onFilterChange(index, val)}
                                showCounts={filter.filterShowCounts !== false}
                                maxVisible={filter.filterMaxVisibleButtons ?? 8}
                                disabled={isDisabled}
                                text={text}
                            />
                        );
                    })}
                </div>
            )}
        </aside>
    );
}
