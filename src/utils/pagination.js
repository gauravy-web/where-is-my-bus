// Pagination utilities for production-grade API responses
// Prevents memory exhaustion from unbounded queries

/**
 * Offset-based pagination for bounded datasets
 * Use for: Students, Buses, Drivers, Attendance (date-filtered)
 */
function offsetPaginate(page = 1, limit = 50) {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
  
  return {
    skip: (pageNum - 1) * limitNum,
    take: limitNum,
    page: pageNum,
    limit: limitNum,
  };
}

/**
 * Build standardized pagination response
 */
function paginationResponse(data, total, page, limit) {
  const totalPages = Math.ceil(total / limit);
  
  return {
    data,
    pagination: {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      total,
      totalPages,
      hasMore: page < totalPages,
      hasPrevious: page > 1,
    },
  };
}

/**
 * Cursor-based pagination for time-series and unbounded data
 * Use for: Chat messages, GPS history, audit logs
 */
function cursorPaginate(cursor, limit = 50) {
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
  
  return {
    take: limitNum + 1, // Fetch one extra to check hasMore
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    limit: limitNum,
  };
}

/**
 * Build cursor pagination response
 */
function cursorResponse(data, limit) {
  const hasMore = data.length > limit;
  const items = hasMore ? data.slice(0, -1) : data;
  const nextCursor = hasMore && items.length > 0 ? items[items.length - 1].id : null;
  
  return {
    data: items,
    pagination: {
      cursor: nextCursor,
      hasMore,
      limit,
    },
  };
}

module.exports = {
  offsetPaginate,
  paginationResponse,
  cursorPaginate,
  cursorResponse,
};
