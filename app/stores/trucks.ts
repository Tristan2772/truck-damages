import type { SelectTruck, SelectTruckReportWithImages, SelectTruckWithReports } from "~/lib/db/schema";

export const useTrucksStore = defineStore("useTrucksStore", () => {
  const route = useRoute();
  const truckUrlWithVin = computed(() => `/api/trucks/${route.params.vin}`);
  const reportUrlWithVinAndId = computed(() => `/api/trucks/${route.params.vin}/${route.params.id}`);

  const { data: allTrucks, status: allTrucksStatus, refresh: allTrucksRefresh,
  } = useFetch<SelectTruck[]>("/api/trucks", {
    lazy: true,
  });

  const { data: currentTruck, status: currentTruckStatus, error: currentTruckError, refresh: currentTruckRefresh } = useFetch<SelectTruckWithReports>(truckUrlWithVin, {
    lazy: true,
    immediate: false,
    watch: false,
  });

  const { data: currentReport, status: currentReportStatus, error: currentReportError, refresh: currentReportRefresh } = useFetch<SelectTruckReportWithImages>(reportUrlWithVinAndId, {
    lazy: true,
    immediate: false,
    watch: false,
  });

  return {
    allTrucks,
    allTrucksStatus,
    allTrucksRefresh,
    currentTruck,
    currentTruckStatus,
    currentTruckError,
    currentTruckRefresh,
    currentReport,
    currentReportStatus,
    currentReportError,
    currentReportRefresh,
  };
});
