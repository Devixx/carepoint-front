// src/app/calendar/AppointmentModal.tsx - Fixed Version with Proper Time Slot Handling
"use client";

// ✅ Import the professional modal from appointments directory
import CreateAppointmentModal, {
  CreateAppointmentPayload,
} from "../appointments/CreateAppointmentModal";
import { dateToLocalInput } from "../utils/date-utils";

// Calendar-specific payload (what calendar expects)
export interface CalendarAppointmentPayload {
  title: string;
  startTime: string;
  endTime: string;
  patientId: string;
  doctorUserId: string;
  fee?: number;
  type?: "consultation" | "follow_up" | "routine_checkup";
  description?: string;
}

// Convert calendar payload to appointments format
function calendarPayloadToAppointmentPayload(
  payload: CreateAppointmentPayload
): CalendarAppointmentPayload {
  return {
    title: payload.title,
    startTime: payload.startTime,
    endTime: payload.endTime,
    patientId: payload.patientId,
    doctorUserId: payload.doctorId,
    fee: payload.fee,
    type: payload.type,
    description: payload.description,
  };
}

interface CalendarAppointmentModalProps {
  open: boolean;
  onClose: () => void;
  defaultStart: Date | null;
  defaultEnd: Date | null;
  onSubmit: (payload: CalendarAppointmentPayload) => void;
  isLoading?: boolean;
  error?: string;
}

// ✅ Wrapper component that adapts the appointments modal for calendar use
export default function CalendarAppointmentModal({
  open,
  onClose,
  defaultStart,
  defaultEnd,
  onSubmit,
  isLoading = false,
  error,
}: CalendarAppointmentModalProps) {
  // Handle submission by converting between formats
  const handleSubmit = (payload: CreateAppointmentPayload) => {
    const calendarPayload = calendarPayloadToAppointmentPayload(payload);
    onSubmit(calendarPayload);
  };

  // ✅ CRITICAL FIX: Create selectedTimeSlot from defaultStart/defaultEnd
  const selectedTimeSlot =
    defaultStart && defaultEnd
      ? {
          start: defaultStart,
          end: defaultEnd,
        }
      : undefined;

  // Debug logging in development
  if (process.env.NODE_ENV === "development" && selectedTimeSlot) {
    console.log("📅 CalendarAppointmentModal - Selected Time Slot:", {
      start: dateToLocalInput(selectedTimeSlot.start),
      end: dateToLocalInput(selectedTimeSlot.end),
      startISO: selectedTimeSlot.start.toISOString(),
      endISO: selectedTimeSlot.end.toISOString(),
    });
  }

  // ✅ Use the professional appointments modal with proper time slot handling
  return (
    <CreateAppointmentModal
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      isLoading={isLoading}
      error={error}
      selectedTimeSlot={selectedTimeSlot} // ✅ CRITICAL: Pass the selected time slot
    />
  );
}

// Export the types for calendar usage
export type { CalendarAppointmentPayload as AppointmentPayload };
