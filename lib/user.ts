"use client";

import type { UserProfile } from "./types";

const STORAGE_KEY = "dfm-user";

export function getUser(): UserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveUser(user: UserProfile) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  // Also keep anonId in the old key for backward compatibility
  localStorage.setItem("dfm-anon-id", user.anonId);
  localStorage.setItem("dfm-nickname", user.nickname);
}

export function updateUser(updates: Partial<UserProfile>) {
  const current = getUser();
  if (!current) return;
  const updated = { ...current, ...updates };
  saveUser(updated);
}

export function isRegistered(): boolean {
  return getUser() !== null;
}
