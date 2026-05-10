"use client";

import { useEffect, useState } from "react";
import { Clock, User, Calendar, DollarSign, UserPlus, X } from "lucide-react";
import Modal from "../ui/primitives/Modal";
import Button from "../ui/primitives/Button";
import PatientSelect from "../calendar/PatientSelect";
import { Patient, createPatient } from "../api/patients";
import { useAuth } from "../contexts/AuthContext";
import { toApiDate, dateToLocalInput } from "../utils/date-utils";

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

  const [showNewPatientForm, setShowNewPatientForm] = useState(false);
  const [newPatient, setNewPatient] = useState({ firstName: "", lastName: "", email: "", phone: "" });
  const [newPatientErrors, setNewPatientErrors] = useState<Record<string, string>>({});
  const [isCreatingPatient, setIsCreatingPatient] = useState(false);

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
    setShowNewPatientForm(false);
    setNewPatient({ firstName: "", lastName: "", email: "", phone: "" });
    setNewPatientErrors({});
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
    setShowNewPatientForm(false);
    setNewPatient({ firstName: "", lastName: "", email: "", phone: "" });
    setNewPatientErrors({});
    onClose();
  };

  const handleCreateNewPatient = async () => {
    const errs: Record<string, string> = {};
    if (!newPatient.firstName.trim()) errs.firstName = "First name is required";
    if (!newPatient.lastName.trim()) errs.lastName = "Last name is required";
    if (!newPatient.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newPatient.email)) errs.email = "Invalid email";
    if (Object.keys(errs).length) { setNewPatientErrors(errs); return; }

    setIsCreatingPatient(true);
    try {
      const created = await createPatient({
        firstName: newPatient.firstName.trim(),
        lastName: newPatient.lastName.trim(),
        email: newPatient.email.trim(),
        phone: newPatient.phone.trim() || undefined,
      });
      const withLabel = { ...created, label: `${created.firstName} ${created.lastName}` };
      handleInputChange("patient", withLabel);
      setShowNewPatientForm(false);
      setNewPatient({ firstName: "", lastName: "", email: "", phone: "" });
      setNewPatientErrors({});
    } catch {
      setNewPatientErrors({ email: "Failed to create patient. Email may already be in use." });
    } finally {
      setIsCreatingPatient(false);
    }
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

      // No weekends
      const dayOfWeek = start.getDay(); // 0 = Sunday, 6 = Saturday
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        newErrors.startTime = "Appointments cannot be scheduled on weekends";
      }

      // Business hours: 7:00–19:00
      const startHour = start.getHours();
      const startMinutes = start.getMinutes();
      const endHour = end.getHours();
      const endMinutes = end.getMinutes();
      const startTotal = startHour * 60 + startMinutes;
      const endTotal = endHour * 60 + endMinutes;
      if (startTotal < 7 * 60 || startTotal >= 19 * 60) {
        newErrors.startTime = "Appointments must start between 7:00 AM and 7:00 PM";
      }
      if (endTotal > 19 * 60) {
        newErrors.endTime = "Appointments must end by 7:00 PM";
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

    const patientId = formData.patient?.id?.trim();
    if (!patientId) {
      setErrors((prev) => ({ ...prev, patientId: "Patient selection is required" }));
      return;
    }

    const startTimeISO = toApiDate(formData.startTime);
    const endTimeISO = toApiDate(formData.endTime);

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
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      // Auto-update end time to keep a 30-min duration when start time changes
      if (field === "startTime" && typeof value === "string" && value) {
        const start = new Date(value);
        if (!isNaN(start.getTime())) {
          const end = new Date(start.getTime() + 30 * 60 * 1000);
          updated.endTime = dateToLocalInput(end);
        }
      }
      return updated;
    });
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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <User className="w-5 h-5 text-primary-600 mr-2" />
              <h4 className="text-lg font-medium text-gray-900">Patient</h4>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowNewPatientForm(!showNewPatientForm);
                setNewPatientErrors({});
              }}
              className="flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              {showNewPatientForm ? (
                <>
                  <X className="w-4 h-4" />
                  Select existing
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  New patient
                </>
              )}
            </button>
          </div>

          {showNewPatientForm ? (
            <div className="space-y-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-medium text-blue-800">Create new patient</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    value={newPatient.firstName}
                    onChange={(e) => { setNewPatient(p => ({ ...p, firstName: e.target.value })); setNewPatientErrors(e => ({ ...e, firstName: "" })); }}
                    className={`block w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${newPatientErrors.firstName ? "border-red-300" : "border-gray-300"}`}
                    placeholder="John"
                    disabled={isCreatingPatient}
                  />
                  {newPatientErrors.firstName && <p className="mt-1 text-xs text-red-600">{newPatientErrors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    value={newPatient.lastName}
                    onChange={(e) => { setNewPatient(p => ({ ...p, lastName: e.target.value })); setNewPatientErrors(e => ({ ...e, lastName: "" })); }}
                    className={`block w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${newPatientErrors.lastName ? "border-red-300" : "border-gray-300"}`}
                    placeholder="Doe"
                    disabled={isCreatingPatient}
                  />
                  {newPatientErrors.lastName && <p className="mt-1 text-xs text-red-600">{newPatientErrors.lastName}</p>}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={newPatient.email}
                  onChange={(e) => { setNewPatient(p => ({ ...p, email: e.target.value })); setNewPatientErrors(e => ({ ...e, email: "" })); }}
                  className={`block w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${newPatientErrors.email ? "border-red-300" : "border-gray-300"}`}
                  placeholder="john.doe@example.com"
                  disabled={isCreatingPatient}
                />
                {newPatientErrors.email && <p className="mt-1 text-xs text-red-600">{newPatientErrors.email}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Phone (optional)</label>
                <input
                  type="tel"
                  value={newPatient.phone}
                  onChange={(e) => setNewPatient(p => ({ ...p, phone: e.target.value }))}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="+1 555 000 0000"
                  disabled={isCreatingPatient}
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => { setShowNewPatientForm(false); setNewPatientErrors({}); }}
                  className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 font-medium"
                  disabled={isCreatingPatient}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateNewPatient}
                  disabled={isCreatingPatient}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 disabled:opacity-60"
                >
                  {isCreatingPatient ? (
                    <><span className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />Creating...</>
                  ) : (
                    <><UserPlus className="w-3.5 h-3.5" />Save & Select</>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div>
              <label htmlFor="patient" className="block text-sm font-medium text-gray-700 mb-2">
                Patient *
              </label>
              <PatientSelect
                value={formData.patient && formData.patient.id ? formData.patient : undefined}
                onChange={(value) => handleInputChange("patient", value)}
                placeholder="Select a patient..."
                error={errors.patientId}
              />
              {errors.patientId && (
                <p className="mt-2 text-sm text-red-600">{errors.patientId}</p>
              )}
            </div>
          )}
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
