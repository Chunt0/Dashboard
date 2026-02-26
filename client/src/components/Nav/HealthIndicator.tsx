import { useEffect, useState } from "react";
import { fetchWithAuth } from "../../utils/api";

const HEALTH_ENDPOINT = import.meta.env.VITE_HEALTH_ENDPOINT;

function HealthIndicator() {
  const [healthy, setHealthy] = useState<boolean | null>(null);

  useEffect(() => {
    let isMounted = true;

    const checkHealthy = async () => {
      try {
		const res = await fetchWithAuth(HEALTH_ENDPOINT);
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

	const color = healthy === null ? "#64748b" : healthy ? "#22c55e" : "#ef4444";
  const tooltip = healthy === null ? "Checking server..." : healthy ? "Server healthy" : "Server unreachable";
  const label = healthy === null ? "Checking" : healthy ? "Healthy" : "Offline";

	return (
		<div className="flex items-center gap-2 border border-slate-800 bg-slate-950 px-3 py-1 text-xs font-medium text-slate-300">
			<span
				title={tooltip}
				className="inline-block h-2.5 w-2.5"
				style={{
					background: color,
					boxShadow: "none",
				}}
			/>
      <span>{label}</span>
    </div>
  );

}

export default HealthIndicator;
