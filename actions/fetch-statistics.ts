export const fetchStatistics = async (endpoint: string) => {
  try {
    const response = await fetch(`/api/statistics/${endpoint}`);
    if (!response.ok) throw new Error("Network response was not ok");
    return response.json();
  } catch (error) {
    console.error("Failed to fetch:", error);
    throw error;
  }
};
