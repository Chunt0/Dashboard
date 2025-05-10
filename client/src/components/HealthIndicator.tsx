import { useEffect, useState } from "react";

const HEALTH_ENDPOINT = "http://100.87.171.32:3003/health";

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
    <div style={{ position: "fixed", top: 16, right: 24, zIndex: 1000 }}>
      <span
        title={tooltip}
        style={{
          display: "inline-block",
          width: 16,
          height: 16,
          borderRadius: "50%",
          background: color,
          boxShadow: "0 0 4px rgba(0,0,0,0.2)",
          border: "2px solid #fff",
        }}
      />
    </div>
  );
}

export default HealthIndicator;
