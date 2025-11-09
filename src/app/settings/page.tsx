// src/app/settings/page.tsx
"use client";

import Sidebar from "../ui/layout/Sidebar";
import Header from "../ui/layout/Header";
import Card from "../ui/primitives/Card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getDoctorSettings,
  updateDoctorSettings,
  DoctorSettings,
  DoctorProfile,
  WorkingHours,
  AppointmentSettings,
  Vacation,
  DAYS_OF_WEEK,
} from "../api/doctor-settings";
import { useAuth } from "../contexts/AuthContext";
import { useState, useEffect } from "react";
import Input from "../ui/primitives/Input";
import Button from "../ui/primitives/Button";
import { Clock, User, Calendar, Save, Plus, Trash2, Globe, Linkedin, Twitter, Facebook, Instagram, Plane } from "lucide-react";
import { useForm, useFieldArray } from "react-hook-form";
import { useToast } from "../ui/primitives/Toast";

export default function SettingsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<"profile" | "hours" | "appointments" | "vacations">("profile");

  // Fetch doctor settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ["doctor-settings"],
    queryFn: getDoctorSettings,
    enabled: !!user,
  });

  // Initialize default settings if not loaded
  const defaultSettings: DoctorSettings = {
    profile: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      specialty: user?.specialty || "",
      bio: "",
      phone: "",
      address: "",
      city: "",
      zipCode: "",
      country: "",
      website: "",
      linkedin: "",
      twitter: "",
      facebook: "",
      instagram: "",
    },
    workingHours: DAYS_OF_WEEK.map((_, index) => ({
      dayOfWeek: index,
      isAvailable: index >= 1 && index <= 5, // Monday to Friday by default
      startTime: "09:00",
      endTime: "17:00",
    })),
    appointmentSettings: {
      defaultDuration: 30,
      defaultFee: 80,
      consultationTypes: [
        { type: "Consultation", duration: 30, fee: 80 },
        { type: "Follow-up", duration: 15, fee: 50 },
        { type: "Routine Checkup", duration: 45, fee: 120 },
      ],
      timeSlotInterval: 15,
      advanceBookingDays: 90,
      sameDayBooking: true,
    },
    vacations: [],
  };

  const form = useForm<DoctorSettings>({
    defaultValues: defaultSettings,
    values: settings || defaultSettings,
  });

  const { register, handleSubmit, control, formState: { errors, isDirty }, reset } = form;

  // Reset form when settings are loaded
  useEffect(() => {
    if (settings) {
      reset(settings);
    }
  }, [settings, reset]);

  const { fields: consultationTypes, append: appendType, remove: removeType } = useFieldArray({
    control,
    name: "appointmentSettings.consultationTypes",
  });

  const { fields: vacations, append: appendVacation, remove: removeVacation } = useFieldArray({
    control,
    name: "vacations",
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: updateDoctorSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor-settings"] });
      toast.push({
        message: "Settings saved successfully!",
        kind: "success",
      });
    },
    onError: (error: any) => {
      console.error("Failed to save settings:", error);
      toast.push({
        message: error.response?.data?.message || "Failed to save settings. Please try again.",
        kind: "error",
      });
    },
  });

  const onSubmit = (data: DoctorSettings) => {
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <div className="pl-64">
          <Header />
          <main className="p-8">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="pl-64">
        <Header />
        <main className="p-8 space-y-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
            <p className="text-sm text-gray-500 mt-1">
              Configure your profile, working hours, and appointment preferences
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-gray-200">
            <button
              onClick={() => setActiveTab("profile")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "profile"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <User className="w-4 h-4 inline mr-2" />
              Profile
            </button>
            <button
              onClick={() => setActiveTab("hours")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "hours"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <Clock className="w-4 h-4 inline mr-2" />
              Working Hours
            </button>
            <button
              onClick={() => setActiveTab("appointments")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "appointments"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <Calendar className="w-4 h-4 inline mr-2" />
              Appointments
            </button>
            <button
              onClick={() => setActiveTab("vacations")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "vacations"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <Plane className="w-4 h-4 inline mr-2" />
              Vacations
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Profile Section */}
            {activeTab === "profile" && (
              <Card>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      Profile Information
                    </h3>
                    <p className="text-sm text-gray-500">
                      This information will be visible to patients when booking appointments
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="First Name"
                      {...register("profile.firstName", { required: "First name is required" })}
                      error={errors.profile?.firstName?.message}
                    />
                    <Input
                      label="Last Name"
                      {...register("profile.lastName", { required: "Last name is required" })}
                      error={errors.profile?.lastName?.message}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Email"
                      type="email"
                      {...register("profile.email", { required: "Email is required" })}
                      error={errors.profile?.email?.message}
                    />
                    <Input
                      label="Phone"
                      type="tel"
                      {...register("profile.phone")}
                      error={errors.profile?.phone?.message}
                    />
                  </div>

                  <Input
                    label="Specialty"
                    {...register("profile.specialty")}
                    error={errors.profile?.specialty?.message}
                    helperText="e.g., Cardiology, Pediatrics, General Practice"
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bio
                    </label>
                    <textarea
                      {...register("profile.bio")}
                      rows={4}
                      className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                      placeholder="Tell patients about your experience and expertise..."
                    />
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-4">Address</h4>
                    <div className="space-y-4">
                      <Input
                        label="Street Address"
                        {...register("profile.address")}
                        error={errors.profile?.address?.message}
                      />
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input
                          label="City"
                          {...register("profile.city")}
                          error={errors.profile?.city?.message}
                        />
                        <Input
                          label="ZIP Code"
                          {...register("profile.zipCode")}
                          error={errors.profile?.zipCode?.message}
                        />
                        <Input
                          label="Country"
                          {...register("profile.country")}
                          error={errors.profile?.country?.message}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-1">Social Media & Web Presence</h4>
                    <p className="text-xs text-gray-500 mb-4">
                      Add your professional social media profiles and website
                    </p>
                    <div className="space-y-4">
                      <div className="relative">
                        <Globe className="absolute left-3 top-9 h-4 w-4 text-gray-400" />
                        <Input
                          label="Website"
                          type="url"
                          placeholder="https://yourwebsite.com"
                          {...register("profile.website")}
                          error={errors.profile?.website?.message}
                          className="pl-10"
                        />
                      </div>
                      
                      <div className="relative">
                        <Linkedin className="absolute left-3 top-9 h-4 w-4 text-gray-400" />
                        <Input
                          label="LinkedIn"
                          type="url"
                          placeholder="https://linkedin.com/in/yourprofile"
                          {...register("profile.linkedin")}
                          error={errors.profile?.linkedin?.message}
                          className="pl-10"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                          <Twitter className="absolute left-3 top-9 h-4 w-4 text-gray-400" />
                          <Input
                            label="Twitter / X"
                            type="url"
                            placeholder="https://twitter.com/yourhandle"
                            {...register("profile.twitter")}
                            error={errors.profile?.twitter?.message}
                            className="pl-10"
                          />
                        </div>
                        
                        <div className="relative">
                          <Facebook className="absolute left-3 top-9 h-4 w-4 text-gray-400" />
                          <Input
                            label="Facebook"
                            type="url"
                            placeholder="https://facebook.com/yourpage"
                            {...register("profile.facebook")}
                            error={errors.profile?.facebook?.message}
                            className="pl-10"
                          />
                        </div>
                      </div>
                      
                      <div className="relative">
                        <Instagram className="absolute left-3 top-9 h-4 w-4 text-gray-400" />
                        <Input
                          label="Instagram"
                          type="url"
                          placeholder="https://instagram.com/yourprofile"
                          {...register("profile.instagram")}
                          error={errors.profile?.instagram?.message}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Working Hours Section */}
            {activeTab === "hours" && (
              <Card>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      Working Hours
                    </h3>
                    <p className="text-sm text-gray-500">
                      Set your availability for each day of the week
                    </p>
                  </div>

                  <div className="space-y-4">
                    {DAYS_OF_WEEK.map((day, index) => {
                      const dayHours = form.watch(`workingHours.${index}`);
                      return (
                        <div
                          key={index}
                          className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg"
                        >
                          <div className="w-32">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                {...register(`workingHours.${index}.isAvailable`)}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <span className="text-sm font-medium text-gray-900">{day}</span>
                            </label>
                          </div>

                          {dayHours?.isAvailable && (
                            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">
                                  Start Time
                                </label>
                                <Input
                                  type="time"
                                  {...register(`workingHours.${index}.startTime`)}
                                  className="text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">
                                  End Time
                                </label>
                                <Input
                                  type="time"
                                  {...register(`workingHours.${index}.endTime`)}
                                  className="text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">
                                  Break Start
                                </label>
                                <Input
                                  type="time"
                                  {...register(`workingHours.${index}.breakStartTime`)}
                                  className="text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">
                                  Break End
                                </label>
                                <Input
                                  type="time"
                                  {...register(`workingHours.${index}.breakEndTime`)}
                                  className="text-sm"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Card>
            )}

            {/* Appointment Settings Section */}
            {activeTab === "appointments" && (
              <Card>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      Appointment Settings
                    </h3>
                    <p className="text-sm text-gray-500">
                      Configure default appointment durations, fees, and booking rules
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Default Duration (minutes)"
                      type="number"
                      {...register("appointmentSettings.defaultDuration", {
                        required: "Default duration is required",
                        min: { value: 5, message: "Minimum 5 minutes" },
                        valueAsNumber: true,
                      })}
                      error={errors.appointmentSettings?.defaultDuration?.message}
                    />
                    <Input
                      label="Default Fee (€)"
                      type="number"
                      step="0.01"
                      {...register("appointmentSettings.defaultFee", {
                        valueAsNumber: true,
                      })}
                      error={errors.appointmentSettings?.defaultFee?.message}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Time Slot Interval (minutes)"
                      type="number"
                      {...register("appointmentSettings.timeSlotInterval", {
                        valueAsNumber: true,
                        min: { value: 5, message: "Minimum 5 minutes" },
                      })}
                      error={errors.appointmentSettings?.timeSlotInterval?.message}
                      helperText="Interval between available time slots (e.g., 15, 30)"
                    />
                    <Input
                      label="Advance Booking Days"
                      type="number"
                      {...register("appointmentSettings.advanceBookingDays", {
                        valueAsNumber: true,
                        min: { value: 1, message: "Minimum 1 day" },
                      })}
                      error={errors.appointmentSettings?.advanceBookingDays?.message}
                      helperText="How many days in advance patients can book"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      {...register("appointmentSettings.sameDayBooking")}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label className="text-sm text-gray-700">
                      Allow same-day booking
                    </label>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">
                          Consultation Types
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                          Define different appointment types with durations and fees
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        icon={<Plus className="w-4 h-4" />}
                        onClick={() =>
                          appendType({ type: "", duration: 30, fee: 0 })
                        }
                      >
                        Add Type
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {consultationTypes.map((field, index) => (
                        <div
                          key={field.id}
                          className="flex items-end gap-3 p-4 border border-gray-200 rounded-lg"
                        >
                          <div className="flex-1">
                            <Input
                              label="Type Name"
                              {...register(
                                `appointmentSettings.consultationTypes.${index}.type` as const,
                                { required: "Type name is required" }
                              )}
                              placeholder="e.g., Consultation, Follow-up"
                            />
                          </div>
                          <div className="w-32">
                            <Input
                              label="Duration (min)"
                              type="number"
                              {...register(
                                `appointmentSettings.consultationTypes.${index}.duration` as const,
                                {
                                  required: "Duration is required",
                                  valueAsNumber: true,
                                  min: { value: 5, message: "Min 5" },
                                }
                              )}
                            />
                          </div>
                          <div className="w-32">
                            <Input
                              label="Fee (€)"
                              type="number"
                              step="0.01"
                              {...register(
                                `appointmentSettings.consultationTypes.${index}.fee` as const,
                                { valueAsNumber: true }
                              )}
                            />
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            icon={<Trash2 className="w-4 h-4" />}
                            onClick={() => removeType(index)}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Vacations Section */}
            {activeTab === "vacations" && (
              <Card>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      Vacation Periods
                    </h3>
                    <p className="text-sm text-gray-500">
                      Manage your vacation periods to block appointments during these times
                    </p>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      icon={<Plus className="w-4 h-4" />}
                      onClick={() =>
                        appendVacation({
                          startDate: "",
                          endDate: "",
                          reason: "",
                        })
                      }
                    >
                      Add Vacation Period
                    </Button>
                  </div>

                  {vacations.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                      <Plane className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <h4 className="text-sm font-medium text-gray-900 mb-1">
                        No vacation periods
                      </h4>
                      <p className="text-xs text-gray-500 mb-4">
                        Add vacation periods to block appointments during those times
                      </p>
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        icon={<Plus className="w-4 h-4" />}
                        onClick={() =>
                          appendVacation({
                            startDate: "",
                            endDate: "",
                            reason: "",
                          })
                        }
                      >
                        Add Your First Vacation Period
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {vacations.map((field, index) => (
                        <div
                          key={field.id}
                          className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                        >
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <Input
                                label="Start Date"
                                type="date"
                                {...register(`vacations.${index}.startDate` as const, {
                                  required: "Start date is required",
                                })}
                                error={errors.vacations?.[index]?.startDate?.message}
                              />
                              <Input
                                label="End Date"
                                type="date"
                                {...register(`vacations.${index}.endDate` as const, {
                                  required: "End date is required",
                                })}
                                error={errors.vacations?.[index]?.endDate?.message}
                              />
                            </div>
                            <div className="flex items-end gap-3">
                              <div className="flex-1">
                                <Input
                                  label="Reason (optional)"
                                  {...register(`vacations.${index}.reason` as const)}
                                  placeholder="e.g., Summer vacation, Conference, etc."
                                  error={errors.vacations?.[index]?.reason?.message}
                                />
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                icon={<Trash2 className="w-4 h-4" />}
                                onClick={() => removeVacation(index)}
                              >
                                Remove
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {vacations.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex gap-3">
                        <div className="flex-shrink-0">
                          <svg
                            className="w-5 h-5 text-blue-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-blue-900 mb-1">
                            Important Information
                          </h4>
                          <p className="text-xs text-blue-700">
                            During vacation periods, no appointments can be scheduled. Existing appointments will not be affected. Make sure to inform your patients about your vacation in advance.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Save Button */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button
                type="submit"
                variant="primary"
                icon={<Save className="w-4 h-4" />}
                loading={updateMutation.isPending}
                disabled={!isDirty}
              >
                Save Settings
              </Button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
