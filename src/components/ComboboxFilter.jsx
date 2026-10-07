import { useEffect, useRef, useState } from "react";
import classNames from "classnames";
import { Check, ChevronDown, Search, X } from "lucide-react";

export function ComboboxFilter({
    label,
    placeholder = "Todos",
    mode = "single",
    options = [],
    selectedValue,
    onChange,
    disabled = false,
    text = {}
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const dropdownRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [isOpen]);

    // Filter options by search
    const filteredOptions = options.filter(opt => opt.label.toLowerCase().includes(searchQuery.toLowerCase()));

    const isMulti = mode === "multi";
    const selectedArray = Array.isArray(selectedValue) ? selectedValue : selectedValue ? [selectedValue] : [];

    function handleSingleSelect(value) {
        onChange(value === selectedValue ? "" : value);
        setIsOpen(false);
    }

    function handleToggleMulti(value) {
        if (selectedArray.includes(value)) {
            onChange(selectedArray.filter(v => v !== value));
        } else {
            onChange([...selectedArray, value]);
        }
    }

    function handleClear(e) {
        e.stopPropagation();
        onChange(isMulti ? [] : "");
    }

    const hasSelection = isMulti ? selectedArray.length > 0 : Boolean(selectedValue);

    const displayLabel = (() => {
        if (!hasSelection) return placeholder;
        if (isMulti) {
            if (selectedArray.length === 1) {
                const match = options.find(o => o.value === selectedArray[0]);
                return match ? match.label : selectedArray[0];
            }
            return `${selectedArray.length} ${text.selected || "selecionados"}`;
        }
        const match = options.find(o => o.value === selectedValue);
        return match ? match.label : selectedValue;
    })();

    return (
        <div className={classNames("mx-ifg-filter-item", { "is-disabled": disabled })}>
            <label className="mx-ifg-filter-label">{label}</label>
            <div className="mx-ifg-dropdown-container" ref={dropdownRef}>
                <button
                    type="button"
                    className={classNames("mx-ifg-dropdown-trigger", {
                        "is-open": isOpen,
                        "has-selection": hasSelection,
                        "is-disabled": disabled
                    })}
                    disabled={disabled}
                    onClick={() => setIsOpen(prev => !prev)}
                    aria-expanded={isOpen}
                    title={displayLabel}
                >
                    <span className="mx-ifg-dropdown-text">{displayLabel}</span>
                    <div className="mx-ifg-dropdown-icons">
                        {hasSelection && (
                            <span
                                className="mx-ifg-clear-btn"
                                onClick={handleClear}
                                title={text.clear || "Limpar este filtro"}
                                role="button"
                            >
                                <X size={14} />
                            </span>
                        )}
                        <ChevronDown size={15} className={classNames("mx-ifg-arrow", { "is-rotated": isOpen })} />
                    </div>
                </button>

                {isOpen && !disabled && (
                    <div className="mx-ifg-dropdown-menu">
                        {options.length > 5 && (
                            <div className="mx-ifg-dropdown-search">
                                <Search size={14} className="mx-ifg-search-icon" />
                                <input
                                    type="text"
                                    className="mx-ifg-search-input"
                                    placeholder={text.searchOptions || "Filtrar opções..."}
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    autoFocus
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        className="mx-ifg-search-clear"
                                        onClick={() => setSearchQuery("")}
                                    >
                                        <X size={12} aria-hidden="true" />
                                    </button>
                                )}
                            </div>
                        )}

                        <div className="mx-ifg-options-list">
                            {!isMulti && (
                                <button
                                    type="button"
                                    className={classNames("mx-ifg-option", {
                                        "is-selected": !hasSelection
                                    })}
                                    onClick={() => handleSingleSelect("")}
                                >
                                    <span className="mx-ifg-option-label">{placeholder}</span>
                                    {!hasSelection && <Check size={14} className="mx-ifg-check" />}
                                </button>
                            )}

                            {filteredOptions.map(opt => {
                                const isSelected = isMulti
                                    ? selectedArray.includes(opt.value)
                                    : selectedValue === opt.value;

                                return (
                                    <button
                                        type="button"
                                        key={opt.value}
                                        className={classNames("mx-ifg-option", {
                                            "is-selected": isSelected,
                                            "is-multi": isMulti
                                        })}
                                        onClick={() =>
                                            isMulti ? handleToggleMulti(opt.value) : handleSingleSelect(opt.value)
                                        }
                                    >
                                        {isMulti && (
                                            <span
                                                className={classNames("mx-ifg-checkbox", { "is-checked": isSelected })}
                                            >
                                                {isSelected && <Check size={12} />}
                                            </span>
                                        )}
                                        <span className="mx-ifg-option-label">{opt.label}</span>
                                        {typeof opt.count === "number" && (
                                            <span className="mx-ifg-option-count">{opt.count}</span>
                                        )}
                                        {!isMulti && isSelected && <Check size={14} className="mx-ifg-check" />}
                                    </button>
                                );
                            })}

                            {filteredOptions.length === 0 && (
                                <div className="mx-ifg-no-options">
                                    {text.noOptionsFound || "Nenhuma opção encontrada"}
                                </div>
                            )}
                        </div>

                        {isMulti && selectedArray.length > 0 && (
                            <div className="mx-ifg-dropdown-footer">
                                <button type="button" className="mx-ifg-footer-btn" onClick={() => onChange([])}>
                                    {text.clearSelection || "Limpar seleção"} ({selectedArray.length})
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
