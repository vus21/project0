// Wrapper function để bọc các async controller
// Tự động catch lỗi và chuyển tới global errorHandler
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
