'use strict';

// All emissions are stored in kilograms. No radiative-forcing uplift is applied.
window.CarbonMath = (() => {
  const validDate = (value) =>
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(Date.parse(value + 'T12:00:00Z')) &&
    new Date(value + 'T12:00:00Z').toISOString().slice(0, 10) === value;
  const fiscalYear = (date) =>
    'FY' +
    String(Number(date.slice(0, 4)) + (Number(date.slice(5, 7)) >= 7 ? 1 : 0)).slice(
      -2,
    );
  const distance = (from, to) => {
    const radians = Math.PI / 180;
    const haversine =
      Math.sin(((to.lat - from.lat) * radians) / 2) ** 2 +
      Math.cos(from.lat * radians) *
        Math.cos(to.lat * radians) *
        Math.sin(((to.lon - from.lon) * radians) / 2) ** 2;
    return (
      6371.0088 *
      2 *
      Math.atan2(
        Math.sqrt(Math.min(1, haversine)),
        Math.sqrt(Math.max(0, 1 - haversine)),
      )
    );
  };
  const interpolate = (curve, stage) => {
    if (!curve || curve.length < 2) return null;
    let index = curve.findIndex((point) => point[0] >= stage);
    if (index <= 0) index = index === -1 ? curve.length - 1 : 1;
    const lower = curve[index - 1],
      upper = curve[index];
    return {
      fuel: Math.max(
        0,
        lower[1] + ((upper[1] - lower[1]) * (stage - lower[0])) / (upper[0] - lower[0]),
      ),
      range:
        stage < curve[0][0]
          ? 'below table'
          : stage > curve[curve.length - 1][0]
            ? 'above table'
            : 'within table',
    };
  };
  const routeGroup = (from, to) => {
    const regions = [from.region, to.region].sort(),
      pair = regions.join('-');
    const domestic = from.countryCode === to.countryCode;
    if (domestic && from.region === 'SSA')
      return {
        id: 'v9-75',
        name: 'Sub-Saharan Africa domestic',
        load: 0.7112,
        cargo: 0.8441,
        source: 'ICAO v9 Appendix A',
      };
    if (pair === 'SSA-SSA')
      return {
        id: 'v9-74',
        name: 'Intra Sub-Saharan Africa',
        load: 0.654,
        cargo: 0.8441,
        source: 'ICAO v9 Appendix A',
      };
    const legacy = {
      EUR: [32, 0.7831, 0.8216],
      NAM: [56, 0.7693, 0.9074],
      MEA: [41, 0.732, 0.8309],
      SAM: [70, 0.6458, 0.8441],
      NAF: [49, 0.654, 0.8441],
      PSEA: [67, 0.7308, 0.839],
      NAS: [62, 0.7308, 0.839],
      SWA: [73, 0.7308, 0.839],
    };
    const other = regions.find((region) => region !== 'SSA');
    if (regions.includes('SSA') && legacy[other]) {
      const [id, load, cargo] = legacy[other];
      return {
        id: 'v9-' + id,
        name: other + ' / Sub-Saharan Africa',
        load,
        cargo,
        source: 'ICAO v9 Appendix A',
      };
    }
    const groups = {
      'NAF-PSEA': [1, 0.737, 0.8382],
      'NAF-NAS': [1, 0.737, 0.8382],
      'NAF-SWA': [1, 0.737, 0.8382],
      'MEA-NAF': [2, 0.741, 0.8292],
      'NAF-NAM': [3, 0.771, 0.9111],
      'CAM-NAF': [4, 0.779, 0.8403],
      'CAM-SSA': [4, 0.779, 0.8403],
      'CAM-MEA': [4, 0.779, 0.8403],
      'NAF-SAM': [5, 0.65, 0.8397],
      'MEA-SAM': [5, 0.65, 0.8397],
      'CAM-EUR': [6, 0.817, 0.8657],
      'CAM-NAM': [7, 0.807, 0.9317],
      'CAM-SAM': [8, 0.797, 0.8942],
      'EUR-SWA': [9, 0.815, 0.6343],
      'CAM-SWA': [10, 0.803, 0.8445],
      'SAM-SWA': [10, 0.803, 0.8445],
      'MEA-SWA': [11, 0.789, 0.8118],
      'NAM-SWA': [12, 0.833, 0.6238],
      'NAS-SWA': [13, 0.712, 0.7947],
      'PSEA-SWA': [14, 0.748, 0.8012],
      'EUR-MEA': [15, 0.745, 0.7719],
      'EUR-NAF': [16, 0.736, 0.8199],
      'EUR-NAM': [17, 0.831, 0.7996],
      'EUR-NAS': [18, 0.8, 0.6343],
      'EUR-PSEA': [19, 0.802, 0.6343],
      'EUR-SAM': [20, 0.849, 0.7669],
      'NAF-NAF': [22, 0.661, 0.8432],
      'CAM-CAM': [23, 0.677, 0.9609],
      'SWA-SWA': [24, 0.698, 0.7947],
      'EUR-EUR': [25, 0.823, 0.9612],
      'MEA-MEA': [26, 0.702, 0.8456],
      'NAM-NAM': [27, 0.791, 0.9335],
      'NAS-NAS': [28, 0.753, 0.7947],
      'PSEA-PSEA': [29, 0.778, 0.7947],
      'SAM-SAM': [30, 0.771, 0.8266],
      'CAM-NAS': [31, 0.729, 0.8467],
      'CAM-PSEA': [31, 0.729, 0.8467],
      'NAS-SAM': [31, 0.729, 0.8467],
      'PSEA-SAM': [31, 0.729, 0.8467],
      'MEA-NAM': [32, 0.839, 0.7989],
      'MEA-NAS': [33, 0.765, 0.8118],
      'MEA-PSEA': [33, 0.765, 0.8118],
      'NAM-NAS': [34, 0.823, 0.6644],
      'NAM-PSEA': [35, 0.809, 0.8457],
      'NAM-SAM': [36, 0.826, 0.7727],
      'NAS-PSEA': [37, 0.753, 0.7947],
    };
    const group = groups[pair];
    if (!group) throw Error('No supported regional allocation for this route.');
    return {
      id: 'v13.1-' + group[0],
      name: pair + (domestic ? ' (regional average for domestic travel)' : ''),
      load: group[1],
      cargo: group[2],
      source: 'ICAO v13.1 Appendix A',
    };
  };
  const flight = ({
    from,
    to,
    aircraft,
    seats,
    cabin,
    passengers,
    curves,
    manualKg,
    manualSource,
  }) => {
    if (!from || !to)
      throw Error(
        'Choose recognised departure and arrival airports from the search results.',
      );
    if (from.code === to.code) throw Error('Departure and arrival must differ.');
    if (!Number.isInteger(passengers) || passengers < 1 || passengers > 500)
      throw Error('Enter 1–500 traveller names, one per line.');
    if (!aircraft) throw Error('Choose the aircraft used for this leg.');
    if (
      !Number.isFinite(seats) ||
      seats < 1 ||
      seats > 3000 ||
      !(cabin >= 0.1 && cabin <= 10)
    )
      throw Error('Check seating and cabin allocation.');
    const dist = distance(from, to),
      det = dist < 550 ? 50 : dist <= 5500 ? 100 : 125,
      nm = (dist + det) / 1.852;
    const burn = interpolate(curves[aircraft.icao], nm),
      group = routeGroup(from, to);
    if (!burn && !(Number.isFinite(manualKg) && manualKg > 0 && manualSource.trim()))
      throw Error('This aircraft needs a documented CO₂ estimate per passenger.');
    const perPax = burn
      ? ((burn.fuel * 3.16 * group.cargo) / (seats * group.load)) * cabin
      : manualKg;
    return {
      dist,
      det,
      bill: dist + det,
      nm,
      fuel: burn?.fuel ?? null,
      range: burn?.range ?? 'manual',
      group,
      seats,
      cabin,
      perPax,
      emissionsKg: perPax * passengers,
      tco2: (perPax * passengers) / 1000,
      domestic: from.countryCode === to.countryCode,
    };
  };
  const motorcycle = ({
    start,
    end,
    dist,
    intensity,
    gridFactor,
    baselineFactor,
    substitution,
    charging,
    gridShare,
    measured,
  }) => {
    if (!validDate(start) || !validDate(end) || end < start)
      throw Error('Enter a valid recording period.');
    if (start.slice(0, 7) !== end.slice(0, 7))
      throw Error(
        'Split records by calendar month so monthly and financial-year totals remain accurate.',
      );
    if (!Number.isFinite(dist) || dist <= 0)
      throw Error(
        'Distance must be positive. Closing odometer must exceed opening odometer.',
      );
    if (
      ![intensity, gridFactor, baselineFactor, substitution].every(Number.isFinite) ||
      intensity <= 0 ||
      gridFactor < 0 ||
      baselineFactor <= 0 ||
      substitution < 0 ||
      substitution > 100
    )
      throw Error('Check energy, emissions and substitution factors.');
    if (charging === 'auto') {
      if (start < '2025-04-01')
        throw Error('Before April 2025, choose the actual charging source.');
      gridShare = end < '2025-09-01' ? 100 : 0;
    } else if (charging === 'grid') gridShare = 100;
    else if (charging === 'solar') gridShare = 0;
    if (!Number.isFinite(gridShare) || gridShare < 0 || gridShare > 100)
      throw Error('Grid share must be between 0 and 100%.');
    if (measured !== null && (!Number.isFinite(measured) || measured < 0))
      throw Error('Measured electricity must be zero or positive, or left blank.');
    const energy = measured === null ? dist * intensity : measured;
    const baselineKg = (dist * baselineFactor * substitution) / 100,
      emissionsKg = ((energy * gridShare) / 100) * gridFactor;
    return {
      dist,
      energy,
      energyBasis: measured === null ? 'Estimated use' : 'Measured charging',
      gridShare,
      baselineKg,
      emissionsKg,
      savedKg: baselineKg - emissionsKg,
      tco2: emissionsKg / 1000,
    };
  };
  return {
    validDate,
    fiscalYear,
    distance,
    interpolate,
    routeGroup,
    flight,
    motorcycle,
  };
})();
