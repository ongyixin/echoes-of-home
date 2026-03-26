"use client";

import { useState } from "react";
import { usePeople } from "@/lib/use-people";
import { FollowedPerson } from "@/lib/social-types";

interface PeopleBookProps {
  /** If true, shows quick-launch "Browse" buttons for use on the live page */
  showLaunchButtons?: boolean;
  /** Called when user clicks "Browse" a person — receives the profile URL that was opened */
  onPersonLaunched?: (person: FollowedPerson, platform: "instagram" | "tiktok") => void;
}

const INSTAGRAM_ICON = (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5" aria-hidden="true">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
  </svg>
);

const TIKTOK_ICON = (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5" aria-hidden="true">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.27 8.27 0 004.84 1.55V6.79a4.85 4.85 0 01-1.07-.1z" />
  </svg>
);

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function ProfileLink({
  platform,
  handle,
  onLaunch,
}: {
  platform: "instagram" | "tiktok";
  handle: string;
  onLaunch?: () => void;
}) {
  const url =
    platform === "instagram"
      ? `https://www.instagram.com/${handle}/`
      : `https://www.tiktok.com/@${handle}`;

  const handleClick = () => {
    window.open(url, "_blank", "noopener,noreferrer");
    onLaunch?.();
  };

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-[#7a5c4e] bg-[#fef7e4] hover:bg-[#fddbb4]/60 border border-[#f0b8b5] transition-colors focus-visible:ring-2 focus-visible:ring-[#e8927c]"
      aria-label={`Open ${platform === "instagram" ? "Instagram" : "TikTok"} profile for @${handle}`}
    >
      {platform === "instagram" ? INSTAGRAM_ICON : TIKTOK_ICON}
      @{handle}
    </button>
  );
}

export default function PeopleBook({ showLaunchButtons, onPersonLaunched }: PeopleBookProps) {
  const { people, addPerson, removePerson } = usePeople();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [instagram, setInstagram] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError("Please enter a name.");
      return;
    }
    if (!instagram.trim() && !tiktok.trim()) {
      setFormError("Please enter at least one handle (Instagram or TikTok).");
      return;
    }

    addPerson(name, instagram || undefined, tiktok || undefined);
    setName("");
    setInstagram("");
    setTiktok("");
    setShowForm(false);
  };

  const handleRemove = (id: string) => {
    setRemovingId(id);
    setTimeout(() => {
      removePerson(id);
      setRemovingId(null);
    }, 200);
  };

  return (
    <div>
      {/* People list */}
      {people.length > 0 && (
        <div className="space-y-3 mb-4">
          {people.map((person) => (
            <div
              key={person.id}
              className={`flex items-center gap-3 p-4 rounded-2xl bg-white/80 border border-[#f9d5d3] transition-opacity duration-200 ${
                removingId === person.id ? "opacity-0" : "opacity-100"
              }`}
            >
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#fddbb4] to-[#f9d5d3] flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-[#c4684a]">{getInitials(person.name)}</span>
              </div>

              {/* Name + handles */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#4a3728] truncate">{person.name}</p>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {person.instagram && (
                    <ProfileLink
                      platform="instagram"
                      handle={person.instagram}
                      onLaunch={() => onPersonLaunched?.(person, "instagram")}
                    />
                  )}
                  {person.tiktok && (
                    <ProfileLink
                      platform="tiktok"
                      handle={person.tiktok}
                      onLaunch={() => onPersonLaunched?.(person, "tiktok")}
                    />
                  )}
                </div>
              </div>

              {/* Remove */}
              <button
                onClick={() => handleRemove(person.id)}
                className="flex-shrink-0 p-1.5 rounded-lg text-[#c4b4ae] hover:text-red-500 hover:bg-red-50 transition-colors focus-visible:ring-2 focus-visible:ring-red-400"
                aria-label={`Remove ${person.name}`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add person form */}
      {showForm ? (
        <form
          onSubmit={handleSubmit}
          className="p-4 rounded-2xl bg-white/80 border border-[#f9d5d3] space-y-3"
          aria-label="Add a person"
        >
          <p className="text-xs font-semibold text-[#4a3728]">Add someone to follow</p>

          <div>
            <label htmlFor="person-name" className="block text-xs text-[#7a5c4e] mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              id="person-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Grandma, Dad, Aisha"
              className="w-full px-3 py-2 rounded-xl text-sm border border-[#f0b8b5] bg-white text-[#4a3728] placeholder:text-[#c4b4ae] focus:outline-none focus:ring-2 focus:ring-[#e8927c]"
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="person-instagram" className="block text-xs text-[#7a5c4e] mb-1">
              Instagram handle
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#c4b4ae] text-sm">@</span>
              <input
                id="person-instagram"
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value.replace(/^@/, ""))}
                placeholder="username"
                className="w-full pl-7 pr-3 py-2 rounded-xl text-sm border border-[#f0b8b5] bg-white text-[#4a3728] placeholder:text-[#c4b4ae] focus:outline-none focus:ring-2 focus:ring-[#e8927c]"
              />
            </div>
          </div>

          <div>
            <label htmlFor="person-tiktok" className="block text-xs text-[#7a5c4e] mb-1">
              TikTok handle
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#c4b4ae] text-sm">@</span>
              <input
                id="person-tiktok"
                type="text"
                value={tiktok}
                onChange={(e) => setTiktok(e.target.value.replace(/^@/, ""))}
                placeholder="username"
                className="w-full pl-7 pr-3 py-2 rounded-xl text-sm border border-[#f0b8b5] bg-white text-[#4a3728] placeholder:text-[#c4b4ae] focus:outline-none focus:ring-2 focus:ring-[#e8927c]"
              />
            </div>
          </div>

          {formError && (
            <p role="alert" className="text-xs text-red-600">
              {formError}
            </p>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              className="flex-1 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-[#e8927c]"
              style={{ background: "linear-gradient(135deg, #e8927c, #c4684a)" }}
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setFormError(null);
                setName("");
                setInstagram("");
                setTiktok("");
              }}
              className="flex-1 py-2 rounded-xl text-sm font-medium text-[#7a5c4e] border border-[#f0b8b5] hover:bg-[#fddbb4]/20 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-medium text-[#c4684a] border-2 border-dashed border-[#f0b8b5] hover:border-[#e8927c] hover:bg-[#fddbb4]/10 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#e8927c]"
          aria-label="Add a family member or friend"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add a family member or friend
        </button>
      )}
    </div>
  );
}
