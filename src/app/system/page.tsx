// src/app/system/page.tsx
"use client";

import Sidebar from "../ui/layout/Sidebar";
import Header from "../ui/layout/Header";
import Card from "../ui/primitives/Card";
import { useQuery } from "@tanstack/react-query";
import { health, info, ready } from "../api/system";

export default function SystemPage() {
  const qHealth = useQuery({ queryKey: ["health"], queryFn: health });
  const qReady = useQuery({ queryKey: ["ready"], queryFn: ready });
  const qInfo = useQuery({ queryKey: ["info"], queryFn: info });

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="pl-64">
        <Header />

        <main className="p-8 space-y-8">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">System</h1>
            <p className="text-sm text-gray-500">
              Health, readiness, build info
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <div className="text-sm text-gray-500">Health</div>
              <pre className="mt-2 text-xs text-gray-800 bg-gray-50 p-3 rounded border border-gray-100">
                {JSON.stringify(qHealth.data ?? {}, null, 2)}
              </pre>
            </Card>
            <Card>
              <div className="text-sm text-gray-500">Ready</div>
              <pre className="mt-2 text-xs text-gray-800 bg-gray-50 p-3 rounded border border-gray-100">
                {JSON.stringify(qReady.data ?? {}, null, 2)}
              </pre>
            </Card>
            <Card>
              <div className="text-sm text-gray-500">Info</div>
              <pre className="mt-2 text-xs text-gray-800 bg-gray-50 p-3 rounded border border-gray-100">
                {JSON.stringify(qInfo.data ?? {}, null, 2)}
              </pre>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
