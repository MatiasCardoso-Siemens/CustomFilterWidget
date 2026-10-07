/**
 * @param {object} values
 * @param {Properties} defaultProperties
 * @param {("web"|"desktop")} target
 * @returns {Properties}
 */
export function getProperties(values, defaultProperties, target) {
    if (values.filterLayout === "top") {
        delete defaultProperties.properties.sidebarDefaultOpen;
        delete defaultProperties.properties.sidebarWidth;
    }

    if (!values.enablePresetFilter) {
        delete defaultProperties.properties.presetFilterLabel;
        delete defaultProperties.properties.presetFilterLabelText;
        delete defaultProperties.properties.presetFilterPlaceholder;
        delete defaultProperties.properties.presetFilterPlaceholderText;
        delete defaultProperties.properties.presetFilterDataSource;
        delete defaultProperties.properties.presetFilterOptionLabel;
        delete defaultProperties.properties.presetFilterOptionValue;
        delete defaultProperties.properties.presetFilterTargetAttribute;
    }

    if (Array.isArray(values.filterList) && values.filterList.length > 0) {
        defaultProperties.properties.filterList.objectHeaders = [
            "Label",
            "Label translation",
            "Attribute",
            "Control Type",
            "Selection Mode",
            "Counts",
            "Placeholder",
            "Placeholder translation"
        ];
    }

    if (Array.isArray(values.columnList) && values.columnList.length > 0) {
        defaultProperties.properties.columnList.objectHeaders = [
            "Header",
            "Header translation",
            "Attribute",
            "Width",
            "Sortable",
            "Alignment",
            "Renderizar como link",
            "Expressão do link",
            "HTML"
        ];
    }

    return defaultProperties;
}

/**
 * @param {object} values
 * @returns {Problem[]}
 */
export function check(values) {
    const problems = [];

    if (!values.columnList || values.columnList.length === 0) {
        problems.push({
            property: "columnList",
            severity: "error",
            message: "Adicione ao menos uma coluna para ser exibida no grid."
        });
    }

    return problems;
}
