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

  let color = healthy === null ? "#cccccc" : healthy ? "#24c150" : "#d32d27";
  let tooltip = healthy === null ? "Checking server..." : healthy ? "Server healthy" : "Server unreachable";

  return (
    <div className="flex top-4 right-60 z-50"> {/* Tailwind classes for positioning */}
      <span
        title={tooltip}
        className="inline-block w-4 h-4 rounded-full" // Tailwind classes for styling
        style={{
          background: color,
          boxShadow: "0 0 4px rgba(0,0,0,0.2)",
        }}
      />
    </div>
  );

}

export default HealthIndicator;
