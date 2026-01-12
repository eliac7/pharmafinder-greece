export interface StatsLocation {
  name: string;
  count: number;
}

export interface Statistics {
  counts: {
    total: number;
    on_duty_today: number;
  };
  top_locations: {
    city: StatsLocation;
    prefecture: StatsLocation;
  };
}
