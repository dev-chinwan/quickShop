export function ok(data, init = {}) {
  return Response.json(data, { status: 200, ...init });
}

export function created(data, init = {}) {
  return Response.json(data, { status: 201, ...init });
}

export function badRequest(message, details) {
  return Response.json(
    {
      success: false,
      message,
      details,
    },
    { status: 400 }
  );
}

export function notFound(message = 'Resource not found') {
  return Response.json(
    {
      success: false,
      message,
    },
    { status: 404 }
  );
}

export function internalError(error) {
  return Response.json(
    {
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'production' ? undefined : String(error?.message || error),
    },
    { status: 500 }
  );
}
