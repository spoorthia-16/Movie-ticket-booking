import User from "../models/User.js";
import { Inngest } from "inngest";

export const inngest = new Inngest({ id: "movie-ticket-booking" });

/* ===============================
   CREATE / SYNC USER
================================ */
const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    const {
      id,
      first_name,
      last_name,
      email_addresses,
      image_url
    } = event.data;

    // REQUIRED FIELD SAFETY
    if (!id || !email_addresses?.length || !image_url) return;

    const userData = {
      _id: id,
      name: `${first_name ?? ""} ${last_name ?? ""}`.trim() || "User",
      email: email_addresses[0].email_address,
      image: image_url
    };

    await User.findByIdAndUpdate(
      id,
      userData,
      { upsert: true, new: true }
    );
  }
);

/* ===============================
   DELETE USER
================================ */
const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-with-clerk" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    const { id } = event.data;
    if (!id) return;
    await User.findByIdAndDelete(id);
  }
);

/* ===============================
   UPDATE USER
================================ */
const syncUserUpdation = inngest.createFunction(
  { id: "update-user-from-clerk" },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    const {
      id,
      first_name,
      last_name,
      email_addresses,
      image_url
    } = event.data;

    if (!id || !email_addresses?.length || !image_url) return;

    await User.findByIdAndUpdate(
      id,
      {
        name: `${first_name ?? ""} ${last_name ?? ""}`.trim() || "User",
        email: email_addresses[0].email_address,
        image: image_url
      },
      { new: true }
    );
  }
);

export const functions = [
  syncUserCreation,
  syncUserDeletion,
  syncUserUpdation
];
