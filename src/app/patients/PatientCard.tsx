// src/app/patients/PatientCard.tsx
"use client";

import { Patient } from "../api/patients";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  Edit2,
  Trash2,
  MoreVertical,
} from "lucide-react";
import { useState } from "react";

interface PatientCardProps {
  patient: Patient;
  onEdit: (patient: Patient) => void;
  onDelete: (patient: Patient) => void;
}

export default function PatientCard({
  patient,
  onEdit,
  onDelete,
}: PatientCardProps) {
  const [showActions, setShowActions] = useState(false);

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return null;
    }
  };

  const getAge = (dateString?: string) => {
    if (!dateString) return null;
    try {
      const birthDate = new Date(dateString);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }
      return age > 0 ? `${age} years old` : null;
    } catch {
      return null;
    }
  };

  return (
    <div className="relative group">
      {/* Main card - clickable area for edit */}
      <div
        onClick={() => onEdit(patient)}
        className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all duration-200 cursor-pointer"
      >
        {/* Header with avatar and actions */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            {/* Avatar */}
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-700 font-semibold text-sm">
                {getInitials(patient.firstName, patient.lastName)}
              </span>
            </div>

            {/* Name and basic info */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {patient.firstName} {patient.lastName}
              </h3>
              {patient.dateOfBirth && (
                <p className="text-sm text-gray-500">
                  {getAge(patient.dateOfBirth)}
                </p>
              )}
            </div>
          </div>

          {/* Actions dropdown */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent card click
                setShowActions(!showActions);
              }}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showActions && (
              <>
                {/* Backdrop to close dropdown */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowActions(false)}
                />

                {/* Dropdown menu */}
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-20">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowActions(false);
                      onEdit(patient);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <Edit2 className="w-4 h-4 mr-3 text-gray-400" />
                    Edit Patient
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowActions(false);
                      onDelete(patient);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 flex items-center"
                  >
                    <Trash2 className="w-4 h-4 mr-3 text-red-400" />
                    Delete Patient
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Mail className="w-4 h-4 mr-3 text-gray-400 flex-shrink-0" />
            <span className="truncate">{patient.email}</span>
          </div>

          {patient.phone && (
            <div className="flex items-center text-sm text-gray-600">
              <Phone className="w-4 h-4 mr-3 text-gray-400 flex-shrink-0" />
              <span>{patient.phone}</span>
            </div>
          )}

          {patient.address && (
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="w-4 h-4 mr-3 text-gray-400 flex-shrink-0" />
              <span className="truncate">{patient.address}</span>
            </div>
          )}
        </div>

        {/* Additional Details */}
        <div className="space-y-2">
          {patient.dateOfBirth && (
            <div className="flex items-center text-sm text-gray-500">
              <Calendar className="w-4 h-4 mr-3 text-gray-400 flex-shrink-0" />
              <span>Born {formatDate(patient.dateOfBirth)}</span>
            </div>
          )}

          {patient.medicalHistory && (
            <div className="flex items-start text-sm text-gray-500">
              <FileText className="w-4 h-4 mr-3 mt-0.5 text-gray-400 flex-shrink-0" />
              <span className="line-clamp-2">
                {patient.medicalHistory.length > 100
                  ? `${patient.medicalHistory.substring(0, 100)}...`
                  : patient.medicalHistory}
              </span>
            </div>
          )}
        </div>

        {/* Edit hint */}
        <div className="mt-4 pt-3 border-t border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
          <p className="text-xs text-gray-400 flex items-center">
            <Edit2 className="w-3 h-3 mr-1" />
            Click to edit patient details
          </p>
        </div>
      </div>
    </div>
  );
}
