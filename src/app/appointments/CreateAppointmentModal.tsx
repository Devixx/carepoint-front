// src/app/appointments/CreateAppointmentModal.tsx
"use client";

import { useState } from "react";
import { Clock, User, Calendar, FileText, DollarSign } from "lucide-react";
import Modal from "../ui/primitives/Modal";
import Button from "../ui/primitives/Button";

export interface CreateAppointmentPayload {
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  type?: "consultation" | "follow_up" | "routine_checkup";
  status?: "pending" | "confirmed";
  patientId: string;
  fee?: number;
}

interface CreateAppointmentModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateAppointmentPayload) => void;
  isLoading?: boolean;
}

export default function CreateAppointmentModal({
  open,
  onClose,
  onSubmit,
  isLoading = false,
}: CreateAppointmentModalProps) {
  // Default times (1 hour from now, 30 minutes duration)
  const getDefaultTimes = () => {
    const now = new Date();
    const start = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now
    const end = new Date(start.getTime() + 30 * 60 * 1000); // 30 minutes later

    return {
      start: start.toISOString().slice(0, 16),
      end: end.toISOString().slice(0, 16),
    };
  };

  const [formData, setFormData] = useState(() => {
    const times = getDefaultTimes();
    return {
      title: "Consultation",
      description: "",
      startTime: times.start,
      endTime: times.end,
      type: "consultation" as const,
      status: "pending" as const,
      patientId: "",
      fee: "80",
    };
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when modal closes
  const handleClose = () => {
    const times = getDefaultTimes();
    setFormData({
      title: "Consultation",
      description: "",
      startTime: times.start,
      endTime: times.end,
      type: "consultation",
      status: "pending",
      patientId: "",
      fee: "80",
    });
    setErrors({});
    onClose();
  };

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
    if (!formData.patientId.trim()) {
      newErrors.patientId = "Patient ID is required";
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
    if (!validateForm()) return;

    onSubmit({
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      startTime: new Date(formData.startTime).toISOString(),
      endTime: new Date(formData.endTime).toISOString(),
      type: formData.type,
      status: formData.status,
      patientId: formData.patientId.trim(),
      fee: formData.fee ? Number(formData.fee) : undefined,
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
        {/* Basic Information */}
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

        {/* Patient and Payment */}
        <div>
          <div className="flex items-center mb-4">
            <User className="w-5 h-5 text-primary-600 mr-2" />
            <h4 className="text-lg font-medium text-gray-900">
              Patient & Payment
            </h4>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="patientId"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Patient ID *
              </label>
              <input
                type="text"
                id="patientId"
                value={formData.patientId}
                onChange={(e) => handleInputChange("patientId", e.target.value)}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                  errors.patientId ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="Enter patient ID"
                disabled={isLoading}
              />
              {errors.patientId && (
                <p className="mt-2 text-sm text-red-600">{errors.patientId}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                This will be replaced with a patient selector in the future
              </p>
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
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
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
