export type ApiMeta = {
  request_id: string;
  page?: number;
  per_page?: number;
  total?: number;
};

export type ApiSuccess<T> = {
  success: true;
  code: 200 | 201 | 202;
  data: T;
  meta: ApiMeta;
};

export type ApiFailure = {
  success: false;
  code: 400 | 401 | 403 | 404 | 409 | 422 | 429 | 500 | 502 | 503;
  error: {
    code: string;
    message: string;
    fields?: Record<string, string[]> | null;
  };
  meta: ApiMeta;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

