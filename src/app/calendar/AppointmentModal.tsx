// Updated: src/app/calendar/AppointmentModal.tsx - Reuse Appointments Modal
"use client";

// ✅ Import the professional modal from appointments directory
import CreateAppointmentModal, {
  CreateAppointmentPayload,
} from "../appointments/CreateAppointmentModal";
import { formatForDateTimeLocal } from "./timezone-utils";

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

  // ✅ Use the professional appointments modal
  return (
    <CreateAppointmentModal
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      isLoading={isLoading}
      error={error}
    />
  );
}

// Export the types for calendar usage
export type { CalendarAppointmentPayload as AppointmentPayload };
