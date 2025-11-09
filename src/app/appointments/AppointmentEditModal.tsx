// Updated: src/app/appointments/AppointmentEditModal.tsx - With PatientSelect Dropdown
"use client";

import { useCallback, useEffect, useState } from "react";
import { Appointment } from "../api/appointments";
import { Clock, User, Calendar, FileText, DollarSign } from "lucide-react";
import Modal from "../ui/primitives/Modal";
import Button from "../ui/primitives/Button";
import PatientSelect from "../calendar/PatientSelect";
import { Patient } from "../api/patients";
import { fromApiDate, toApiDate, debugDateConversion } from "../utils/date-utils";

export interface AppointmentEditPayload {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  type?: "consultation" | "follow_up" | "routine_checkup";
  status?: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";
  patient: Patient;
  fee?: number;
}

interface AppointmentEditModalProps {
  open: boolean;
  appointment: Appointment | null;
  onClose: () => void;
  onSubmit: (payload: AppointmentEditPayload) => void;
  isLoading?: boolean;
  error?: string;
}

export default function AppointmentEditModal({
  open,
  appointment,
  onClose,
  onSubmit,
  isLoading = false,
  error,
}: AppointmentEditModalProps) {
  const normalizePatient = useCallback(
    (patient?: Patient | null): Patient | undefined => {
      if (!patient || !patient.id) return undefined;
      return {
        ...patient,
        label:
          patient.label ??
          ([patient.firstName, patient.lastName].filter(Boolean).join(" ") ||
            patient.email ||
            patient.id),
      };
    },
    []
  );

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    type: "consultation" as const,
    status: "pending" as const,
    patient: undefined as Patient | undefined,
    fee: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Populate form when appointment changes
  useEffect(() => {
    if (open && appointment) {
      const start = new Date(appointment.startTime);
      const end = new Date(appointment.endTime);

      setFormData({
        title: appointment.title || "",
        description: appointment.description || "",
        startTime: fromApiDate(appointment.startTime),
        endTime: fromApiDate(appointment.endTime),
        type: appointment.type || "consultation",
        status: appointment.status || "pending",
        patient: normalizePatient(appointment.patient),
        fee: appointment.fee?.toString() || "",
      });
      setErrors({});
    }
  }, [open, appointment, normalizePatient]);

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }
    if (!formData.startTime) {
      newErrors.startTime = "Start time is required";
    }
    if (!formData.endTime) {
      newErrors.endTime = "End time is required";
    }
    if (!formData.patient?.id) {
      newErrors.patientId = "Patient selection is required";
    }

    // Validate time range
    if (formData.startTime && formData.endTime) {
      const start = new Date(formData.startTime);
      const end = new Date(formData.endTime);
      if (end <= start) {
        newErrors.endTime = "End time must be after start time";
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
    if (!appointment || !validateForm()) return;

    // Convert datetime-local strings to UTC ISO strings using centralized utility
    const startTimeISO = toApiDate(formData.startTime);
    const endTimeISO = toApiDate(formData.endTime);
    
    // Debug date conversion
    debugDateConversion(
      "Edit Appointment",
      formData.startTime,
      startTimeISO,
      new Date(formData.startTime)
    );

    onSubmit({
      id: appointment.id,
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      startTime: startTimeISO,
      endTime: endTimeISO,
      type: formData.type,
      status: formData.status,
      patient: formData.patient!,
      fee: formData.fee ? Number(formData.fee) : undefined,
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handlePatientChange = (patient: Patient) => {
    setFormData((prev) => ({ ...prev, patient }));
    if (errors.patientId) {
      setErrors((prev) => ({ ...prev, patientId: "" }));
    }
  };

  if (!appointment) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit Appointment"
      description="Update appointment details and schedule"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-red-800 text-sm">{error}</div>
          </div>
        )}

        {/* Appointment Details */}
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
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Description
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

        {/* Patient */}
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
                value={formData.patient}
                onChange={handlePatientChange}
                placeholder="Select a patient..."
              />
            </div>
            {errors.patientId && (
              <p className="mt-2 text-sm text-red-600">{errors.patientId}</p>
            )}
          </div>
        </div>

        {/* Schedule */}
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

        {/* Type & Status */}
        <div>
          <div className="flex items-center mb-4">
            <FileText className="w-5 h-5 text-primary-600 mr-2" />
            <h4 className="text-lg font-medium text-gray-900">Type & Status</h4>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                <option value="follow_up">Follow-up</option>
                <option value="routine_checkup">Routine Checkup</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Status
              </label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => handleInputChange("status", e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                disabled={isLoading}
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Payment */}
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
              Fee (€)
            </label>
            <input
              type="number"
              id="fee"
              value={formData.fee}
              onChange={(e) => handleInputChange("fee", e.target.value)}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                errors.fee ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="0.00"
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
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
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
            Update Appointment
          </Button>
        </div>
      </form>
    </Modal>
  );
}
