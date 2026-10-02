'use strict';

// Published seat-space averages are applied to a selected layout automatically.
// Keep physical seats separate from weighted economy-equivalent seats.
window.CarbonAllocation = (() => {
  const reference = window.CARBON_REFERENCE;
  const labels = {
    economy: 'Economy',
    premium: 'Premium Economy',
    business: 'Business',
    first: 'First',
  };
  const orderedCabins = ['economy', 'premium', 'business', 'first'];
  const widebody = (model) =>
    /Boeing (747|767|777|787)|Airbus A(300|330|340|350|380)/.test(model);
  const layouts = (operator, model) => {
    const published = reference.configurations.profiles.filter(
      (profile) =>
        profile.operator.toLowerCase() === operator.trim().toLowerCase() &&
        profile.aircraft === model,
    );
    const aircraft = reference.aircraft[model];
    if (!aircraft) return [];
    const weightGroup = widebody(model) ? 'widebody' : 'regional';
    const factors =
      aircraft.seats < 60
        ? { economy: 1 }
        : reference.configurations.weights[weightGroup];
    // Existing model-level values are retained as indicative seat equivalents.
    // They are never presented as an independently verified airline cabin map.
    const fallback = {
      id: 'reference',
      label: 'Aircraft-type estimate · airline layout unverified',
      operator,
      aircraft: model,
      equivalentSeats: aircraft.seats,
      factors,
      weightGroup,
      status: 'Aircraft-type estimate',
      source: 'Retained project aircraft reference; airline seating unverified',
      checked: '2026-09-29',
    };
    return [...published, fallback];
  };
  const calculate = (operator, model, layoutId, cabinKey) => {
    const layout = layouts(operator, model).find((profile) => profile.id === layoutId);
    if (!layout) throw Error('Choose the aircraft and seating layout.');
    const weights =
      layout.factors || reference.configurations.weights[layout.weightGroup];
    const available = orderedCabins.filter((key) =>
      layout.cabins ? layout.cabins[key] > 0 : weights[key] > 0,
    );
    if (!available.includes(cabinKey))
      throw Error('Choose a cabin available in this layout.');
    const equivalentSeats = layout.cabins
      ? Object.entries(layout.cabins).reduce(
          (total, [key, seats]) => total + seats * weights[key],
          0,
        )
      : layout.equivalentSeats;
    return {
      seats: equivalentSeats,
      cabin: weights[cabinKey],
      cabinKey,
      cabinLabel: labels[cabinKey],
      layoutId: layout.id,
      layoutLabel: layout.label,
      layoutSource: layout.source,
      layoutStatus: layout.status,
      seatCount: layout.cabins
        ? Object.values(layout.cabins).reduce((total, count) => total + count, 0)
        : null,
      cabinSeats: layout.cabins || null,
      cabinWeights: weights,
      allocationSource: reference.configurations.factorSource,
      allocationVersion: reference.configurations.version,
      available,
    };
  };
  return { labels, orderedCabins, layouts, calculate };
})();
