import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

export function Pagination({
    currentPage = 1,
    totalPages = 1,
    pageSize = 20,
    totalItems = 0,
    onPageChange,
    onPageSizeChange,
    text = {}
}) {
    if (totalItems === 0) return null;

    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalItems);

    return (
        <div className="mx-ifg-pagination-wrapper">
            <div className="mx-ifg-page-size-selector">
                <span className="mx-ifg-pagination-label">{text.pageSize || "Itens por página:"}</span>
                <select
                    className="mx-ifg-page-size-select"
                    value={pageSize}
                    onChange={e => onPageSizeChange(Number(e.target.value))}
                >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                    <option value={500}>500</option>
                </select>
            </div>

            <div className="mx-ifg-pagination-info">
                <span>
                    {text.showing || "Mostrando"} <strong>{startItem}</strong> {text.to || "a"}{" "}
                    <strong>{endItem}</strong> {text.of || "de"} <strong>{totalItems}</strong>
                </span>
            </div>

            <div className="mx-ifg-pagination-controls">
                <button
                    type="button"
                    className="mx-ifg-page-btn"
                    disabled={currentPage <= 1}
                    onClick={() => onPageChange(1)}
                    title={text.firstPage || "Primeira página"}
                >
                    <ChevronsLeft size={16} />
                </button>
                <button
                    type="button"
                    className="mx-ifg-page-btn"
                    disabled={currentPage <= 1}
                    onClick={() => onPageChange(currentPage - 1)}
                    title={text.previousPage || "Página anterior"}
                >
                    <ChevronLeft size={16} />
                </button>

                <span className="mx-ifg-page-number">
                    {text.page || "Página"} <strong>{currentPage}</strong> {text.of || "de"}{" "}
                    <strong>{Math.max(totalPages, 1)}</strong>
                </span>

                <button
                    type="button"
                    className="mx-ifg-page-btn"
                    disabled={currentPage >= totalPages}
                    onClick={() => onPageChange(currentPage + 1)}
                    title={text.nextPage || "Próxima página"}
                >
                    <ChevronRight size={16} />
                </button>
                <button
                    type="button"
                    className="mx-ifg-page-btn"
                    disabled={currentPage >= totalPages}
                    onClick={() => onPageChange(totalPages)}
                    title={text.lastPage || "Última página"}
                >
                    <ChevronsRight size={16} />
                </button>
            </div>
        </div>
    );
}
