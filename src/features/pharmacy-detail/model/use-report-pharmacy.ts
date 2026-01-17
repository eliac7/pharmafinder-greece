import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { pharmacyApi } from "@/entities/pharmacy/api/pharmacy.api";

interface ReportData {
  report_type: string;
  description: string;
  turnstile_token: string;
}

interface ReportVariables {
  pharmacyId: number;
  data: ReportData;
}

export function useReportPharmacy() {
  return useMutation({
    mutationFn: ({ pharmacyId, data }: ReportVariables) =>
      pharmacyApi.reportPharmacy(pharmacyId, data),
    onError: (error) => {
      console.error("Report error:", error);
      toast.error("Αποτυχία υποβολής αναφοράς", {
        description: "Παρακαλώ δοκιμάστε ξανά αργότερα.",
      });
    },
  });
}
