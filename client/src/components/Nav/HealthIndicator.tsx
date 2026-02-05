import { useEffect, useState } from "react";

const HEALTH_ENDPOINT = import.meta.env.VITE_HEALTH_ENDPOINT;

function HealthIndicator() {
  const [healthy, setHealthy] = useState<boolean | null>(null);

  useEffect(() => {
    let isMounted = true;

    const checkHealthy = async () => {
      try {
        const res = await fetch(HEALTH_ENDPOINT);
        if (res.ok && isMounted) {
          setHealthy(true);
        } else if (isMounted) {
          setHealthy(false);
        }
      } catch {
        if (isMounted) setHealthy(false);
      }
    };

    const interval = setInterval(checkHealthy, 5000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const color = healthy === null ? "#94a3b8" : healthy ? "#16a34a" : "#dc2626";
  const tooltip = healthy === null ? "Checking server..." : healthy ? "Server healthy" : "Server unreachable";
  const label = healthy === null ? "Checking" : healthy ? "Healthy" : "Offline";

  return (
    <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-semibold text-slate-600">
      <span
        title={tooltip}
        className="inline-block h-2.5 w-2.5 rounded-full"
        style={{
          background: color,
          boxShadow: "0 0 6px rgba(0,0,0,0.15)",
        }}
      />
      <span>{label}</span>
    </div>
  );

}

export default HealthIndicator;
