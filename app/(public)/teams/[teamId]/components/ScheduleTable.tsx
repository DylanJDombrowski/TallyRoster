import { ScheduleEvent } from "@/lib/types";

interface ScheduleTableProps {
  events: ScheduleEvent[];
}

export function ScheduleTable({ events }: ScheduleTableProps) {
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full bg-white rounded-lg shadow-md">
        <thead className="text-white" style={{ backgroundColor: "var(--color-primary, #161659)" }}>
          <tr>
            <th className="py-2 px-4 text-left">Date</th>
            <th className="py-2 px-4 text-left">Event</th>
            <th className="py-2 px-4 text-left">Location</th>
            <th className="py-2 px-4 text-left">Sanction</th>
            <th className="py-2 px-4 text-left">Type</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event, index) => (
            <tr key={event.id} className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}>
              <td className="py-2 px-4">{formatDate(event.event_date)}</td>
              <td className="py-2 px-4">{event.event_name}</td>
              <td className="py-2 px-4">{event.location || "TBD"}</td>
              <td className="py-2 px-4">{event.sanction || "N/A"}</td>
              <td className="py-2 px-4 capitalize">{event.event_type}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
