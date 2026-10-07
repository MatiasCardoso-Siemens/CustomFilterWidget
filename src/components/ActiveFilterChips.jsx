import { X } from "lucide-react";

export function ActiveFilterChips({
    filters = [],
    filterOptionsList = [],
    activeFilters = {},
    globalSearchQuery = "",
    presetFilterLabel = "Grupo de ativos",
    presetFilterValue = "",
    presetFilterOptions = [],
    onFilterChange,
    onPresetFilterChange,
    onGlobalSearchChange,
    onResetAll,
    text = {}
}) {
    const hasFilterSelections = Object.values(activeFilters).some(v => v && (!Array.isArray(v) || v.length > 0));
    const hasActive = hasFilterSelections || Boolean(presetFilterValue) || Boolean(globalSearchQuery.trim());

    if (!hasActive) return null;

    return (
        <div className="mx-ifg-active-chips-container">
            <span className="mx-ifg-active-chips-title">{text.appliedFilters || "Filtros aplicados:"}</span>
            <div className="mx-ifg-active-chips-flow">
                {filters.map((filter, index) => {
                    const val = activeFilters[index];
                    if (!val || (Array.isArray(val) && val.length === 0)) return null;

                    const options = filterOptionsList[index] || [];
                    const labelText = Array.isArray(val)
                        ? val.map(v => options.find(o => o.value === v)?.label || v).join(", ")
                        : options.find(o => o.value === val)?.label || val;

                    return (
                        <span key={index} className="mx-ifg-active-tag">
                            <span className="mx-ifg-tag-label">{filter.filterLabel}:</span>
                            <span className="mx-ifg-tag-value">{labelText}</span>
                            <button
                                type="button"
                                className="mx-ifg-tag-close-btn"
                                onClick={() => onFilterChange(index, Array.isArray(val) ? [] : "")}
                                title={`${text.removeFilter || "Remover filtro"} ${filter.filterLabel}`}
                            >
                                <X size={12} />
                            </button>
                        </span>
                    );
                })}

                {presetFilterValue && (
                    <span className="mx-ifg-active-tag">
                        <span className="mx-ifg-tag-label">{presetFilterLabel}:</span>
                        <span className="mx-ifg-tag-value">
                            {presetFilterOptions.find(option => option.value === presetFilterValue)?.label ||
                                presetFilterValue}
                        </span>
                        <button
                            type="button"
                            className="mx-ifg-tag-close-btn"
                            onClick={() => onPresetFilterChange("")}
                            title={`${text.removeFilter || "Remover filtro"} ${presetFilterLabel}`}
                        >
                            <X size={12} />
                        </button>
                    </span>
                )}

                {globalSearchQuery && (
                    <span className="mx-ifg-active-tag is-search-tag">
                        <span className="mx-ifg-tag-label">{text.searchLabel || "Busca:"}</span>
                        <span className="mx-ifg-tag-value">"{globalSearchQuery}"</span>
                        <button
                            type="button"
                            className="mx-ifg-tag-close-btn"
                            onClick={() => onGlobalSearchChange("")}
                            title={text.clearSearch || "Remover busca"}
                        >
                            <X size={12} />
                        </button>
                    </span>
                )}

                <button type="button" className="mx-ifg-clear-all-link" onClick={onResetAll}>
                    {text.clearAll || "Limpar todos"}
                </button>
            </div>
        </div>
    );
}
