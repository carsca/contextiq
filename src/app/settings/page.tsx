export default function SettingsPage() {
  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold mb-2">Settings</h1>
      <p className="text-sm text-gray-600 mb-8">
        Admin tools, system visibility, and future developer controls.
      </p>

      {/* Development Tools */}
      <div className="bg-white border rounded-lg p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Development Tools</h2>

        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Database Status</h3>
            <p className="text-sm text-gray-600">
              Activity logs are connected through Supabase and currently being
              used for dashboard summaries and activity tracking.
            </p>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Pattern Detection Pipeline</h3>
            <p className="text-sm text-gray-600">
              Behavioral pattern detection will process activity logs and create
              findings such as overworking, isolation, low social activity, or
              unhealthy routines.
            </p>
          </div>
        </div>
      </div>

      {/* Pattern Findings Debug View */}
      <div className="bg-white border rounded-lg p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">
          Pattern Findings Debug View
        </h2>

        <p className="text-sm text-gray-600 mb-4">
          This section will display generated behavioral findings from the
          backend pipeline.
        </p>

        <div className="border rounded-lg p-4">
          <p className="font-medium">No pattern findings yet</p>
          <p className="text-sm text-gray-600 mt-2">
            Once the pattern detection system is connected, records will appear
            here with:
          </p>

          <ul className="list-disc list-inside text-sm text-gray-600 mt-3 space-y-1">
            <li>Pattern type</li>
            <li>Confidence score</li>
            <li>Evidence JSON</li>
            <li>Created date</li>
          </ul>
        </div>
      </div>

      {/* Future Controls */}
      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Future Controls</h2>

        <p className="text-sm text-gray-600">
          Additional controls like notification preferences, user profile
          settings, and suggestion feedback will be added in later phases.
        </p>
      </div>
    </div>
  );
}