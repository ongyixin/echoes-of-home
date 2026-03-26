"use client";

import { useState, useEffect, useCallback } from "react";
import { FollowedPerson } from "./social-types";
import { v4 as uuidv4 } from "uuid";

const STORAGE_KEY = "echoes-followed-people";

function loadPeople(): FollowedPerson[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as FollowedPerson[]) : [];
  } catch {
    return [];
  }
}

function savePeople(people: FollowedPerson[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(people));
  } catch {
    // Ignore storage errors
  }
}

export function usePeople() {
  const [people, setPeople] = useState<FollowedPerson[]>([]);

  useEffect(() => {
    setPeople(loadPeople());
  }, []);

  const addPerson = useCallback((name: string, instagram?: string, tiktok?: string) => {
    const person: FollowedPerson = {
      id: uuidv4(),
      name: name.trim(),
      instagram: instagram?.trim().replace(/^@/, "") || undefined,
      tiktok: tiktok?.trim().replace(/^@/, "") || undefined,
      addedAt: new Date().toISOString(),
    };
    setPeople((prev) => {
      const updated = [...prev, person];
      savePeople(updated);
      return updated;
    });
    return person;
  }, []);

  const removePerson = useCallback((id: string) => {
    setPeople((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      savePeople(updated);
      return updated;
    });
  }, []);

  return { people, addPerson, removePerson };
}
