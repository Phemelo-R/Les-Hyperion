'use strict';

(() => {
  const element = (id) => document.getElementById(id);
  const reference = window.CARBON_REFERENCE;
  const airportMap = new Map(
    reference.airports.map((airport) => [airport.code, airport]),
  );
  const normalise = (text) =>
    String(text ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  const escapeHtml = (text) =>
    String(text ?? '').replace(
      /[<>&"']/g,
      (character) =>
        ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' })[
          character
        ],
    );
  const number = (value, decimals = 2) =>
    Number(value || 0).toLocaleString('en-GB', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  const value = (id) => element(id).value.trim();
  const numeric = (id) => (element(id).value === '' ? NaN : Number(element(id).value));
  const today = new Date(),
    localDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const customType = 'Unlisted aircraft — documented estimate';
  let flightEditing = null,
    bikeEditing = null,
    deletedRecord = null,
    charts = [],
    activeMode = 'flight',
    routeMode = 'domestic';
  const airportLabel = (airport) =>
    `${airport.code} — ${airport.name} · ${airport.city || airport.country} · ${airport.country}`;
  const selectedAirport = (id) => {
    const code = value(id).split(' — ')[0].toUpperCase();
    return (
      airportMap.get(code) ||
      reference.airports.find((airport) => airport.icao === code)
    );
  };
  const landscape = (id) =>
    reference.landscapes.find((place) => place.name === value(id));
  const message = (text) => {
    element('carbon-message').textContent = text;
  };
  const status = () => {
    element('storage-status').textContent = !CarbonStore.writable
      ? CarbonStore.error
      : CarbonStore.available
        ? 'Saved on this browser · ' + CarbonStore.entries.length + ' records'
        : 'Storage unavailable or full — download a backup before closing this page.';
  };
  const option = (label, selection) => {
    const item = document.createElement('option');
    item.value = selection;
    item.textContent = label;
    return item;
  };
  const countryName = (code) =>
    reference.airports.find((airport) => airport.countryCode === code)?.country || code;
  const airportScope = (field) =>
    routeMode === 'domestic' ? value('domestic-country') : value(field + '-country');
  window.CarbonFlightScope = { airport: airportScope };
  const routeHint = () => {
    element('route-search-hint').textContent =
      routeMode === 'domestic'
        ? 'Both airports must be in ' +
          countryName(value('domestic-country')) +
          '. Change Flight country for domestic travel elsewhere.'
        : 'Search worldwide, or choose countries to narrow the list. Record connecting flights as separate legs.';
  };
  const validateRoute = (input) => {
    if (!input.from || !input.to) return;
    if (
      routeMode === 'domestic' &&
      (input.from.countryCode !== value('domestic-country') ||
        input.to.countryCode !== value('domestic-country'))
    )
      throw Error(
        'Choose both airports in the flight country, or switch to International.',
      );
    if (
      routeMode === 'international' &&
      input.from.countryCode === input.to.countryCode
    )
      throw Error(
        'Both airports are in one country. Use the Domestic tab for this leg.',
      );
    for (const field of ['from', 'to']) {
      if (airportScope(field) && input[field].countryCode !== airportScope(field))
        throw Error(
          'Choose an airport in the selected ' +
            (field === 'from' ? 'departure' : 'arrival') +
            ' country.',
        );
    }
  };
  const allocation = () =>
    CarbonAllocation.calculate(
      value('flight-operator'),
      value('flight-aircraft'),
      value('flight-layout'),
      value('flight-cabin-class'),
    );
  const flightInput = () => {
    const names = value('flight-names')
      .split(/[\n;]+/)
      .map((name) => name.trim())
      .filter(Boolean);
    return {
      from: selectedAirport('flight-from'),
      to: selectedAirport('flight-to'),
      aircraft: reference.aircraft[value('flight-aircraft')],
      ...allocation(),
      passengers: names.length,
      names,
      curves: reference.curves,
      manualKg: numeric('flight-manual-kg'),
      manualSource: value('flight-manual-source'),
    };
  };
  const renderFlight = () => {
    const names = value('flight-names')
      .split(/[\n;]+/)
      .filter((name) => name.trim());
    element('passenger-count').textContent =
      names.length + (names.length === 1 ? ' passenger' : ' passengers');
    const aircraft = reference.aircraft[value('flight-aircraft')];
    element('manual-flight').hidden =
      !aircraft || Boolean(reference.curves[aircraft.icao]);
    element('custom-aircraft-field').hidden = value('flight-aircraft') !== customType;
    const from = selectedAirport('flight-from'),
      to = selectedAirport('flight-to');
    element('route-classification').textContent =
      from && to
        ? from.countryCode === to.countryCode
          ? 'Domestic · ' + from.country
          : 'International · ' + from.country + ' → ' + to.country
        : 'Select two airports';
    element('flight-allocation-summary').textContent = '';
    element('flight-allocation-detail').textContent = '';
    try {
      const input = flightInput();
      element('flight-allocation-summary').textContent =
        (input.seatCount
          ? input.seatCount + ' seats'
          : number(input.seats, 0) + ' reference seat equivalents') +
        ' · ' +
        input.cabinLabel +
        ' · ' +
        number(input.cabin, 2) +
        '× Economy allocation' +
        (input.layoutId === 'reference' ? ' · Estimated layout' : '');
      const sourceLink = /^https:\/\//.test(input.layoutSource)
        ? `<a href="${escapeHtml(input.layoutSource)}" target="_blank" rel="noopener">Seating source</a>`
        : escapeHtml(input.layoutSource);
      element('flight-allocation-detail').innerHTML =
        `<p>${escapeHtml(input.layoutLabel)}. ${sourceLink}</p><p>Automatic denominator: ${number(input.seats, 2)} economy-equivalent seats. ${
          input.cabinSeats
            ? Object.entries(input.cabinSeats)
                .map(
                  ([key, count]) =>
                    escapeHtml(CarbonAllocation.labels[key]) + ': ' + count,
                )
                .join(' · ')
            : 'This model-level reference is not an airline-specific seat map.'
        }</p><p>Cabin factors: ${Object.entries(input.cabinWeights)
          .map(
            ([key, factor]) =>
              escapeHtml(CarbonAllocation.labels[key]) + ' ' + number(factor, 2) + '×',
          )
          .join(
            ' · ',
          )}. <a href="${escapeHtml(input.allocationSource)}" target="_blank" rel="noopener">Published average weights</a>.</p>`;
      validateRoute(input);
      const result = CarbonMath.flight(input);
      element('flight-result').innerHTML =
        `<strong>${number(result.tco2, 3)} <small>tCO₂</small></strong><p>${number(result.perPax, 1)} kg per passenger · ${input.passengers} travellers · ${escapeHtml(input.cabinLabel)}</p>`;
      element('flight-working').innerHTML =
        `<dl><dt>Great-circle distance</dt><dd>${number(result.dist, 0)} km</dd><dt>Detour allowance</dt><dd>${result.det} km</dd><dt>Estimated aircraft fuel</dt><dd>${result.fuel === null ? 'Documented estimate' : number(result.fuel, 1) + ' kg'}</dd><dt>Load factor</dt><dd>${number(result.group.load * 100)}%</dd><dt>Passenger cargo allocation</dt><dd>${number(result.group.cargo * 100)}%</dd><dt>Equivalent seats</dt><dd>${number(result.seats, 2)}</dd><dt>Cabin factor</dt><dd>${number(result.cabin, 2)}×</dd></dl><p class="chint">${escapeHtml(result.group.name)} · ${escapeHtml(result.group.source)}. ${result.range === 'within table' ? 'Interpolated within the fuel table.' : result.range === 'manual' ? 'The supplied estimate already includes the selected cabin.' : 'Extrapolated ' + escapeHtml(result.range) + '; confirm aircraft suitability.'}</p>`;
      element('flight-error').textContent = '';
    } catch (error) {
      element('flight-result').textContent = aircraft
        ? error.message
        : 'Choose the operating airline and aircraft to calculate this leg.';
      element('flight-working').textContent = '';
    }
  };
  const cabinChoices = (preserve = true) => {
    const previous = value('flight-cabin-class');
    const layout = CarbonAllocation.layouts(
      value('flight-operator'),
      value('flight-aircraft'),
    ).find((item) => item.id === value('flight-layout'));
    const weights = layout
      ? layout.factors || reference.configurations.weights[layout.weightGroup]
      : {};
    const keys = CarbonAllocation.orderedCabins.filter((key) =>
      layout?.cabins ? layout.cabins[key] > 0 : weights[key] > 0,
    );
    element('flight-cabin-class').replaceChildren(
      ...keys.map((key) => option(CarbonAllocation.labels[key], key)),
    );
    if (preserve && keys.includes(previous))
      element('flight-cabin-class').value = previous;
    element('flight-cabin-class').disabled = keys.length <= 1;
    renderFlight();
  };
  const layoutChoices = (preserve = false) => {
    const previous = value('flight-layout');
    const layouts = CarbonAllocation.layouts(
      value('flight-operator'),
      value('flight-aircraft'),
    );
    element('flight-layout').replaceChildren(
      ...layouts.map((layout) => option(layout.label, layout.id)),
    );
    if (preserve && layouts.some((layout) => layout.id === previous))
      element('flight-layout').value = previous;
    element('flight-layout-field').hidden = layouts.length <= 1;
    cabinChoices(preserve);
  };
  const aircraftChoices = (preserve = true) => {
    const previous = value('flight-aircraft');
    const operator = reference.operators.find(
      (item) => normalise(item.name) === normalise(value('flight-operator')),
    );
    const models =
      operator?.aircraft.length && !element('all-aircraft').checked
        ? [...operator.aircraft, customType]
        : Object.keys(reference.aircraft);
    element('flight-aircraft').replaceChildren(
      option('Choose the aircraft on your ticket', ''),
      ...models
        .slice()
        .sort()
        .map((name) =>
          option(
            name +
              (reference.curves[reference.aircraft[name]?.icao]
                ? ''
                : ' — documented estimate'),
            name,
          ),
        ),
    );
    if (preserve && models.includes(previous))
      element('flight-aircraft').value = previous;
    element('operator-note').textContent = operator?.aircraft.length
      ? 'Select the aircraft actually used. Seating fills automatically.'
      : 'Fleet not verified here: choose the aircraft shown on your ticket. Model-level seating is labelled as an estimate.';
    layoutChoices(preserve);
  };
  const resetOperatorFilter = () => {
    const code = routeMode === 'domestic' ? value('domestic-country') : '';
    element('operator-country').value = [...element('operator-country').options].some(
      (item) => item.value === code,
    )
      ? code
      : '';
    const operator = reference.operators.find(
      (item) => normalise(item.name) === normalise(value('flight-operator')),
    );
    if (code && operator && operator.countryCode !== code) {
      element('flight-operator').value = '';
      aircraftChoices(false);
    }
  };
  const changeRouteMode = (mode, clearIncompatible = true) => {
    if (mode === 'domestic' && routeMode !== mode && clearIncompatible) {
      element('domestic-country').value =
        landscape('flight-landscape')?.countryCode || 'ZA';
    }
    routeMode = mode;
    for (const name of ['domestic', 'international']) {
      element(name + '-tab').setAttribute('aria-selected', String(mode === name));
      element(name + '-tab').tabIndex = mode === name ? 0 : -1;
    }
    element('flight-route-fields').setAttribute('aria-labelledby', mode + '-tab');
    element('domestic-country-field').hidden = mode !== 'domestic';
    element('international-countries').hidden = mode !== 'international';
    if (clearIncompatible) {
      if (mode === 'international') {
        element('from-country').value = '';
        element('to-country').value = '';
        const from = selectedAirport('flight-from'),
          to = selectedAirport('flight-to');
        if (from && to && from.countryCode === to.countryCode)
          element('flight-to').value = '';
      } else {
        for (const field of ['from', 'to']) {
          const airport = selectedAirport('flight-' + field);
          if (airport && airport.countryCode !== value('domestic-country'))
            element('flight-' + field).value = '';
        }
      }
    }
    resetOperatorFilter();
    routeHint();
    renderFlight();
  };
  const bikeInput = () => ({
    start: value('ebike-start'),
    end: value('ebike-end'),
    dist:
      value('ebike-distance-mode') === 'odometer'
        ? numeric('ebike-closing') - numeric('ebike-opening')
        : numeric('ebike-distance'),
    intensity: numeric('ebike-intensity'),
    gridFactor: numeric('ebike-grid-factor'),
    baselineFactor: numeric('ebike-baseline-factor'),
    substitution: numeric('ebike-substitution'),
    charging: value('ebike-charging'),
    gridShare: numeric('ebike-grid-share'),
    measured: value('ebike-measured') === '' ? null : numeric('ebike-measured'),
  });
  const renderBike = () => {
    const odometer = value('ebike-distance-mode') === 'odometer';
    element('odometer-fields').hidden = !odometer;
    element('distance-fields').hidden = odometer;
    element('ebike-distance').required = !odometer;
    element('ebike-opening').required = odometer;
    element('ebike-closing').required = odometer;
    element('grid-share-field').hidden = value('ebike-charging') !== 'mixed';
    try {
      const result = CarbonMath.motorcycle(bikeInput());
      element('ebike-result').innerHTML =
        `<strong>${number(result.savedKg)} <small>kg avoided</small></strong><p>${result.baselineKg > 0 ? number((result.savedKg / result.baselineKg) * 100, 1) + '% reduction against the selected baseline' : 'No replacement baseline'}</p>`;
      element('ebike-working').innerHTML =
        `<dl><dt>Distance</dt><dd>${number(result.dist)} km</dd><dt>${result.energyBasis}</dt><dd>${number(result.energy)} kWh</dd><dt>Grid share</dt><dd>${number(result.gridShare, 0)}%</dd><dt>Boda-boda baseline</dt><dd>${number(result.baselineKg)} kg</dd><dt>Charging emissions</dt><dd>${number(result.emissionsKg)} kg</dd></dl>`;
      element('ebike-error').textContent = '';
    } catch (error) {
      element('ebike-result').textContent = error.message;
      element('ebike-working').textContent = '';
    }
  };
  const switchMode = (mode) => {
    activeMode = mode;
    for (const name of ['flight', 'ebike']) {
      element(name + '-panel').hidden = name !== mode;
      element(name + '-tab').setAttribute('aria-selected', String(name === mode));
      element(name + '-tab').tabIndex = name === mode ? 0 : -1;
    }
    document.querySelectorAll('[data-mode-view]').forEach((section) => {
      section.hidden = section.dataset.modeView !== mode;
    });
    element('charts-title').textContent =
      mode === 'flight'
        ? 'Flight emissions over time.'
        : 'Electricity & avoided emissions.';
    element('records-title').textContent =
      mode === 'flight' ? 'Your flight records.' : 'Your motorcycle records.';
    element('record-journey-heading').textContent =
      mode === 'flight' ? 'Route / aircraft / cabin' : 'Motorcycle';
    element('record-search').placeholder =
      mode === 'flight'
        ? 'Search travellers, routes, airlines…'
        : 'Search rangers, registrations…';
    element('record-search').value = '';
    renderRecords();
    drawCharts();
  };
  const renderRecords = () => {
    const query = normalise(value('record-search')),
      mode = activeMode;
    const records = CarbonStore.entries
      .filter(
        (entry) =>
          entry.mode === mode &&
          normalise(
            [
              entry.name,
              entry.landscape,
              entry.registration,
              entry.from,
              entry.to,
              entry.operator,
            ].join(' '),
          ).includes(query),
      )
      .sort((first, second) => second.date.localeCompare(first.date));
    element('record-count').textContent =
      `${records.length} ${activeMode === 'flight' ? 'flight' : 'motorcycle'} records shown. The Excel workbook includes both modes on separate sheets.`;
    element('carbon-records').innerHTML = records.length
      ? records
          .map(
            (entry) =>
              `<tr><td>${escapeHtml(entry.mode === 'ebike' && entry.start !== entry.end ? entry.start + ' – ' + entry.end : entry.date)}<small>${CarbonMath.fiscalYear(entry.date)}</small></td><td>${escapeHtml(entry.name)}</td><td>${escapeHtml(entry.landscape)}</td><td>${escapeHtml(entry.mode === 'flight' ? entry.from + ' → ' + entry.to : entry.registration)}<small>${escapeHtml(entry.mode === 'flight' ? (entry.customAircraft || entry.aircraft) + ' · ' + (entry.cabinLabel || 'Earlier cabin allocation') : 'Electric motorcycle')}</small></td><td>${number(entry.dist, 1)}</td><td>${number(entry.emissionsKg)}</td>${entry.mode === 'ebike' ? '<td>' + number(entry.savedKg) + '</td>' : ''}<td><button class="carbon-secondary" type="button" data-edit="${escapeHtml(entry.id)}">Edit</button> <button class="carbon-secondary" type="button" data-delete="${escapeHtml(entry.id)}">Delete</button></td></tr>`,
          )
          .join('')
      : `<tr><td colspan="${activeMode === 'flight' ? 7 : 8}">No records match this view.</td></tr>`;
  };
  const renderChartCanvases = () => {
    if (typeof Chart === 'undefined') return;
    charts.forEach((chart) => chart.destroy());
    charts = [];
    const months = new Map();
    for (const entry of CarbonStore.entries.filter(
      (item) => item.mode === activeMode,
    )) {
      const month = entry.date.slice(0, 7);
      if (!months.has(month))
        months.set(month, { flight: 0, baseline: 0, electric: 0, saved: 0 });
      const total = months.get(month);
      if (entry.mode === 'flight') total.flight += entry.emissionsKg / 1000;
      else {
        total.baseline += entry.baselineKg / 1000;
        total.electric += entry.emissionsKg / 1000;
        total.saved += entry.savedKg / 1000;
      }
    }
    const labels = [...months.keys()].sort(),
      text =
        getComputedStyle(document.documentElement).getPropertyValue('--text').trim() ||
        '#0f2d3a';
    element('charts-empty').hidden = labels.length > 0;
    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: text } },
        tooltip: {
          callbacks: {
            label: (context) =>
              `${context.dataset.label}: ${number(context.parsed.y, 4)} t`,
          },
        },
      },
      scales: {
        x: { ticks: { color: text } },
        y: {
          beginAtZero: true,
          ticks: { color: text },
          title: { display: true, text: 'tonnes', color: text },
        },
      },
    };
    if (activeMode === 'flight')
      charts.push(
        new Chart(element('flight-chart'), {
          type: 'bar',
          data: {
            labels,
            datasets: [
              {
                label: 'Flight CO₂',
                data: labels.map((month) => months.get(month).flight),
                backgroundColor: '#5e7f6b',
              },
            ],
          },
          options,
        }),
      );
    if (activeMode === 'ebike')
      charts.push(
        new Chart(element('ebike-chart'), {
          type: 'bar',
          data: {
            labels,
            datasets: [
              {
                label: 'Boda-boda baseline',
                data: labels.map((month) => months.get(month).baseline),
                backgroundColor: '#b05046',
              },
              {
                label: 'Charging emissions',
                data: labels.map((month) => months.get(month).electric),
                backgroundColor: '#d4af6b',
              },
              {
                type: 'line',
                label: 'Avoided emissions',
                data: labels.map((month) => months.get(month).saved),
                borderColor: '#5e7f6b',
                backgroundColor: '#5e7f6b',
                tension: 0.15,
              },
            ],
          },
          options,
        }),
      );
  };
  // Chart failures must never disable record entry or transport switching.
  const drawCharts = () => {
    try {
      if (typeof Chart === 'undefined')
        throw new Error('The chart library is unavailable.');
      renderChartCanvases();
      if (charts.some((chart) => chart.ctx === null))
        throw new Error('Canvas is unavailable.');
      element('chart-status').hidden = true;
    } catch (error) {
      for (const chart of charts) {
        try {
          chart.destroy();
        } catch (_) {}
      }
      charts = [];
      element('chart-status').hidden = false;
      element('chart-status').textContent =
        'Charts are unavailable in this browser. Your calculations, records and Excel export still work.';
      console.warn('Carbon charts:', error.message);
    }
  };
  const refresh = () => {
    status();
    const flights = CarbonStore.entries.filter((entry) => entry.mode === 'flight'),
      bikes = CarbonStore.entries.filter((entry) => entry.mode === 'ebike');
    const sum = (records, key) =>
      records.reduce((total, entry) => total + (Number(entry[key]) || 0), 0);
    element('total-flights').textContent = number(
      sum(flights, 'emissionsKg') / 1000,
      3,
    );
    element('total-electric').textContent = number(sum(bikes, 'emissionsKg') / 1000, 3);
    element('total-saved').textContent = number(sum(bikes, 'savedKg') / 1000, 3);
    element('total-distance').textContent = number(sum(bikes, 'dist'), 0);
    element('total-flight-legs').textContent = number(flights.length, 0);
    element('total-flight-passengers').textContent = number(sum(flights, 'pax'), 0);
    element('total-flight-distance').textContent = number(sum(flights, 'dist'), 0);
    element('total-bike-records').textContent = number(bikes.length, 0);
    for (const [id, key] of [
      ['ranger-names', 'name'],
      ['bike-registrations', 'registration'],
    ])
      element(id).replaceChildren(
        ...[...new Set(bikes.map((entry) => entry[key]).filter(Boolean))].map(
          (text) => {
            const option = document.createElement('option');
            option.value = text;
            return option;
          },
        ),
      );
    renderRecords();
    drawCharts();
  };
  const finishSave = (editing) => {
    refresh();
    message(
      CarbonStore.available
        ? editing
          ? 'Record updated.'
          : 'Record saved.'
        : 'Recorded for this session only. Download a backup now; browser storage is unavailable.',
    );
  };
  for (const id of ['flight-landscape', 'ebike-landscape'])
    element(id).replaceChildren(
      ...reference.landscapes.map((place) => {
        const option = document.createElement('option');
        option.value = place.name;
        option.textContent = place.name + ' · ' + place.country;
        return option;
      }),
    );
  element('ebike-landscape').value = 'Masai Mara';
  const countries = [
    ...new Map(
      reference.airports.map((airport) => [airport.countryCode, airport.country]),
    ).entries(),
  ].sort((first, second) => first[1].localeCompare(second[1]));
  for (const [code, name] of countries) {
    for (const id of ['domestic-country', 'from-country', 'to-country'])
      element(id).append(option(name, code));
    if (reference.operators.some((operator) => operator.countryCode === code))
      element('operator-country').append(option(name, code));
  }
  for (const id of ['flight-date', 'ebike-start', 'ebike-end'])
    element(id).value = localDate;
  element('domestic-country').value = 'ZA';
  element('flight-from').value = airportLabel(airportMap.get('JNB'));
  element('flight-to').value = airportLabel(airportMap.get('CPT'));
  aircraftChoices(false);
  changeRouteMode('domestic', false);
  CarbonStore.restore();
  for (const event of ['input', 'change']) {
    element('flight-form').addEventListener(event, renderFlight);
    element('ebike-form').addEventListener(event, renderBike);
  }
  element('flight-landscape').addEventListener('change', () => {
    const place = landscape('flight-landscape');
    if (routeMode === 'domestic' && place) {
      element('domestic-country').value = place.countryCode;
      element('flight-from').value = airportMap.has(place.airport)
        ? airportLabel(airportMap.get(place.airport))
        : '';
      element('flight-to').value = '';
      resetOperatorFilter();
    }
    // International legs are independent of the traveller's home landscape.
    routeHint();
    renderFlight();
  });
  element('domestic-country').addEventListener('change', () => {
    for (const field of ['from', 'to']) {
      if (selectedAirport('flight-' + field)?.countryCode !== value('domestic-country'))
        element('flight-' + field).value = '';
    }
    resetOperatorFilter();
    routeHint();
    renderFlight();
  });
  for (const field of ['from', 'to']) {
    element(field + '-country').addEventListener('change', () => {
      const airport = selectedAirport('flight-' + field);
      if (
        airport &&
        value(field + '-country') &&
        airport.countryCode !== value(field + '-country')
      )
        element('flight-' + field).value = '';
      renderFlight();
    });
  }
  for (const mode of ['domestic', 'international'])
    element(mode + '-tab').addEventListener('click', () => changeRouteMode(mode));
  document.querySelector('.flight-trip-tabs').addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next =
      event.key === 'Home'
        ? 'domestic'
        : event.key === 'End'
          ? 'international'
          : routeMode === 'domestic'
            ? 'international'
            : 'domestic';
    changeRouteMode(next);
    element(next + '-tab').focus();
  });
  element('operator-country').addEventListener('change', () => {
    const operator = reference.operators.find(
      (item) => normalise(item.name) === normalise(value('flight-operator')),
    );
    if (
      value('operator-country') &&
      operator?.countryCode !== value('operator-country')
    ) {
      element('flight-operator').value = '';
      aircraftChoices(false);
    }
  });
  element('flight-operator').addEventListener('input', () => aircraftChoices(false));
  element('flight-operator').addEventListener('change', () => aircraftChoices(false));
  element('flight-aircraft').addEventListener('change', () => layoutChoices(false));
  element('flight-layout').addEventListener('change', () => cabinChoices(true));
  element('all-aircraft').addEventListener('change', () => aircraftChoices(true));
  element('reverse-route').addEventListener('click', () => {
    const from = value('flight-from'),
      country = value('from-country');
    element('flight-from').value = value('flight-to');
    element('flight-to').value = from;
    element('from-country').value = value('to-country');
    element('to-country').value = country;
    renderFlight();
  });
  for (const mode of ['flight', 'ebike'])
    element(mode + '-tab').addEventListener('click', () => switchMode(mode));
  document.querySelector('.carbon-tabs').addEventListener('keydown', (event) => {
    if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      const next =
        event.key === 'Home'
          ? 'flight'
          : event.key === 'End'
            ? 'ebike'
            : element('flight-panel').hidden
              ? 'flight'
              : 'ebike';
      switchMode(next);
      element(next + '-tab').focus();
    }
  });
  element('flight-form').addEventListener('submit', (event) => {
    event.preventDefault();
    try {
      const input = flightInput(),
        result = CarbonMath.flight(input);
      validateRoute(input);
      if (!CarbonMath.validDate(value('flight-date')))
        throw Error('Enter a valid flight date.');
      if (!landscape('flight-landscape')) throw Error('Select a landscape.');
      if (!value('flight-operator')) throw Error('Enter the operating airline.');
      if (value('flight-aircraft') === customType && !value('flight-custom-aircraft'))
        throw Error('Enter the aircraft name.');
      if (new Set(input.names.map(normalise)).size !== input.names.length)
        throw Error('A traveller appears twice. Check the names.');
      if (
        CarbonStore.entries.some(
          (entry) =>
            entry.id !== flightEditing?.id &&
            entry.mode === 'flight' &&
            entry.date === value('flight-date') &&
            entry.from === input.from.code &&
            entry.to === input.to.code &&
            entry.name === input.names.join('; ') &&
            (entry.cabinKey || 'economy') === input.cabinKey,
        )
      )
        throw Error(
          'This traveller group and route already exists on that date. Edit the existing record.',
        );
      CarbonStore.save({
        ...flightEditing,
        ...result,
        mode: 'flight',
        date: value('flight-date'),
        name: input.names.join('; '),
        names: input.names,
        landscape: value('flight-landscape'),
        operator: value('flight-operator'),
        aircraft: value('flight-aircraft'),
        customAircraft:
          value('flight-aircraft') === customType
            ? value('flight-custom-aircraft')
            : '',
        icao: input.aircraft.icao,
        from: input.from.code,
        to: input.to.code,
        fromName: input.from.name,
        toName: input.to.name,
        fromCountry: input.from.country,
        toCountry: input.to.country,
        classification: result.domestic ? 'Domestic' : 'International',
        pax: input.passengers,
        ...allocation(),
        settingsNote: '',
        manualSource: input.manualSource,
        methodVersion:
          'LH automatic cabin allocation R3; ' +
          result.group.source +
          '; ' +
          (result.fuel === null
            ? 'documented manual estimate'
            : reference.legacyCurves.includes(input.aircraft.icao)
              ? 'supplied fuel curve'
              : 'v13.1 fuel curve'),
      });
      finishSave(flightEditing);
      flightEditing = null;
      element('flight-save').textContent = 'Save flight';
      element('flight-cancel').hidden = true;
    } catch (error) {
      element('flight-error').textContent = error.message;
    }
  });
  element('ebike-form').addEventListener('submit', (event) => {
    event.preventDefault();
    try {
      const input = bikeInput(),
        result = CarbonMath.motorcycle(input),
        place = landscape('ebike-landscape');
      if (!value('ebike-name') || !value('ebike-registration'))
        throw Error('Enter the name and motorcycle registration.');
      if (!place) throw Error('Select a landscape.');
      if (value('ebike-distance-mode') === 'odometer' && numeric('ebike-opening') < 0)
        throw Error('Opening odometer cannot be negative.');
      if (
        (input.intensity !== 0.0405 ||
          input.gridFactor !== 0.226 ||
          Math.abs(input.baselineFactor - (2.075 / 45.5) * 1.28) > 1e-12 ||
          input.substitution !== 100 ||
          place.countryCode !== 'KE') &&
        !value('ebike-factor-note')
      )
        throw Error(
          'Add a source or explanation for changed assumptions or use outside Kenya.',
        );
      if (
        CarbonStore.entries.some(
          (entry) =>
            entry.id !== bikeEditing?.id &&
            entry.mode === 'ebike' &&
            normalise(entry.registration) === normalise(value('ebike-registration')) &&
            entry.start <= input.end &&
            entry.end >= input.start,
        )
      )
        throw Error(
          'This motorcycle already has a record overlapping these dates. Edit it or choose a separate period.',
        );
      CarbonStore.save({
        ...bikeEditing,
        ...input,
        ...result,
        mode: 'ebike',
        date: input.end,
        name: value('ebike-name'),
        registration: value('ebike-registration'),
        landscape: value('ebike-landscape'),
        distanceMode: value('ebike-distance-mode'),
        opening:
          value('ebike-distance-mode') === 'odometer' ? numeric('ebike-opening') : null,
        closing:
          value('ebike-distance-mode') === 'odometer' ? numeric('ebike-closing') : null,
        note: value('ebike-note'),
        factorNote: value('ebike-factor-note'),
        methodVersion: 'WI corrected chart model / operational electricity 2026-09',
      });
      finishSave(bikeEditing);
      bikeEditing = null;
      element('ebike-save').textContent = 'Save motorcycle record';
      element('ebike-cancel').hidden = true;
    } catch (error) {
      element('ebike-error').textContent = error.message;
    }
  });
  element('ebike-registration').addEventListener('change', () => {
    if (bikeEditing) return;
    const prior = CarbonStore.entries
      .filter(
        (entry) =>
          entry.mode === 'ebike' &&
          normalise(entry.registration) === normalise(value('ebike-registration')) &&
          entry.closing !== null &&
          entry.end < value('ebike-start'),
      )
      .sort((first, second) => second.end.localeCompare(first.end))[0];
    if (prior) element('ebike-opening').value = prior.closing;
    renderBike();
  });
  const edit = (record) => {
    switchMode(record.mode);
    if (record.mode === 'flight') {
      flightEditing = record;
      const aliases = {
        'Head Office': 'Head Office — Sandton',
        Okavango: 'Okavango Delta',
        'Nyekweri / Masai Mara': 'Masai Mara',
        'iSimangaliso / KwaNgwenya': 'iSimangaliso',
      };
      element('flight-date').value = record.date;
      element('flight-names').value = (record.names || record.name.split('; ')).join(
        '\n',
      );
      element('flight-landscape').value = aliases[record.landscape] || record.landscape;
      for (const field of ['from', 'to'])
        element('flight-' + field).value = airportMap.has(record[field])
          ? airportLabel(airportMap.get(record[field]))
          : record[field];
      const from = airportMap.get(record.from),
        to = airportMap.get(record.to);
      element('domestic-country').value =
        from?.countryCode || landscape('flight-landscape')?.countryCode || 'ZA';
      element('from-country').value = '';
      element('to-country').value = '';
      changeRouteMode(
        from && to && from.countryCode === to.countryCode
          ? 'domestic'
          : 'international',
        false,
      );
      element('operator-country').value = '';
      element('flight-operator').value = record.operator;
      element('all-aircraft').checked = true;
      aircraftChoices(false);
      element('flight-aircraft').value = record.aircraft;
      if (!value('flight-aircraft')) element('flight-aircraft').value = customType;
      layoutChoices(false);
      if (
        [...element('flight-layout').options].some(
          (item) => item.value === record.layoutId,
        )
      )
        element('flight-layout').value = record.layoutId;
      cabinChoices(false);
      if (
        record.cabinKey &&
        [...element('flight-cabin-class').options].some(
          (item) => item.value === record.cabinKey,
        )
      )
        element('flight-cabin-class').value = record.cabinKey;
      element('flight-custom-aircraft').value = record.customAircraft || '';
      element('flight-manual-kg').value = record.fuel === null ? record.perPax : '';
      element('flight-manual-source').value = record.manualSource || '';
      element('flight-save').textContent = 'Update flight';
      element('flight-cancel').hidden = false;
      renderFlight();
      if (!record.allocationVersion)
        message(
          'Earlier record: the new automatic seating and cabin settings apply only if you save this edit. Verify the cabin and all ' +
            record.pax +
            ' traveller names before saving. Editing recalculates this record; the original total is preserved until you save.',
        );
    } else {
      bikeEditing = record;
      const fields = {
        start: 'start',
        end: 'end',
        name: 'name',
        registration: 'registration',
        landscape: 'landscape',
        'distance-mode': 'distanceMode',
        distance: 'dist',
        opening: 'opening',
        closing: 'closing',
        charging: 'charging',
        'grid-share': 'gridShare',
        intensity: 'intensity',
        'grid-factor': 'gridFactor',
        'baseline-factor': 'baselineFactor',
        substitution: 'substitution',
        measured: 'measured',
        'factor-note': 'factorNote',
        note: 'note',
      };
      for (const [field, key] of Object.entries(fields))
        element('ebike-' + field).value = record[key] ?? '';
      element('ebike-save').textContent = 'Update motorcycle record';
      element('ebike-cancel').hidden = false;
      renderBike();
    }
    element(record.mode + '-panel').scrollIntoView({
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'auto'
        : 'smooth',
    });
  };
  element('carbon-records').addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) return;
    try {
      if (button.dataset.edit)
        edit(CarbonStore.entries.find((entry) => entry.id === button.dataset.edit));
      if (button.dataset.delete) {
        deletedRecord = CarbonStore.remove(button.dataset.delete);
        element('undo-delete').hidden = false;
        refresh();
        message('Record deleted. Undo is available below the table.');
      }
    } catch (error) {
      message(error.message);
    }
  });
  element('undo-delete').addEventListener('click', () => {
    if (deletedRecord) {
      try {
        CarbonStore.save(deletedRecord);
        deletedRecord = null;
        element('undo-delete').hidden = true;
        refresh();
        message('Record restored.');
      } catch (error) {
        message(error.message);
      }
    }
  });
  element('flight-cancel').addEventListener('click', () => {
    flightEditing = null;
    element('flight-cancel').hidden = true;
    element('flight-save').textContent = 'Save flight';
  });
  element('ebike-cancel').addEventListener('click', () => {
    bikeEditing = null;
    element('ebike-cancel').hidden = true;
    element('ebike-save').textContent = 'Save motorcycle record';
  });
  element('record-search').addEventListener('input', renderRecords);
  element('export-xlsx').addEventListener('click', () => {
    try {
      CarbonExport.download(
        CarbonExport.build(CarbonStore.entries),
        'Wild-Impact-Carbon-' + localDate + '.xlsx',
      );
      message('Workbook exported with separate flight and motorcycle sheets.');
    } catch (error) {
      message('Export failed: ' + error.message);
    }
  });
  element('export-backup').addEventListener('click', () =>
    CarbonExport.download(
      new Blob(
        [
          CarbonStore.writable
            ? JSON.stringify(CarbonStore.snapshot(), null, 2)
            : CarbonStore.recoveryRaw || '',
        ],
        { type: 'application/json' },
      ),
      'Wild-Impact-Carbon-Backup-' + localDate + '.json',
    ),
  );
  element('choose-backup').addEventListener('click', () =>
    element('import-backup').click(),
  );
  element('import-backup').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      if (file.size > 50 * 1024 * 1024) throw Error('Backup is larger than 50 MB.');
      const count = CarbonStore.merge(JSON.parse(await file.text()));
      refresh();
      message(
        `Backup merged: ${count} new or newer records. Matching IDs are not duplicated. ${CarbonStore.available ? '' : 'Download a backup now; browser storage is unavailable.'}`,
      );
    } catch (error) {
      message('Import failed: ' + error.message);
    } finally {
      event.target.value = '';
    }
  });
  window.addEventListener('storage', (event) => {
    if (event.key === CarbonStore.key && event.newValue) {
      try {
        CarbonStore.merge(JSON.parse(event.newValue), false);
        refresh();
      } catch (error) {
        message(error.message);
      }
    }
  });
  refresh();
  renderBike();
  new MutationObserver(drawCharts).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });
})();
