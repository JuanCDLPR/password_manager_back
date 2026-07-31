const { Schema, model } = require("mongoose");

const InvitationSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
      index: true,
    },
    invitedName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
      select: false,
    },
    activeEmail: {
      type: String,
      unique: true,
      sparse: true,
      select: false,
    },
    status: {
      type: String,
      enum: ["pending", "used", "revoked", "expired"],
      default: "pending",
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "USUARIOS",
      required: true,
      index: true,
    },
    consumedBy: {
      type: Schema.Types.ObjectId,
      ref: "USUARIOS",
      default: null,
    },
    consumedAt: {
      type: Date,
      default: null,
    },
    revokedBy: {
      type: Schema.Types.ObjectId,
      ref: "USUARIOS",
      default: null,
    },
    revokedAt: {
      type: Date,
      default: null,
    },
    deliveryStatus: {
      type: String,
      enum: ["pending", "sent", "failed"],
      default: "pending",
    },
    lastDeliveryAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: (_document, result) => {
        delete result.tokenHash;
        delete result.activeEmail;
        return result;
      },
    },
  }
);

InvitationSchema.index({ status: 1, createdAt: -1 });

module.exports = model("INVITACIONES", InvitationSchema);
