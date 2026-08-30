import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  reportProduct,
} from "@/entities/pharmacy";

interface ReportData {
  report_type: "closed" | "wrong_coords" | "wrong_info" | "other";
  description: string;
  turnstile_token: string;
}

interface ReportVariables {
  pharmacyId: string;
  data: ReportData;
}

export function useReportPharmacy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ pharmacyId, data }: ReportVariables) =>
      reportProduct(pharmacyId, data),
    onSuccess: (_data, { pharmacyId }) => {
      queryClient.invalidateQueries({ queryKey: ["pharmacy", pharmacyId] });
    },
    onError: (error) => {
      console.error("Report error:", error);
      toast.error("Αποτυχία υποβολής αναφοράς", {
        description: "Παρακαλώ δοκιμάστε ξανά αργότερα.",
      });
    },
  });
}
