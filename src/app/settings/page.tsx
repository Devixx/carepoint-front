// src/app/settings/page.tsx
import Sidebar from "../ui/layout/Sidebar";
import Header from "../ui/layout/Header";
import Card from "../ui/primitives/Card";

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="pl-64">
        <Header />
        <main className="p-8 space-y-8">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
            <p className="text-sm text-gray-500">
              Configure profile and clinic preferences
            </p>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <Card>
              <h3 className="text-lg font-semibold text-gray-900">Profile</h3>
              <p className="text-sm text-gray-500 mt-1">Coming soon.</p>
            </Card>
            <Card>
              <h3 className="text-lg font-semibold text-gray-900">
                Working hours
              </h3>
              <p className="text-sm text-gray-500 mt-1">Coming soon.</p>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
