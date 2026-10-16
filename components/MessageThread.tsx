import type { Message } from "@/lib/types";

const osmLink = (lat: number, lng: number) => `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=17/${lat}/${lng}`;

/** Chat bubbles. `viewer` decides which side is "You"; neither side ever sees the other's identity. */
export function MessageThread({ messages, viewer }: { messages: Message[]; viewer: "owner" | "finder" }) {
  return (
    <ul className="space-y-2" data-testid="message-thread">
      {messages.map((m) => {
        const mine = m.sender === viewer;
        return (
          <li key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${mine ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"}`}>
              <div className="mb-0.5 text-xs font-semibold opacity-75">
                {mine ? "You" : m.sender === "finder" ? "Finder" : "Owner"} · {new Date(m.createdAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}
              </div>
              <p className="whitespace-pre-wrap break-words">{m.body}</p>
              {m.lat != null && m.lng != null && (
                <a href={osmLink(m.lat, m.lng)} target="_blank" rel="noreferrer" className="mt-1 inline-block text-xs underline">
                  📍 Shared location (OpenStreetMap)
                </a>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
