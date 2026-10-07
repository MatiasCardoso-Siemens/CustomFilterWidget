import { useState } from "react";
import classNames from "classnames";
import { Check, ChevronDown, ChevronUp } from "lucide-react";

export function ButtonFilter({
    label,
    placeholder = "Todos",
    selectionMode = "multi",
    controlType = "buttons", // "buttons" | "checkboxes"
    options = [],
    selectedValue,
    onChange,
    showCounts = true,
    maxVisible = 8,
    disabled = false,
    showHeader = true,
    text = {}
}) {
    const [isExpanded, setIsExpanded] = useState(false);
    const isMulti = selectionMode === "multi";

    const selectedArray = Array.isArray(selectedValue) ? selectedValue : selectedValue ? [selectedValue] : [];

    const hasSelection = isMulti ? selectedArray.length > 0 : Boolean(selectedValue);

    function handleSingleToggle(value) {
        if (selectedValue === value) {
            onChange(""); // Desmarca
        } else {
            onChange(value);
        }
    }

    function handleMultiToggle(value) {
        if (selectedArray.includes(value)) {
            onChange(selectedArray.filter(v => v !== value));
        } else {
            onChange([...selectedArray, value]);
        }
    }

    function handleToggleAll() {
        onChange(isMulti ? [] : "");
    }

    const visibleOptions = maxVisible > 0 && !isExpanded ? options.slice(0, maxVisible) : options;

    const hasMore = maxVisible > 0 && options.length > maxVisible;

    return (
        <div className={classNames("mx-ifg-btn-filter-group", { "is-disabled": disabled })}>
            {showHeader && (
                <div className="mx-ifg-btn-filter-header">
                    <span className="mx-ifg-filter-label">{label}</span>
                    {hasSelection && (
                        <button
                            type="button"
                            className="mx-ifg-filter-quick-clear"
                            onClick={handleToggleAll}
                            title={text.clear || "Limpar este filtro"}
                        >
                            {text.clear || "Limpar"}
                        </button>
                    )}
                </div>
            )}

            {controlType === "checkboxes" ? (
                /* Checkbox List layout */
                <div className="mx-ifg-checkbox-list">
                    {visibleOptions.map(opt => {
                        const isSelected = isMulti ? selectedArray.includes(opt.value) : selectedValue === opt.value;

                        return (
                            <button
                                type="button"
                                key={opt.value}
                                className={classNames("mx-ifg-checkbox-item", { "is-checked": isSelected })}
                                onClick={() => (isMulti ? handleMultiToggle(opt.value) : handleSingleToggle(opt.value))}
                                disabled={disabled}
                            >
                                <span className={classNames("mx-ifg-checkbox-box", { "is-checked": isSelected })}>
                                    {isSelected && <Check size={12} strokeWidth={3} />}
                                </span>
                                <span className="mx-ifg-checkbox-label" title={opt.label}>
                                    {opt.label}
                                </span>
                                {showCounts && typeof opt.count === "number" && (
                                    <span className="mx-ifg-checkbox-badge">{opt.count}</span>
                                )}
                            </button>
                        );
                    })}
                </div>
            ) : (
                /* Buttons / Chips layout */
                <div className="mx-ifg-chips-container">
                    {/* Botão Todos */}
                    {!isMulti && (
                        <button
                            type="button"
                            className={classNames("mx-ifg-filter-chip-btn", {
                                "is-active": !hasSelection
                            })}
                            onClick={handleToggleAll}
                            disabled={disabled}
                        >
                            <span>{placeholder}</span>
                        </button>
                    )}

                    {visibleOptions.map(opt => {
                        const isSelected = isMulti ? selectedArray.includes(opt.value) : selectedValue === opt.value;

                        return (
                            <button
                                type="button"
                                key={opt.value}
                                className={classNames("mx-ifg-filter-chip-btn", {
                                    "is-active": isSelected
                                })}
                                onClick={() => (isMulti ? handleMultiToggle(opt.value) : handleSingleToggle(opt.value))}
                                disabled={disabled}
                                title={opt.label}
                            >
                                {isMulti && (
                                    <span className={classNames("mx-ifg-chip-checkbox", { "is-checked": isSelected })}>
                                        {isSelected && <Check size={11} strokeWidth={3} />}
                                    </span>
                                )}
                                <span className="mx-ifg-chip-text">{opt.label}</span>
                                {showCounts && typeof opt.count === "number" && (
                                    <span className="mx-ifg-chip-count">{opt.count}</span>
                                )}
                            </button>
                        );
                    })}
                </div>
            )}

            {hasMore && (
                <button type="button" className="mx-ifg-show-more-btn" onClick={() => setIsExpanded(prev => !prev)}>
                    {isExpanded ? (
                        <>
                            <span>{text.showLess || "Mostrar menos"}</span>
                            <ChevronUp size={13} />
                        </>
                    ) : (
                        <>
                            <span>
                                + {options.length - maxVisible} {text.moreOptions || "opções"}
                            </span>
                            <ChevronDown size={13} />
                        </>
                    )}
                </button>
            )}

            {options.length === 0 && (
                <div className="mx-ifg-filter-empty-msg">{text.noOptions || "Nenhuma opção disponível"}</div>
            )}
        </div>
    );
}
