"use strict";

const { createHash, randomBytes } = require("node:crypto");
const { getAppPublicUrl } = require("../../config/env");

const INVITATION_TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;

const createInvitationToken = () => randomBytes(32).toString("base64url");

const isValidInvitationToken = (token) =>
  typeof token === "string" && INVITATION_TOKEN_PATTERN.test(token);

const hashInvitationToken = (token) => {
  if (!isValidInvitationToken(token)) return "";
  return createHash("sha256").update(token).digest("hex");
};

const getInvitationExpiration = (now = new Date()) => {
  const hours = Number(process.env.INVITATION_EXPIRES_HOURS || 24);
  return new Date(now.getTime() + hours * 60 * 60 * 1000);
};

const buildInvitationUrl = (token) => {
  const baseUrl = new URL(getAppPublicUrl());
  baseUrl.pathname = "/registrar";
  baseUrl.search = "";
  baseUrl.hash = "";
  baseUrl.searchParams.set("invitation", token);
  return baseUrl.toString();
};

module.exports = {
  buildInvitationUrl,
  createInvitationToken,
  getInvitationExpiration,
  hashInvitationToken,
  isValidInvitationToken,
};
