const { STATUS_CODES } = require("http");

const SENSITIVE_KEY = /pass(word)?|token|secret|authorization|key/i;

const sanitizeValue = (value) => {
  if (Array.isArray(value)) return value.map(sanitizeValue);
  if (value && typeof value === "object") return sanitizeQuery(value);
  return value;
};

const sanitizeQuery = (query = {}) =>
  Object.fromEntries(
    Object.entries(query).map(([key, value]) => [
      key,
      SENSITIVE_KEY.test(key) ? "[REDACTED]" : sanitizeValue(value),
    ])
  );

const formatDuration = (startedAt) => {
  const nanoseconds = process.hrtime.bigint() - startedAt;
  return `${(Number(nanoseconds) / 1e6).toFixed(2)} ms`;
};

const formatAuthentication = (req) => {
  if (req.authContext?.status === "authenticated" || req.uid) {
    const role = req.authContext?.role ? `, ${req.authContext.role}` : "";
    return `Autenticado (${req.authContext?.userId || req.uid}${role})`;
  }
  if (req.authContext?.status === "missing") {
    return "No autenticado (token Bearer ausente)";
  }
  if (req.authContext?.status === "invalid") {
    return "No autenticado (token inválido o expirado)";
  }
  return "Ruta pública (autenticación no requerida)";
};

const httpLogger = (req, res, next) => {
  const startedAt = process.hrtime.bigint();

  res.once("finish", () => {
    if (process.env.HTTP_LOGS === "false") return;

    const statusLabel = STATUS_CODES[res.statusCode] || "Unknown";
    const query = sanitizeQuery(req.query);
    const queryText =
      Object.keys(query).length > 0 ? JSON.stringify(query) : "(sin query)";
    const userAgent = req.get("user-agent") || "(no informado)";
    const authentication = formatAuthentication(req);
    const errorCode = res.locals.errorCode || "(ninguno)";

    console.log(
      [
        "",
        "┌─ HTTP REQUEST ─────────────────────────────────────────",
        `│ ID:       ${req.requestId}`,
        `│ Método:   ${req.method}`,
        `│ Ruta:     ${req.path}`,
        `│ Query:    ${queryText}`,
        `│ Estado:   ${res.statusCode} ${statusLabel}`,
        `│ Duración: ${formatDuration(startedAt)}`,
        `│ Auth:     ${authentication}`,
        `│ IP:       ${req.ip}`,
        `│ Error:    ${errorCode}`,
        `│ Agente:   ${userAgent.slice(0, 180)}`,
        "└─────────────────────────────────────────────────────────",
      ].join("\n")
    );
  });

  next();
};

module.exports = { formatAuthentication, httpLogger, sanitizeQuery };
