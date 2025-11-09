// Updated: src/app/calendar/EventDetailsModal.tsx - Professional Medical Interface
"use client";

import {
  Calendar,
  Clock,
  User,
  DollarSign,
  Edit2,
  Trash2,
  Stethoscope,
  Heart,
  Activity,
  FileText,
} from "lucide-react";
import Modal from "../ui/primitives/Modal";
import Button from "../ui/primitives/Button";
import { Patient } from "../api/patients";
import { formatTime } from "../utils/calendar-utils";

export type CalendarEventVM = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  patient?: Patient;
  fee?: number;
  type?: "consultation" | "follow_up" | "routine_checkup";
  status?: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";
  description?: string;
  color?: string;
};

interface EventDetailsModalProps {
  open: boolean;
  event: CalendarEventVM | null;
  onClose: () => void;
  onEdit: (evt: CalendarEventVM) => void;
  onDelete: (evt: CalendarEventVM) => void;
}

export default function EventDetailsModal({
  open,
  event,
  onClose,
  onEdit,
  onDelete,
}: EventDetailsModalProps) {
  if (!event) return null;

  // Format date and time for display
  const formatDateTime = (date: Date) => {
    return {
      date: date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      time: formatTime(date),
    };
  };

  // Calculate duration
  const getDuration = () => {
    const minutes = Math.round(
      (event.end.getTime() - event.start.getTime()) / (1000 * 60)
    );
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${minutes}m`;
  };

  // Get appointment type icon and info
  const getTypeInfo = () => {
    switch (event.type) {
      case "consultation":
        return {
          icon: <Stethoscope className="w-5 h-5 text-blue-600" />,
          label: "Consultation",
          color: "bg-blue-50 border-blue-200 text-blue-800",
        };
      case "follow_up":
        return {
          icon: <Heart className="w-5 h-5 text-green-600" />,
          label: "Follow-up Visit",
          color: "bg-green-50 border-green-200 text-green-800",
        };
      case "routine_checkup":
        return {
          icon: <Activity className="w-5 h-5 text-purple-600" />,
          label: "Routine Checkup",
          color: "bg-purple-50 border-purple-200 text-purple-800",
        };
      default:
        return {
          icon: <Calendar className="w-5 h-5 text-gray-600" />,
          label: "Appointment",
          color: "bg-gray-50 border-gray-200 text-gray-800",
        };
    }
  };

  // Get status badge styling
  const getStatusInfo = () => {
    switch (event.status) {
      case "confirmed":
        return {
          label: "Confirmed",
          color: "bg-green-100 border-green-300 text-green-800",
        };
      case "pending":
        return {
          label: "Pending Confirmation",
          color: "bg-yellow-100 border-yellow-300 text-yellow-800",
        };
      case "in_progress":
        return {
          label: "In Progress",
          color: "bg-blue-100 border-blue-300 text-blue-800",
        };
      case "completed":
        return {
          label: "Completed",
          color: "bg-gray-100 border-gray-300 text-gray-800",
        };
      case "cancelled":
        return {
          label: "Cancelled",
          color: "bg-red-100 border-red-300 text-red-800",
        };
      default:
        return {
          label: "Scheduled",
          color: "bg-blue-100 border-blue-300 text-blue-800",
        };
    }
  };

  const startInfo = formatDateTime(event.start);
  const endInfo = formatDateTime(event.end);
  const typeInfo = getTypeInfo();
  const statusInfo = getStatusInfo();

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Appointment Details"
      description="View and manage appointment information"
      size="lg"
    >
      <div className="space-y-6">
        {/* Appointment Header with Status */}
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              {typeInfo.icon}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 mb-1">
                {event.title}
              </h3>
              <p className="text-sm text-gray-600 mb-3">{typeInfo.label}</p>
              {event.description && (
                <p className="text-gray-600 text-sm mb-3">
                  {event.description}
                </p>
              )}
            </div>
          </div>

          {/* Status Badge */}
          <div>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}
            >
              {statusInfo.label}
            </span>
          </div>
        </div>

        {/* Schedule Information */}
        <div>
          <div className="flex items-center mb-4">
            <Clock className="w-5 h-5 text-blue-600 mr-2" />
            <h4 className="text-lg font-medium text-gray-900">Schedule</h4>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            {/* Date and Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <div>
                <div className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                  Date
                </div>
                <p className="text-base font-semibold text-gray-900">
                  {startInfo.date}
                </p>
              </div>
              <div>
                <div className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 mr-2 text-gray-500" />
                  Duration
                </div>
                <p className="text-base font-semibold text-gray-900">
                  {getDuration()}
                </p>
              </div>
            </div>

            {/* Time Range */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Start Time
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {startInfo.time}
                  </p>
                </div>
                <div className="flex-1 flex items-center justify-center">
                  <div className="w-16 h-px bg-gray-300"></div>
                  <Clock className="w-4 h-4 mx-3 text-gray-400" />
                  <div className="w-16 h-px bg-gray-300"></div>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    End Time
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {endInfo.time}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Patient & Payment Information */}
        <div>
          <div className="flex items-center mb-4">
            <User className="w-5 h-5 text-blue-600 mr-2" />
            <h4 className="text-lg font-medium text-gray-900">
              Patient & Payment
            </h4>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Patient Information */}
              <div>
                <div className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 mr-2 text-gray-500" />
                  Patient
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-base font-medium text-gray-900">
                      {event.patient
                        ? `Patient ID: ${event.patient.firstName} ${event.patient.lastName}`
                        : "No patient assigned"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {event.patient
                        ? "Patient record available"
                        : "Assign a patient to this appointment"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Fee Information */}
              <div>
                <div className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="w-4 h-4 mr-2 text-gray-500" />
                  Consultation Fee
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <DollarSign className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-gray-900">
                      {event.fee ? `€${event.fee}` : "No fee set"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {event.fee ? "Billing amount" : "Fee to be determined"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        {(event.type || event.description) && (
          <div>
            <div className="flex items-center mb-4">
              <FileText className="w-5 h-5 text-blue-600 mr-2" />
              <h4 className="text-lg font-medium text-gray-900">
                Additional Information
              </h4>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              {event.type && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Appointment Type
                  </p>
                  <div
                    className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium border ${typeInfo.color}`}
                  >
                    {typeInfo.icon}
                    <span className="ml-2">{typeInfo.label}</span>
                  </div>
                </div>
              )}

              {event.description && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </p>
                  <p className="text-gray-900 bg-white p-3 rounded border">
                    {event.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-6 border-t border-gray-200">
          <Button type="button" variant="secondary" onClick={onClose}>
            Close
          </Button>

          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              onEdit(event);
            }}
          >
            <Edit2 className="w-4 h-4 mr-2" />
            Edit Appointment
          </Button>

          <Button
            type="button"
            variant="danger"
            onClick={() => {
              onDelete(event);
            }}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Appointment
          </Button>
        </div>
      </div>
    </Modal>
  );
}
