// src/app/appointments/AppointmentCard.tsx
"use client";

import { useState } from "react";
import { Appointment } from "../api/appointments";
import {
  Clock,
  User,
  Calendar,
  MapPin,
  DollarSign,
  Edit2,
  Trash2,
  MoreVertical,
  Stethoscope,
  Heart,
  Activity,
} from "lucide-react";
import StatusBadge from "./StatusBadge";
import { formatTime } from "../utils/calendar-utils";

interface AppointmentCardProps {
  appointment: Appointment;
  onEdit: (appointment: Appointment) => void;
  onDelete: (appointment: Appointment) => void;
  onViewDetails?: (appointment: Appointment) => void;
}

export default function AppointmentCard({
  appointment,
  onEdit,
  onDelete,
  onViewDetails,
}: AppointmentCardProps) {
  const [showActions, setShowActions] = useState(false);

  // Format date and time
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
      time: formatTime(date),
    };
  };

  // Calculate duration
  const getDuration = () => {
    // appointment.startTime and endTime are ISO strings from API
    const start = new Date(appointment.startTime);
    const end = new Date(appointment.endTime);
    const minutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0) {
      return `${hours}h ${mins > 0 ? `${mins}m` : ""}`;
    }
    return `${minutes}m`;
  };

  // Get appointment type icon
  const getTypeIcon = () => {
    switch (appointment.type) {
      case "consultation":
        return <Stethoscope className="w-4 h-4" />;
      case "follow_up":
        return <Heart className="w-4 h-4" />;
      case "routine_checkup":
        return <Activity className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  // Get status color
  const getStatusColor = () => {
    switch (appointment.status) {
      case "confirmed":
        return "text-green-600 bg-green-100";
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "in_progress":
        return "text-blue-600 bg-blue-100";
      case "completed":
        return "text-gray-600 bg-gray-100";
      case "cancelled":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const startInfo = formatDateTime(appointment.startTime);
  const endInfo = formatDateTime(appointment.endTime);

  return (
    <div className="relative group">
      {/* Main card - clickable area */}
      <div
        onClick={() => onViewDetails?.(appointment)}
        className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all duration-200 cursor-pointer"
      >
        {/* Header with type icon and actions */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-3">
            {/* Type Icon */}
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center ${getStatusColor()}`}
            >
              {getTypeIcon()}
            </div>

            {/* Title and Patient */}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {appointment.title}
              </h3>
              <div className="flex items-center text-sm text-gray-600 mb-1">
                <User className="w-4 h-4 mr-2 text-gray-400" />
                <span>
                  Patient ID: {appointment?.patient?.firstName}&nbsp;
                  {appointment?.patient?.lastName}
                </span>
              </div>
              {appointment.description && (
                <p className="text-sm text-gray-500 line-clamp-1">
                  {appointment.description}
                </p>
              )}
            </div>
          </div>

          {/* Actions dropdown */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowActions(!showActions);
              }}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showActions && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowActions(false)}
                />

                {/* Dropdown */}
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-20">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowActions(false);
                      onEdit(appointment);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <Edit2 className="w-4 h-4 mr-3 text-gray-400" />
                    Edit Appointment
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowActions(false);
                      onDelete(appointment);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 flex items-center"
                  >
                    <Trash2 className="w-4 h-4 mr-3 text-red-400" />
                    Cancel Appointment
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Status Badge */}
        <div className="mb-4">
          <StatusBadge status={appointment.status} />
        </div>

        {/* Appointment Details */}
        <div className="space-y-3">
          {/* Date and Time */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-gray-600">
              <Calendar className="w-4 h-4 mr-2 text-gray-400" />
              <span className="font-medium">{startInfo.date}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Clock className="w-4 h-4 mr-2 text-gray-400" />
              <span>
                {startInfo.time} - {endInfo.time}
              </span>
            </div>
          </div>

          {/* Duration and Fee */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-gray-600">
              <Activity className="w-4 h-4 mr-2 text-gray-400" />
              <span>Duration: {getDuration()}</span>
            </div>
            {appointment.fee && (
              <div className="flex items-center text-gray-600">
                <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
                <span className="font-medium">{appointment.fee}€</span>
              </div>
            )}
          </div>

          {/* Appointment Type */}
          <div className="flex items-center text-sm text-gray-600">
            {getTypeIcon()}
            <span className="ml-2 capitalize">
              {appointment.type?.replace("_", " ") || "Consultation"}
            </span>
          </div>
        </div>

        {/* Quick Actions Hint */}
        <div className="mt-4 pt-3 border-t border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
          <p className="text-xs text-gray-400 flex items-center">
            <Edit2 className="w-3 h-3 mr-1" />
            Click to view details • Hover for actions
          </p>
        </div>
      </div>
    </div>
  );
}
