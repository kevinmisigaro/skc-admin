"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { ComicButtonAsButton } from "@/components/ui/ComicButton";
import type { Database } from "@/types/database";

type EventRow = Database["public"]["Tables"]["events"]["Row"];

const emptyForm = {
  title: "",
  description: "",
  eventDate: "",
  venue: "",
  ticketUrl: "",
  priceAmount: "0",
  currency: "TZS",
  status: "upcoming" as "upcoming" | "past",
};

function toFormState(event: EventRow): typeof emptyForm {
  return {
    title: event.title,
    description: event.description,
    eventDate: event.event_date,
    venue: event.venue,
    ticketUrl: event.ticket_url ?? "",
    priceAmount: (event.price_cents / 100).toString(),
    currency: event.currency,
    status: event.status,
  };
}

export function EventsPanel({ events }: { events: EventRow[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  function openCreateForm() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm((v) => (editingId ? true : !v));
  }

  function openEditForm(event: EventRow) {
    setEditingId(event.id);
    setForm(toFormState(event));
    setShowForm(true);
    setError(null);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const body = {
        title: form.title,
        description: form.description,
        eventDate: form.eventDate,
        venue: form.venue,
        ticketUrl: form.ticketUrl,
        priceAmount: Number(form.priceAmount) || 0,
        currency: form.currency,
        status: form.status,
        ...(editingId ? {} : { isPublished: true }),
      };
      const res = await fetch(editingId ? `/api/events/${editingId}` : "/api/events", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not save event.");
        return;
      }
      closeForm();
      router.refresh();
    } catch {
      setError("Network error — please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function togglePublished(event: EventRow) {
    setBusyId(event.id);
    try {
      await fetch(`/api/events/${event.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !event.is_published }),
      });
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id: string) {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Could not delete event.");
        return;
      }
      setConfirmDeleteId(null);
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl text-comic-black">Events</h1>
        <ComicButtonAsButton
          variant="orange"
          className="px-4 py-2 text-base"
          onClick={openCreateForm}
        >
          <Plus size={18} /> Add event
        </ComicButtonAsButton>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="comic-panel mt-5 rounded-2xl bg-white p-5">
          <h2 className="mb-4 font-display text-xl text-comic-black">
            {editingId ? "Edit event" : "New event"}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-bold text-comic-black">Title</label>
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full rounded-xl border-2 border-comic-black px-3 py-2"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-bold text-comic-black">Description</label>
              <textarea
                required
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full rounded-xl border-2 border-comic-black px-3 py-2"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-bold text-comic-black">Event date</label>
              <input
                required
                type="date"
                value={form.eventDate}
                onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                className="w-full rounded-xl border-2 border-comic-black px-3 py-2"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-bold text-comic-black">Venue</label>
              <input
                required
                value={form.venue}
                onChange={(e) => setForm({ ...form, venue: e.target.value })}
                className="w-full rounded-xl border-2 border-comic-black px-3 py-2"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-bold text-comic-black">
                Ticket price
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.priceAmount}
                  onChange={(e) => setForm({ ...form, priceAmount: e.target.value })}
                  className="w-full rounded-xl border-2 border-comic-black px-3 py-2"
                />
                <input
                  value={form.currency}
                  onChange={(e) => setForm({ ...form, currency: e.target.value.toUpperCase() })}
                  maxLength={3}
                  className="w-20 rounded-xl border-2 border-comic-black px-3 py-2 text-center"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-bold text-comic-black">Status</label>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value as "upcoming" | "past" })
                }
                className="w-full rounded-xl border-2 border-comic-black px-3 py-2"
              >
                <option value="upcoming">Upcoming</option>
                <option value="past">Past</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-bold text-comic-black">
                Ticket URL (optional)
              </label>
              <input
                value={form.ticketUrl}
                onChange={(e) => setForm({ ...form, ticketUrl: e.target.value })}
                placeholder="https://..."
                className="w-full rounded-xl border-2 border-comic-black px-3 py-2"
              />
            </div>
          </div>
          {error && <p className="mt-3 text-sm font-semibold text-comic-red">{error}</p>}
          <div className="mt-4 flex gap-3">
            <ComicButtonAsButton type="submit" variant="green" disabled={saving}>
              {saving ? (
                <Loader2 className="animate-spin" size={18} />
              ) : editingId ? (
                "Save changes"
              ) : (
                "Save event"
              )}
            </ComicButtonAsButton>
            <ComicButtonAsButton type="button" variant="outline" onClick={closeForm}>
              Cancel
            </ComicButtonAsButton>
          </div>
        </form>
      )}

      <div className="comic-panel mt-6 overflow-x-auto rounded-2xl bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b-2 border-comic-black bg-comic-black/5">
              <th className="px-4 py-3 font-bold">Title</th>
              <th className="px-4 py-3 font-bold">Date</th>
              <th className="px-4 py-3 font-bold">Venue</th>
              <th className="px-4 py-3 font-bold">Price</th>
              <th className="px-4 py-3 font-bold">Status</th>
              <th className="px-4 py-3 font-bold">Visibility</th>
              <th className="px-4 py-3 font-bold"></th>
            </tr>
          </thead>
          <tbody>
            {events.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-comic-black/50">
                  No events yet. Add the first one above.
                </td>
              </tr>
            )}
            {events.map((event) => (
              <tr key={event.id} className="border-b border-comic-black/10 last:border-0">
                <td className="px-4 py-3 font-semibold">{event.title}</td>
                <td className="px-4 py-3 text-comic-black/70">
                  {new Date(event.event_date).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-comic-black/70">{event.venue}</td>
                <td className="px-4 py-3 text-comic-black/70">
                  {(event.price_cents / 100).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  {event.currency}
                </td>
                <td className="px-4 py-3">
                  <Badge tone={event.status}>{event.status}</Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge tone={event.is_published ? "available" : "disabled"}>
                    {event.is_published ? "published" : "paused"}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <button
                    onClick={() => openEditForm(event)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-comic-black hover:underline"
                  >
                    <Pencil size={13} /> Edit
                  </button>
                  <span className="mx-2 text-comic-black/20">|</span>
                  <button
                    onClick={() => togglePublished(event)}
                    disabled={busyId === event.id}
                    className="text-xs font-bold text-sky-blue hover:underline disabled:opacity-50"
                  >
                    {busyId === event.id ? "..." : event.is_published ? "Pause" : "Publish"}
                  </button>
                  <span className="mx-2 text-comic-black/20">|</span>
                  {confirmDeleteId === event.id ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="text-xs text-comic-black/60">Delete?</span>
                      <button
                        onClick={() => handleDelete(event.id)}
                        disabled={busyId === event.id}
                        className="text-xs font-bold text-comic-red hover:underline disabled:opacity-50"
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="text-xs font-bold text-comic-black/60 hover:underline"
                      >
                        No
                      </button>
                    </span>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteId(event.id)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-comic-red hover:underline"
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {error && !showForm && <p className="mt-3 text-sm font-semibold text-comic-red">{error}</p>}
    </div>
  );
}
