// Updated: src/app/appointments/CreateAppointmentModal.tsx - With PatientSelect Dropdown
"use client";

import { useEffect, useState } from "react";
import { Clock, User, Calendar, FileText, DollarSign } from "lucide-react";
import Modal from "../ui/primitives/Modal";
import Button from "../ui/primitives/Button";
import PatientSelect from "../calendar/PatientSelect";
import { Patient } from "../api/patients";
import { useAuth } from "../contexts/AuthContext";
import { toApiDate, dateToLocalInput, debugDateConversion } from "../utils/date-utils";

export interface CreateAppointmentPayload {
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  type?: "consultation" | "follow_up" | "routine_checkup";
  status?: "pending" | "confirmed";
  patientId: string;
  doctorId: string;
  fee?: number;
}

interface CreateAppointmentModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateAppointmentPayload) => void;
  isLoading?: boolean;
  error?: string;
  selectedTimeSlot?: {
    // ✅ ADD THIS PROP
    start: Date;
    end: Date;
  };
}

export default function CreateAppointmentModal({
  open,
  onClose,
  onSubmit,
  isLoading = false,
  error,
  selectedTimeSlot,
}: CreateAppointmentModalProps) {
  // Default times (1 hour from now, 30 minutes duration)
  const getDefaultTimes = (timeSlot?: { start: Date; end: Date }) => {
    if (timeSlot) {
      // ✅ Use the selected time slot from calendar
      console.log("🕐 Using selected time slot:", {
        start: timeSlot.start.toLocaleString(),
        end: timeSlot.end.toLocaleString(),
      });

      return {
        start: dateToLocalInput(timeSlot.start),
        end: dateToLocalInput(timeSlot.end),
      };
    }
    const now = new Date();
    const start = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now
    const end = new Date(start.getTime() + 30 * 60 * 1000); // 30 minutes later

    return {
      start: dateToLocalInput(start),
      end: dateToLocalInput(end),
    };
  };

  const { user } = useAuth();

  const [formData, setFormData] = useState(() => {
    const times = getDefaultTimes(selectedTimeSlot);
    return {
      title: "Consultation",
      description: "",
      startTime: times.start,
      endTime: times.end,
      type: "consultation" as const,
      status: "pending" as const,
      patient: {} as Patient,
      fee: "80",
      docterId: user?.id,
    };
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;

    const times = getDefaultTimes(selectedTimeSlot);

    setFormData({
      title: "Consultation",
      description: "",
      startTime: times.start,
      endTime: times.end,
      type: "consultation",
      status: "pending",
      patient: {} as Patient,
      fee: "80",
      docterId: user?.id,
    });
    setErrors({});
  }, [open, selectedTimeSlot, user?.id]);

  // Reset form when modal closes
  const handleClose = () => {
    const times = getDefaultTimes(selectedTimeSlot);
    setFormData({
      title: "Consultation",
      description: "",
      startTime: times.start,
      endTime: times.end,
      type: "consultation",
      status: "pending",
      patient: {} as Patient,
      fee: "80",
      docterId: user?.id,
    });
    setErrors({});
    onClose();
  };

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    console.log("Validating form data:", formData);
    console.log("Patient object:", formData.patient);
    console.log("Patient ID:", formData.patient?.id);

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }
    if (!formData.startTime) {
      newErrors.startTime = "Start time is required";
    }
    if (!formData.endTime) {
      newErrors.endTime = "End time is required";
    }
    if (!formData.patient || !formData.patient.id || !formData.patient.id.trim()) {
      newErrors.patientId = "Patient selection is required";
    }

    // Validate time range
    if (formData.startTime && formData.endTime) {
      const start = new Date(formData.startTime);
      const end = new Date(formData.endTime);
      if (end <= start) {
        newErrors.endTime = "End time must be after start time";
      }

      // Check if appointment is in the past
      const now = new Date();
      if (start < now) {
        newErrors.startTime = "Appointment cannot be scheduled in the past";
      }
    }

    // Validate fee
    if (
      formData.fee &&
      (isNaN(Number(formData.fee)) || Number(formData.fee) < 0)
    ) {
      newErrors.fee = "Fee must be a valid positive number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submission - formData:", formData);
    console.log("Form submission - patient:", formData.patient);
    console.log("Form submission - patient.id:", formData.patient?.id);
    
    if (!validateForm()) {
      console.log("Validation failed");
      return;
    }
    
    const patientId = formData.patient?.id?.trim();
    if (!patientId) {
      console.error("Patient ID is missing!");
      setErrors((prev) => ({ ...prev, patientId: "Patient selection is required" }));
      return;
    }
    
    // Convert datetime-local strings to UTC ISO strings using centralized utility
    const startTimeISO = toApiDate(formData.startTime);
    const endTimeISO = toApiDate(formData.endTime);
    
    // Enhanced debug logging for timezone conversion
    const startDate = new Date(formData.startTime);
    const endDate = new Date(formData.endTime);
    
    console.log("🕐 TIMEZONE CONVERSION DETAILS:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📍 Your timezone:", Intl.DateTimeFormat().resolvedOptions().timeZone);
    console.log("⏰ Timezone offset:", startDate.getTimezoneOffset(), "minutes");
    console.log("");
    console.log("🟢 START TIME:");
    console.log("  • You selected (local):", formData.startTime);
    console.log("  • Display in your timezone:", startDate.toLocaleString());
    console.log("  • Sent to API (UTC):", startTimeISO);
    console.log("  • UTC time:", startDate.toUTCString());
    console.log("");
    console.log("🔴 END TIME:");
    console.log("  • You selected (local):", formData.endTime);
    console.log("  • Display in your timezone:", endDate.toLocaleString());
    console.log("  • Sent to API (UTC):", endTimeISO);
    console.log("  • UTC time:", endDate.toUTCString());
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅ This is CORRECT! API stores in UTC, UI displays in your local time.");
    console.log("");
    
    onSubmit({
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      startTime: startTimeISO,
      endTime: endTimeISO,
      type: formData.type,
      status: formData.status,
      patientId: patientId,
      fee: formData.fee ? Number(formData.fee) : undefined,
      doctorId: user!.id,
    });
  };

  const handleInputChange = (field: string, value: string | Patient) => {
    console.log("handleInputChange:", { field, value });
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      console.log("Updated formData:", updated);
      return updated;
    });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="New Appointment"
      description="Schedule a new appointment with a patient"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-red-800 text-sm">{error}</div>
          </div>
        )}

        {/* Appointment Details Section */}
        <div>
          <div className="flex items-center mb-4">
            <Calendar className="w-5 h-5 text-primary-600 mr-2" />
            <h4 className="text-lg font-medium text-gray-900">
              Appointment Details
            </h4>
          </div>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Title *
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                  errors.title ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="e.g. Consultation, Follow-up"
                disabled={isLoading}
              />
              {errors.title && (
                <p className="mt-2 text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="type"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Appointment Type
              </label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => handleInputChange("type", e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                disabled={isLoading}
              >
                <option value="consultation">Consultation</option>
                <option value="follow_up">Follow-up Visit</option>
                <option value="routine_checkup">Routine Checkup</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Notes (optional)
              </label>
              <textarea
                id="description"
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Additional notes about the appointment"
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        {/* Patient Section */}
        <div>
          <div className="flex items-center mb-4">
            <User className="w-5 h-5 text-primary-600 mr-2" />
            <h4 className="text-lg font-medium text-gray-900">Patient</h4>
          </div>
          <div>
            <label
              htmlFor="patient"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Patient *
            </label>
            <div className={`${errors.patientId ? "border-red-300" : ""}`}>
              <PatientSelect
                value={formData.patient && formData.patient.id ? formData.patient : undefined}
                onChange={(value) => {
                  console.log("PatientSelect onChange called with:", value);
                  handleInputChange("patient", value);
                }}
                placeholder="Select a patient..."
                error={errors.patientId}
              />
            </div>
            {errors.patientId && (
              <p className="mt-2 text-sm text-red-600">{errors.patientId}</p>
            )}
          </div>
        </div>

        {/* Schedule Section */}
        <div>
          <div className="flex items-center mb-4">
            <Clock className="w-5 h-5 text-primary-600 mr-2" />
            <h4 className="text-lg font-medium text-gray-900">Schedule</h4>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="startTime"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Start Time *
              </label>
              <input
                type="datetime-local"
                id="startTime"
                value={formData.startTime}
                onChange={(e) => handleInputChange("startTime", e.target.value)}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                  errors.startTime ? "border-red-300" : "border-gray-300"
                }`}
                disabled={isLoading}
              />
              {errors.startTime && (
                <p className="mt-2 text-sm text-red-600">{errors.startTime}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="endTime"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                End Time *
              </label>
              <input
                type="datetime-local"
                id="endTime"
                value={formData.endTime}
                onChange={(e) => handleInputChange("endTime", e.target.value)}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                  errors.endTime ? "border-red-300" : "border-gray-300"
                }`}
                disabled={isLoading}
              />
              {errors.endTime && (
                <p className="mt-2 text-sm text-red-600">{errors.endTime}</p>
              )}
            </div>
          </div>
        </div>

        {/* Payment Section */}
        <div>
          <div className="flex items-center mb-4">
            <DollarSign className="w-5 h-5 text-primary-600 mr-2" />
            <h4 className="text-lg font-medium text-gray-900">Payment</h4>
          </div>

          <div>
            <label
              htmlFor="fee"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              <DollarSign className="w-4 h-4 inline mr-1" />
              Consultation Fee (€)
            </label>
            <input
              type="number"
              id="fee"
              value={formData.fee}
              onChange={(e) => handleInputChange("fee", e.target.value)}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                errors.fee ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="80"
              min="0"
              step="0.01"
              disabled={isLoading}
            />
            {errors.fee && (
              <p className="mt-2 text-sm text-red-600">{errors.fee}</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading}
            loading={isLoading}
          >
            Create Appointment
          </Button>
        </div>
      </form>
    </Modal>
  );
}
