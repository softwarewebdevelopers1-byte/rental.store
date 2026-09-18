import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { saveLastRoute } from "../utils/storage";

export function RouteTracker() {
  const location = useLocation();

  useEffect(() => {
    saveLastRoute(location.pathname + location.search);
  }, [location.pathname, location.search]);

  return null;
}