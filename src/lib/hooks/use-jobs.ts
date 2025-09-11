import { useState, useEffect } from "react";
import { jobService } from "@/lib/services/jobs";
import { JobWithDetails } from "@/lib/types/database";

export function useJobs() {
  const [jobs, setJobs] = useState<JobWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const data = await jobService.getJobs();
      setJobs(data);
      setError(null);
    } catch (err) {
      setError("Error al cargar trabajos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const refreshJobs = async () => {
    await loadJobs();
  };

  return { jobs, loading, error, refreshJobs };
}

export function useJobsByStatus(status: string) {
  const [jobs, setJobs] = useState<JobWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const data = await jobService.getJobsByStatus(status);
      setJobs(data);
      setError(null);
    } catch (err) {
      setError("Error al cargar trabajos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, [status]);

  const refreshJobs = async () => {
    await loadJobs();
  };

  return { jobs, loading, error, refreshJobs };
}
