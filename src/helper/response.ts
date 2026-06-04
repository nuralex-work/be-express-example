const HandleResponse = (
  res: any,
  statusCode: number,
  message?: string,
  data?: any,
) => {
  return res.status(statusCode).json({
    status_code: statusCode,
    message: message || null,
    data: data || null,
  });
};
const HandleResponseErrors = (
  res: any,
  statusCode: number,
  message?: string,
  errors?: any,
  data?: any,
) => {
  return res.status(statusCode).json({
    status_code: statusCode,
    message: message || null,
    errors: errors || null,
    data: data || null,
  });
};
export { HandleResponse, HandleResponseErrors };
