// Updated: src/app/calendar/AppointmentEditModal.tsx - Reuse Appointments Modal
"use client";

// ✅ Import the professional modal from appointments directory
import AppointmentEditModal, {
  AppointmentEditPayload,
} from "../appointments/AppointmentEditModal";

// Convert calendar event to appointment format for the shared modal
function calendarEventToAppointment(event: CalendarEvent): any {
  return {
    id: event.id,
    title: event.title,
    description: event.description,
    startTime: event.start.toISOString(),
    endTime: event.end.toISOString(),
    type: event.type || "consultation",
    status: event.status || "confirmed",
    patientId: event.patientId || "",
    fee: event.fee,
    createdAt: new Date().toISOString(),
  };
}

// Convert appointment payload back to calendar format
function appointmentPayloadToCalendarPayload(
  payload: AppointmentEditPayload
): CalendarEditPayload {
  return {
    id: payload.id,
    title: payload.title,
    startTime: payload.startTime,
    endTime: payload.endTime,
    patientId: payload.patientId,
    fee: payload.fee,
    type: payload.type,
    status: payload.status,
    description: payload.description,
  };
}

// Calendar event interface (from existing code)
interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  patientId?: string;
  fee?: number;
  type?: "consultation" | "follow_up" | "routine_checkup";
  status?: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";
  description?: string;
}

// Calendar edit payload (what calendar expects)
export interface CalendarEditPayload {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  patientId: string;
  fee?: number;
  type?: "consultation" | "follow_up" | "routine_checkup";
  status?: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";
  description?: string;
}

interface CalendarAppointmentEditModalProps {
  open: boolean;
  onClose: () => void;
  event: CalendarEvent | null;
  onSubmit: (payload: CalendarEditPayload) => void;
  isLoading?: boolean;
  error?: string;
}

// ✅ Wrapper component that adapts the appointments modal for calendar use
export default function CalendarAppointmentEditModal({
  open,
  onClose,
  event,
  onSubmit,
  isLoading = false,
  error,
}: CalendarAppointmentEditModalProps) {
  // Handle submission by converting between formats
  const handleSubmit = (payload: AppointmentEditPayload) => {
    const calendarPayload = appointmentPayloadToCalendarPayload(payload);
    onSubmit(calendarPayload);
  };

  // Convert calendar event to appointment format
  const appointmentData = event ? calendarEventToAppointment(event) : null;

  // ✅ Use the professional appointments modal
  return (
    <AppointmentEditModal
      open={open}
      appointment={appointmentData}
      onClose={onClose}
      onSubmit={handleSubmit}
      isLoading={isLoading}
      error={error}
    />
  );
}

// Export the types for calendar usage
export type { CalendarEditPayload as AppointmentEditPayload };
