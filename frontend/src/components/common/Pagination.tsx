import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
}) => {
  if (totalPages <= 1) {
    return null;
  }

  const handlePageClick = (page: number) => {
    if (page >= 0 && page < totalPages) {
      onPageChange(page);
    }
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    const halfPagesToShow = Math.floor(maxPagesToShow / 2);

    let startPage = Math.max(0, currentPage - halfPagesToShow);
    let endPage = Math.min(totalPages - 1, currentPage + halfPagesToShow);

    if (currentPage - startPage < halfPagesToShow) {
      endPage = Math.min(totalPages - 1, endPage + (halfPagesToShow - (currentPage - startPage)));
    }
    
    if (endPage - currentPage < halfPagesToShow) {
      startPage = Math.max(0, startPage - (halfPagesToShow - (endPage - currentPage)));
    }

    // Previous button
    pageNumbers.push(
      <button
        key="prev"
        onClick={() => handlePageClick(currentPage - 1)}
        disabled={currentPage === 0}
        className="pagination-item disabled:opacity-50"
      >
        &laquo;
      </button>
    );

    // First page and ellipsis
    if (startPage > 0) {
      pageNumbers.push(
        <button key={0} onClick={() => handlePageClick(0)} className="pagination-item">
          1
        </button>
      );
      if (startPage > 1) {
        pageNumbers.push(<span key="start-ellipsis" className="pagination-item">...</span>);
      }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => handlePageClick(i)}
          className={`pagination-item ${currentPage === i ? 'active' : ''}`}
        >
          {i + 1}
        </button>
      );
    }

    // Last page and ellipsis
    if (endPage < totalPages - 1) {
      if (endPage < totalPages - 2) {
        pageNumbers.push(<span key="end-ellipsis" className="pagination-item">...</span>);
      }
      pageNumbers.push(
        <button
          key={totalPages - 1}
          onClick={() => handlePageClick(totalPages - 1)}
          className="pagination-item"
        >
          {totalPages}
        </button>
      );
    }

    // Next button
    pageNumbers.push(
      <button
        key="next"
        onClick={() => handlePageClick(currentPage + 1)}
        disabled={currentPage === totalPages - 1}
        className="pagination-item disabled:opacity-50"
      >
        &raquo;
      </button>
    );

    return pageNumbers;
  };

  return (
    <nav className={`flex justify-center items-center space-x-2 ${className}`}>
      {renderPageNumbers()}
    </nav>
  );
};

export default Pagination; 