const send = (res, status, success, payload = {}, message) => {
  const body = { success, ...payload };
  if (message !== undefined) {
    body.message = message;
  }
  return res.status(status).json(body);
};

const ok = (res, data = null, message, status = 200) => {
  if (data === null || data === undefined) {
    return send(res, status, true, {}, message);
  }

  if (typeof data === "object" && !Array.isArray(data)) {
    return send(res, status, true, data, message);
  }

  return send(res, status, true, { data }, message);
};

const created = (res, data = null, message) => ok(res, data, message, 201);

const badRequest = (res, message = "Bad request") =>
  send(res, 400, false, {}, message);

const unauthorized = (res, message = "Unauthorized") =>
  send(res, 401, false, {}, message);

const forbidden = (res, message = "Forbidden") =>
  send(res, 403, false, {}, message);

const notFound = (res, message = "Not found") =>
  send(res, 404, false, {}, message);

const serverError = (res, err, fallbackMessage = "Server Error") =>
  send(res, 500, false, {}, err?.message || fallbackMessage);

module.exports = {
  ok,
  created,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  serverError,
};
