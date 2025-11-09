# Changelog

All notable changes to the CarePoint Frontend project will be documented in this file.

## [Unreleased] - 2025-11-09

### Added
- **Vacation Management Feature**
  - New "Vacations" tab in settings page for doctors to manage vacation periods
  - Support for multiple vacation periods with start date, end date, and optional reason
  - Empty state UI with helpful call-to-action for adding vacations
  - Information banner explaining how vacations affect appointment scheduling
  - Integration with existing appointment system to prevent bookings during vacation
  - New API type definitions for vacation data (`src/app/api/doctor-settings.ts`)

- **Enhanced Logging**
  - Comprehensive timezone conversion logging in appointment creation
  - Detailed debug output showing local vs UTC time conversions
  - Console logs to help understand date/time handling

- **Centralized Date Utilities**
  - New `/src/app/utils/` directory for shared utilities
  - Consolidated date helper functions in `date-utils.ts`
  - Consistent date handling across all components

### Fixed
- **Critical: Appointments Not Appearing After Creation**
  - Fixed React Query cache invalidation to properly refetch appointment data
  - Changed date key generation to use local timezone instead of UTC for consistency
  - Added proper await statements for async query operations
  - Fixed date key mismatch between calendar queries and cache invalidation
  - Appointments now appear immediately in all views (list, day, week, month)

- **UI/UX Improvements**
  - Removed invalid `minuteStep` prop from time inputs
  - Fixed async handling in appointment and calendar modals
  - Improved error handling and user feedback

### Changed
- **Timezone Handling Clarification**
  - Added documentation explaining that timezone conversion was working correctly (stores UTC, displays local)
  - Updated `getDateKeyFromApi()` to use local date components instead of UTC
  - Standardized date key format across all calendar and appointment views

- **Code Organization**
  - Moved date utilities from `/src/app/calendar/` to `/src/app/utils/`
  - Removed redundant date utility files (`date-core.ts`, `timezone-utils.ts`, `utils.ts`)
  - Consolidated all date handling logic in centralized utilities

### Removed
- Deleted obsolete calendar utility files:
  - `src/app/calendar/date-core.ts`
  - `src/app/calendar/timezone-utils.ts`
  - `src/app/calendar/utils.ts`

### Technical Details
- Updated query invalidation to use exact match and forced refetch
- Changed from `invalidateQueries()` to `refetchQueries()` with exact match flag
- Ensured all date keys use local timezone consistently across the application
- Added `useFieldArray` hook for dynamic vacation period management

### Files Modified
- `src/app/appointments/page.tsx` - Fixed query invalidation
- `src/app/appointments/CreateAppointmentModal.tsx` - Enhanced logging
- `src/app/appointments/AppointmentForm.tsx` - Improved validation
- `src/app/appointments/AppointmentCard.tsx` - Better date display
- `src/app/appointments/AppointmentEditModal.tsx` - Fixed async handling
- `src/app/appointments/calendar/advanced/page.tsx` - Fixed invalidation
- `src/app/calendar/AppointmentModal.tsx` - Updated date handling
- `src/app/calendar/DayCalendar.tsx` - Consistent date keys
- `src/app/calendar/EventDetailsModal.tsx` - Improved UI
- `src/app/calendar/PatientSelect.tsx` - Enhanced UX
- `src/app/calendar/date-helpers.ts` - Updated imports
- `src/app/settings/page.tsx` - Added vacation management
- `src/app/ui/layout/Header.tsx` - Minor improvements
- `src/app/ui/primitives/Toast.tsx` - Better notifications
- `src/app/components/auth/LoginForm.tsx` - Updated authentication
- `.gitignore` - Added yarn.lock

### New Files
- `TIMEZONE_FIX_SUMMARY.md` - Detailed documentation of timezone fixes
- `VACATION_FEATURE_SUMMARY.md` - Vacation feature implementation guide
- `src/app/api/doctor-settings.ts` - API types for doctor settings
- `src/app/utils/date-utils.ts` - Centralized date utilities
- `yarn.lock` - Yarn package lock file

---

## Version History

This changelog follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) format.

### Categories
- **Added** for new features
- **Changed** for changes in existing functionality
- **Deprecated** for soon-to-be removed features
- **Removed** for now removed features
- **Fixed** for any bug fixes
- **Security** for vulnerability fixes

