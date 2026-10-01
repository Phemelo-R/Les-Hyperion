'use strict';

// Local, accessible controls: no dependency on native datalist or date-picker support.
(() => {
  const reference = window.CARBON_REFERENCE;
  const normalise = (value) =>
    String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  const change = (input) => {
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  };
  const countryName = (code) =>
    reference.airports.find((airport) => airport.countryCode === code)?.country || code;
  const createSearch = (input, getItems) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'carbon-search';
    input.replaceWith(wrapper);
    wrapper.append(input);
    const list = document.createElement('div');
    list.id = input.id + '-results';
    list.className = 'carbon-search-results';
    list.setAttribute('role', 'listbox');
    list.setAttribute(
      'aria-label',
      input.id === 'flight-operator' ? 'Operating airlines' : 'Matching airports',
    );
    list.hidden = true;
    wrapper.append(list);
    input.setAttribute('role', 'combobox');
    input.setAttribute('aria-autocomplete', 'list');
    input.setAttribute('aria-controls', list.id);
    input.setAttribute('aria-expanded', 'false');
    input.removeAttribute('list');
    let active = -1,
      items = [];
    const close = () => {
      list.hidden = true;
      input.setAttribute('aria-expanded', 'false');
      input.removeAttribute('aria-activedescendant');
      active = -1;
    };
    const choose = (index) => {
      if (!items[index]) return;
      input.value = items[index].value;
      change(input);
      input.focus();
      close();
    };
    const highlight = () => {
      [...list.querySelectorAll('[role="option"]')].forEach((option, index) => {
        option.setAttribute('aria-selected', String(index === active));
        if (index === active) {
          input.setAttribute('aria-activedescendant', option.id);
          option.scrollIntoView({ block: 'nearest' });
        }
      });
    };
    const open = (showNearby = false, limit = 40) => {
      const query = showNearby ? '' : normalise(input.value);
      const matches = getItems(query);
      items = matches.slice(0, limit);
      list.replaceChildren();
      active = -1;
      input.removeAttribute('aria-activedescendant');
      for (const [index, item] of items.entries()) {
        const option = document.createElement('button');
        option.type = 'button';
        option.tabIndex = -1;
        option.id = list.id + '-' + index;
        option.setAttribute('role', 'option');
        option.setAttribute('aria-selected', 'false');
        const heading = document.createElement('strong');
        heading.textContent = item.heading;
        const detail = document.createElement('span');
        detail.textContent = item.detail;
        option.append(heading, detail);
        option.addEventListener('mousedown', (event) => event.preventDefault());
        option.addEventListener('click', () => choose(index));
        list.append(option);
      }
      const count = document.createElement('p');
      count.className = 'carbon-search-count';
      count.textContent = `${items.length} of ${matches.length.toLocaleString('en-GB')} matches · type to narrow the list`;
      list.prepend(count);
      if (matches.length > limit) {
        const more = document.createElement('button');
        more.type = 'button';
        more.className = 'carbon-search-more';
        more.textContent = 'Show more results';
        more.addEventListener('mousedown', (event) => event.preventDefault());
        more.addEventListener('click', () => open(showNearby, limit + 40));
        list.append(more);
      }
      if (!items.length) {
        const empty = document.createElement('p');
        empty.textContent =
          input.id === 'flight-operator'
            ? 'No match. You may enter the operating airline from your ticket.'
            : 'No airport matches. Try a city, country or IATA / ICAO code.';
        list.append(empty);
      }
      list.hidden = false;
      input.setAttribute('aria-expanded', 'true');
    };
    input.addEventListener('focus', () => {
      input.select();
      open(true);
    });
    input.addEventListener('click', () => {
      if (list.hidden) open(true);
    });
    input.addEventListener('input', () => open());
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        close();
        return;
      }
      if (event.key === 'Tab') {
        close();
        return;
      }
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        if (list.hidden) open();
        if (!items.length) return;
        active =
          active < 0
            ? event.key === 'ArrowDown'
              ? 0
              : items.length - 1
            : (active + (event.key === 'ArrowDown' ? 1 : -1) + items.length) %
              items.length;
        highlight();
      } else if (event.key === 'Enter' && !list.hidden && active >= 0) {
        event.preventDefault();
        choose(active);
      }
    });
    document.addEventListener('pointerdown', (event) => {
      if (!wrapper.contains(event.target)) close();
    });
    document.addEventListener('focusin', (event) => {
      if (!wrapper.contains(event.target)) close();
    });
  };
  for (const field of ['from', 'to']) {
    createSearch(document.getElementById('flight-' + field), (query) => {
      const scope = window.CarbonFlightScope.airport(field);
      return reference.airports
        .filter(
          (airport) =>
            (!scope || airport.countryCode === scope) &&
            (!query ||
              normalise(
                [
                  airport.code,
                  airport.icao,
                  airport.name,
                  airport.city,
                  airport.country,
                ].join(' '),
              ).includes(query)),
        )
        .sort(
          (first, second) =>
            Number(second.code.toLowerCase() === query) -
              Number(first.code.toLowerCase() === query) ||
            Number(second.scheduled) - Number(first.scheduled) ||
            first.name.localeCompare(second.name),
        )
        .map((airport) => ({
          value: `${airport.code} — ${airport.name} · ${airport.city || airport.country} · ${airport.country}`,
          heading: airport.code + ' · ' + airport.name,
          detail: [airport.city, airport.country, 'ICAO ' + airport.icao]
            .filter(Boolean)
            .join(' · '),
        }));
    });
  }
  createSearch(document.getElementById('flight-operator'), (query) => {
    const country = document.getElementById('operator-country').value;
    return reference.operators
      .filter(
        (operator) =>
          (!country || operator.countryCode === country) &&
          (!query ||
            normalise(operator.name + ' ' + countryName(operator.countryCode)).includes(
              query,
            )),
      )
      .sort((first, second) => {
        const endpoints = ['flight-from', 'flight-to'].map(
          (id) => document.getElementById(id).value.split(' — ')[0],
        );
        const countries = reference.airports
          .filter((airport) => endpoints.includes(airport.code))
          .map((airport) => airport.countryCode);
        return (
          Number(countries.includes(second.countryCode)) -
            Number(countries.includes(first.countryCode)) ||
          first.name.localeCompare(second.name)
        );
      })
      .map((operator) => ({
        value: operator.name,
        heading: operator.name,
        detail: countryName(operator.countryCode),
      }));
  });

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const isoDate = (year, month, day) =>
    `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  for (const trigger of document.querySelectorAll('[data-calendar]')) {
    const input = document.getElementById(trigger.dataset.calendar);
    const popup = document.getElementById(input.id + '-calendar');
    const wrapper = input.parentElement;
    let year, month;
    const close = (returnFocus = false) => {
      popup.hidden = true;
      trigger.setAttribute('aria-expanded', 'false');
      if (returnFocus) trigger.focus();
    };
    const choose = (date) => {
      input.value = date;
      change(input);
      close(true);
    };
    const draw = () => {
      popup.replaceChildren();
      const header = document.createElement('div');
      header.className = 'calendar-heading';
      const previous = document.createElement('button');
      previous.type = 'button';
      previous.textContent = '‹';
      previous.setAttribute('aria-label', 'Previous month');
      const title = document.createElement('strong');
      title.textContent = monthNames[month] + ' ' + year;
      title.setAttribute('aria-live', 'polite');
      const next = document.createElement('button');
      next.type = 'button';
      next.textContent = '›';
      next.setAttribute('aria-label', 'Next month');
      const shift = (step) => {
        const date = new Date(year, month + step, 1);
        year = date.getFullYear();
        month = date.getMonth();
        draw();
        popup
          .querySelector(
            step < 0 ? '[aria-label="Previous month"]' : '[aria-label="Next month"]',
          )
          .focus();
      };
      previous.addEventListener('click', () => shift(-1));
      next.addEventListener('click', () => shift(1));
      header.append(previous, title, next);
      popup.append(header);
      const grid = document.createElement('div');
      grid.className = 'calendar-days';
      for (const day of ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']) {
        const label = document.createElement('span');
        label.textContent = day;
        grid.append(label);
      }
      const offset = (new Date(year, month, 1).getDay() + 6) % 7;
      for (let index = 0; index < offset; index++)
        grid.append(document.createElement('span'));
      for (let day = 1; day <= new Date(year, month + 1, 0).getDate(); day++) {
        const date = isoDate(year, month, day),
          button = document.createElement('button');
        button.type = 'button';
        button.textContent = day;
        button.dataset.date = date;
        button.setAttribute('aria-label', `${day} ${monthNames[month]} ${year}`);
        button.setAttribute('aria-pressed', String(input.value === date));
        button.addEventListener('click', () => choose(date));
        grid.append(button);
      }
      popup.append(grid);
      const footer = document.createElement('div');
      footer.className = 'calendar-footer';
      const today = document.createElement('button');
      today.type = 'button';
      today.textContent = 'Today';
      today.addEventListener('click', () => {
        const date = new Date();
        choose(isoDate(date.getFullYear(), date.getMonth(), date.getDate()));
      });
      const cancel = document.createElement('button');
      cancel.type = 'button';
      cancel.textContent = 'Close';
      cancel.addEventListener('click', () => close(true));
      footer.append(today, cancel);
      popup.append(footer);
    };
    trigger.addEventListener('click', () => {
      if (!popup.hidden) {
        close();
        return;
      }
      const selected = CarbonMath.validDate(input.value)
        ? new Date(input.value + 'T12:00:00')
        : new Date();
      year = selected.getFullYear();
      month = selected.getMonth();
      draw();
      popup.hidden = false;
      trigger.setAttribute('aria-expanded', 'true');
      (
        popup.querySelector('[aria-pressed="true"]') ||
        popup.querySelector('[data-date]')
      ).focus();
    });
    wrapper.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close(true);
      }
    });
    document.addEventListener('pointerdown', (event) => {
      if (!wrapper.contains(event.target)) close();
    });
    document.addEventListener('focusin', (event) => {
      if (!wrapper.contains(event.target)) close();
    });
  }
})();
