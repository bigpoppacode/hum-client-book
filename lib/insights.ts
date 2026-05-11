interface RideData {
  fare: number;
  date: string | Date;
}

export interface ClientInsights {
  rideFrequency: string;
  averageFare: number;
  totalSpent: number;
  regularityLabel: string;
  totalRides: number;
}

export function computeInsights(rides: RideData[]): ClientInsights {
  if (rides.length === 0) {
    return {
      rideFrequency: "No rides yet",
      averageFare: 0,
      totalSpent: 0,
      regularityLabel: "New",
      totalRides: 0,
    };
  }

  const totalSpent = rides.reduce((sum, r) => sum + r.fare, 0);
  const averageFare = totalSpent / rides.length;

  // Calculate frequency
  const dates = rides
    .map((r) => new Date(r.date).getTime())
    .sort((a, b) => a - b);

  let rideFrequency = "1 ride";
  let ridesPerWeek = 0;

  if (dates.length >= 2) {
    const spanMs = dates[dates.length - 1] - dates[0];
    const spanWeeks = Math.max(spanMs / (7 * 24 * 60 * 60 * 1000), 1);
    ridesPerWeek = rides.length / spanWeeks;

    if (ridesPerWeek >= 1) {
      const rounded = Math.round(ridesPerWeek * 10) / 10;
      rideFrequency = `${rounded}/week`;
    } else {
      const ridesPerMonth = ridesPerWeek * 4.33;
      const rounded = Math.round(ridesPerMonth * 10) / 10;
      rideFrequency = `${rounded}/month`;
    }
  }

  // Regularity label
  let regularityLabel: string;
  if (rides.length <= 2) {
    regularityLabel = "New";
  } else if (ridesPerWeek >= 2) {
    regularityLabel = "Very Regular";
  } else if (ridesPerWeek >= 1) {
    regularityLabel = "Regular";
  } else {
    regularityLabel = "Occasional";
  }

  return {
    rideFrequency,
    averageFare,
    totalSpent,
    regularityLabel,
    totalRides: rides.length,
  };
}
