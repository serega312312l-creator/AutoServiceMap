import { useCallback, useEffect, useState } from "react";
import { CarProfile } from "@/types/car";
import {
  getCars,
  getActiveCar,
  saveCar,
  deleteCar,
  setActiveCar,
  updateCarMileage,
} from "@/services/carProfileService";

export function useCarProfiles() {
  const [cars, setCars] = useState<CarProfile[]>([]);
  const [activeCar, setActiveCarState] = useState<CarProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [allCars, active] = await Promise.all([getCars(), getActiveCar()]);
    setCars(allCars);
    setActiveCarState(active);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addOrUpdate = useCallback(
    async (data: Parameters<typeof saveCar>[0]) => {
      const car = await saveCar(data);
      await refresh();
      return car;
    },
    [refresh]
  );

  const remove = useCallback(
    async (id: string) => {
      await deleteCar(id);
      await refresh();
    },
    [refresh]
  );

  const selectActive = useCallback(
    async (id: string) => {
      await setActiveCar(id);
      await refresh();
    },
    [refresh]
  );

  const updateMileage = useCallback(
    async (id: string, km: number) => {
      await updateCarMileage(id, km);
      await refresh();
    },
    [refresh]
  );

  return { cars, activeCar, loading, refresh, addOrUpdate, remove, selectActive, updateMileage };
}
