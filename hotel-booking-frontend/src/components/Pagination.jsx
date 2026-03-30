import './Pagination.css';

/**
 * Reusable pagination component.
 * Props: currentPage, lastPage, onPageChange
 */
const Pagination = ({ currentPage, lastPage, onPageChange }) => {
    if (!lastPage || lastPage <= 1) return null;

    const pages = [];
    const delta = 2;
    const left  = Math.max(1, currentPage - delta);
    const right = Math.min(lastPage, currentPage + delta);

    if (left > 1) {
        pages.push(1);
        if (left > 2) pages.push('...');
    }
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < lastPage) {
        if (right < lastPage - 1) pages.push('...');
        pages.push(lastPage);
    }

    return (
        <div className="pagination">
            <button
                className="pg-btn"
                disabled={currentPage === 1}
                onClick={() => onPageChange(currentPage - 1)}
            >
                ‹ Prev
            </button>

            {pages.map((p, i) =>
                p === '...' ? (
                    <span key={`ellipsis-${i}`} className="pg-ellipsis">…</span>
                ) : (
                    <button
                        key={p}
                        className={`pg-btn ${p === currentPage ? 'pg-active' : ''}`}
                        onClick={() => onPageChange(p)}
                    >
                        {p}
                    </button>
                )
            )}

            <button
                className="pg-btn"
                disabled={currentPage === lastPage}
                onClick={() => onPageChange(currentPage + 1)}
            >
                Next ›
            </button>
        </div>
    );
};

export default Pagination;
