'use strict';

// A small local OOXML writer. All user text is written as text, never a formula.
// ZIP uses the standard STORE method. No remote service or dependency is required.
window.CarbonExport = (() => {
  const xml = (value) =>
    String(value ?? '')
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
      .replace(
        /[<>&"']/g,
        (character) =>
          ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[
            character
          ],
      );
  const column = (index) => {
    let result = '';
    for (index++; index > 0; index = Math.floor((index - 1) / 26))
      result = String.fromCharCode(65 + ((index - 1) % 26)) + result;
    return result;
  };
  const dateCell = (date) =>
    date && CarbonMath.validDate(date)
      ? {
          value: Math.round(
            (Date.parse(date + 'T00:00:00Z') - Date.UTC(1899, 11, 30)) / 86400000,
          ),
          style: 3,
        }
      : date || '';
  const formula = (expression, value) => ({
    formula: expression,
    value: Number.isFinite(value) ? value : 0,
    style: 2,
  });
  const crcTable = new Uint32Array(256),
    encoder =
      typeof TextEncoder === 'function'
        ? new TextEncoder()
        : {
            encode: (text) =>
              Uint8Array.from(unescape(encodeURIComponent(text)), (character) =>
                character.charCodeAt(0),
              ),
          };
  for (let index = 0; index < 256; index++) {
    let code = index;
    for (let bit = 0; bit < 8; bit++)
      code = code & 1 ? 0xedb88320 ^ (code >>> 1) : code >>> 1;
    crcTable[index] = code >>> 0;
  }
  const zip = (files) => {
    const chunks = [],
      directory = [];
    let offset = 0;
    for (const [name, content] of Object.entries(files)) {
      const filename = encoder.encode(name),
        data = encoder.encode(content);
      let crc = 0xffffffff;
      for (const byte of data) crc = crcTable[(crc ^ byte) & 255] ^ (crc >>> 8);
      crc = (crc ^ 0xffffffff) >>> 0;
      const local = new Uint8Array(30 + filename.length),
        header = new DataView(local.buffer);
      header.setUint32(0, 0x04034b50, true);
      header.setUint16(4, 20, true);
      header.setUint16(6, 0x800, true);
      header.setUint16(12, 33, true);
      header.setUint32(14, crc, true);
      header.setUint32(18, data.length, true);
      header.setUint32(22, data.length, true);
      header.setUint16(26, filename.length, true);
      local.set(filename, 30);
      chunks.push(local, data);
      const central = new Uint8Array(46 + filename.length),
        record = new DataView(central.buffer);
      record.setUint32(0, 0x02014b50, true);
      record.setUint16(4, 20, true);
      record.setUint16(6, 20, true);
      record.setUint16(8, 0x800, true);
      record.setUint16(14, 33, true);
      record.setUint32(16, crc, true);
      record.setUint32(20, data.length, true);
      record.setUint32(24, data.length, true);
      record.setUint16(28, filename.length, true);
      record.setUint32(42, offset, true);
      central.set(filename, 46);
      directory.push(central);
      offset += local.length + data.length;
    }
    const size = directory.reduce((sum, item) => sum + item.length, 0),
      end = new Uint8Array(22),
      footer = new DataView(end.buffer);
    footer.setUint32(0, 0x06054b50, true);
    footer.setUint16(8, directory.length, true);
    footer.setUint16(10, directory.length, true);
    footer.setUint32(12, size, true);
    footer.setUint32(16, offset, true);
    return new Blob([...chunks, ...directory, end], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
  };
  const sheet = (rows, methods = false) => {
    const widths = rows[0]
      .map(
        (heading, index) =>
          `<col min="${index + 1}" max="${index + 1}" width="${methods ? (index === 0 ? 22 : index === 1 ? 90 : 65) : index === 0 ? 24 : Math.min(42, Math.max(17, String(heading).length + 3))}" customWidth="1"/>`,
      )
      .join('');
    const body = rows
      .map(
        (row, rowIndex) =>
          `<row r="${rowIndex + 1}"${rowIndex === 0 ? ' ht="34" customHeight="1"' : methods ? ' ht="72" customHeight="1"' : ''}>${row
            .map((cell, index) => {
              const address = column(index) + (rowIndex + 1),
                object =
                  typeof cell === 'object' && cell !== null ? cell : { value: cell };
              const style =
                rowIndex === 0
                  ? 1
                  : (object.style ?? (typeof object.value === 'number' ? 2 : 4));
              if (object.formula)
                return `<c r="${address}" s="${style}"><f>${xml(object.formula)}</f><v>${object.value}</v></c>`;
              if (typeof object.value === 'number' && Number.isFinite(object.value))
                return `<c r="${address}" s="${style}"><v>${object.value}</v></c>`;
              return `<c r="${address}" s="${style}" t="inlineStr"><is><t xml:space="preserve">${xml(object.value)}</t></is></c>`;
            })
            .join('')}</row>`,
      )
      .join('');
    return `<?xml version="1.0" encoding="UTF-8"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><cols>${widths}</cols><sheetData>${body}</sheetData><autoFilter ref="A1:${column(rows[0].length - 1)}${rows.length}"/></worksheet>`;
  };
  const build = (entries) => {
    const flights = [
      [
        'Record ID',
        'Date',
        'Financial year',
        'Traveller names',
        'Landscape',
        'Operator',
        'Aircraft',
        'From code',
        'From airport',
        'From country',
        'To code',
        'To airport',
        'To country',
        'Classification',
        'Passengers',
        'Great-circle km',
        'Detour km',
        'Fuel kg',
        'Seat equivalents',
        'Load factor',
        'Passenger cargo share',
        'Cabin multiplier',
        'CO2 kg per passenger',
        'Flight CO2 kg',
        'Flight CO2 tonnes',
        'Method version',
        'Reference / notes',
        'Cabin class',
        'Seating layout',
        'Physical seats',
        'Layout status',
        'Seating source',
        'Cabin allocation source',
        'Allocation version',
        'Seats by cabin (JSON)',
        'Cabin weights (JSON)',
      ],
    ];
    const bikes = [
      [
        'Record ID',
        'Period starts',
        'Period ends',
        'Financial year',
        'Ranger / recorder',
        'Registration',
        'Landscape',
        'Distance basis',
        'Opening odometer km',
        'Closing odometer km',
        'Distance km',
        'Energy kWh/km',
        'Measured charging kWh',
        'Energy kWh',
        'Energy basis',
        'Grid share %',
        'Grid kg/kWh',
        'Baseline kg/km',
        'Substitution %',
        'Baseline kg',
        'Electricity kg',
        'Avoided kg',
        'Avoided tonnes',
        'Charging source',
        'Method version',
        'Notes / factor source',
      ],
    ];
    const months = new Map();
    for (const entry of [...entries].sort((first, second) =>
      first.date.localeCompare(second.date),
    )) {
      const month = entry.date.slice(0, 7);
      if (!months.has(month))
        months.set(month, {
          flight: 0,
          baseline: 0,
          electric: 0,
          saved: 0,
          distance: 0,
        });
      const total = months.get(month);
      if (entry.mode === 'flight') {
        const row = flights.length + 1,
          group = entry.group || { load: entry.plf, cargo: entry.p2f };
        flights.push([
          entry.id,
          dateCell(entry.date),
          CarbonMath.fiscalYear(entry.date),
          entry.name,
          entry.landscape,
          entry.operator,
          entry.customAircraft || entry.aircraft,
          entry.from,
          entry.fromName || '',
          entry.fromCountry || '',
          entry.to,
          entry.toName || '',
          entry.toCountry || '',
          entry.classification || 'Legacy',
          entry.pax,
          entry.dist,
          entry.det ?? '',
          entry.fuel ?? '',
          entry.seats ?? '',
          group.load ?? '',
          group.cargo ?? '',
          entry.cabin ?? 1,
          entry.perPax,
          entry.methodVersion === 'Legacy supplied tracker'
            ? entry.emissionsKg
            : formula(`O${row}*W${row}`, entry.emissionsKg),
          formula(`X${row}/1000`, entry.emissionsKg / 1000),
          entry.methodVersion,
          entry.settingsNote || entry.manualSource || '',
          entry.cabinLabel || 'Earlier allocation',
          entry.layoutLabel || '',
          entry.seatCount ?? '',
          entry.layoutStatus || '',
          entry.layoutSource || '',
          entry.allocationSource || '',
          entry.allocationVersion || '',
          entry.cabinSeats ? JSON.stringify(entry.cabinSeats) : '',
          entry.cabinWeights ? JSON.stringify(entry.cabinWeights) : '',
        ]);
        total.flight += entry.emissionsKg;
      } else {
        const row = bikes.length + 1;
        bikes.push([
          entry.id,
          dateCell(entry.start),
          dateCell(entry.end),
          CarbonMath.fiscalYear(entry.date),
          entry.name,
          entry.registration,
          entry.landscape,
          entry.distanceMode,
          entry.opening ?? '',
          entry.closing ?? '',
          entry.dist,
          entry.intensity,
          entry.measured ?? '',
          formula(
            entry.measured === null ? `K${row}*L${row}` : `M${row}`,
            entry.energy,
          ),
          entry.energyBasis,
          entry.gridShare,
          entry.gridFactor,
          entry.baselineFactor,
          entry.substitution,
          formula(`K${row}*R${row}*S${row}/100`, entry.baselineKg),
          formula(`N${row}*P${row}/100*Q${row}`, entry.emissionsKg),
          formula(`T${row}-U${row}`, entry.savedKg),
          formula(`V${row}/1000`, entry.savedKg / 1000),
          entry.charging,
          entry.methodVersion,
          [entry.note, entry.factorNote].filter(Boolean).join(' · '),
        ]);
        total.baseline += entry.baselineKg;
        total.electric += entry.emissionsKg;
        total.saved += entry.savedKg;
        total.distance += entry.dist;
      }
    }
    const summary = [
      [
        'Month',
        'Flight CO2 tonnes',
        'Boda-boda baseline tonnes',
        'Motorcycle electricity tonnes',
        'Avoided emissions tonnes',
        'Electric distance km',
      ],
    ];
    for (const [month, total] of months)
      summary.push([
        month,
        total.flight / 1000,
        total.baseline / 1000,
        total.electric / 1000,
        total.saved / 1000,
        total.distance,
      ]);
    const methods = [
      ['Topic', 'Method / boundary', 'Source'],
      [
        'Flights',
        'CO2 only, no non-CO2 uplift. Original SSA factors retained; added route groups and aircraft curves use v13.1. Each record identifies its method.',
        'https://icec.icao.int/Documents/Methodology%20ICAO%20Carbon%20Emissions%20Calculator_v13_Final.pdf',
      ],
      [
        'Cabin allocation',
        'Automatic project allocation: regional layouts Economy 1 / Business 1.5; wide-body layouts Economy 1 / Premium Economy 1.6 / Business 2.9 / First 4. These are published average seat-space weights, not airline-specific measurements. With published cabin counts, the denominator is the sum of seats in each cabin times its weight.',
        window.CARBON_REFERENCE.configurations.factorSource,
      ],
      [
        'Seating',
        'Published airline layouts are used when available. Representative layouts are not guaranteed for a particular flight. Otherwise the existing aircraft-type seat-equivalent estimate is labelled unverified. Sources, selected cabin and factors are saved per flight; older records retain their recorded totals.',
        'data/json/carbon-configurations.json; airline pages and Planespotters.net airframe records',
      ],
      [
        'Motorcycles',
        'Baseline = distance × (2.075 / 45.5 × 1.28) × replacement share. Estimated energy = distance × 0.0405 kWh/km; measured charging takes precedence.',
        'Supplied WI_Carbon Tracker_Google forms (1)(1).xlsx, KE Bikes Charts P2 R44:T51',
      ],
      [
        'Grid',
        '0.226 kg/kWh retained as a Kenya project assumption; underlying source still requires confirmation from Thabani.',
        'Supplied workbook, Formulas row 4',
      ],
      [
        'Solar',
        'Zero operational generation emissions, excluding manufacture of motorcycles, batteries and solar equipment. Grid April–August 2025; solar from September 2025 unless overridden.',
        'User project chronology; project accounting boundary',
      ],
      [
        'Savings',
        'Baseline minus charging emissions. Negative values are possible. These are not offsets or carbon credits and are not deducted from flight emissions.',
        'Recorded replacement share, default 100%',
      ],
      [
        'Dates',
        'Financial year begins 1 July. Motorcycle periods fall within one calendar month.',
        'Supplied workbook',
      ],
      [
        'Airports',
        'Public-domain snapshot, 28 September 2026. Fleet references are dated suggestions, not a complete live register.',
        'https://ourairports.com/data/',
      ],
      [
        'Backup',
        'Use the JSON backup to transfer and merge records across browsers or devices. Excel is the reporting output, not the import format.',
        'Local browser storage; no cloud synchronisation',
      ],
      [
        'Summary',
        'Monthly summary is a snapshot. Detail sheets contain calculation formulas; re-export from the site for a fresh summary. Legacy flight totals remain as originally recorded.',
        'Export convention',
      ],
    ];
    const sheets = [
        ['Summary', summary],
        ['Flights', flights],
        ['Electric motorcycles', bikes],
        ['Methods', methods],
      ],
      files = {};
    files['[Content_Types].xml'] =
      `<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>${sheets.map((_, index) => `<Override PartName="/xl/worksheets/sheet${index + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('')}</Types>`;
    files['_rels/.rels'] =
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>';
    files['xl/workbook.xml'] =
      `<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${sheets.map(([name], index) => `<sheet name="${xml(name)}" sheetId="${index + 1}" r:id="rId${index + 1}"/>`).join('')}</sheets><calcPr calcId="191029" fullCalcOnLoad="1"/></workbook>`;
    files['xl/_rels/workbook.xml.rels'] =
      `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${sheets.map((_, index) => `<Relationship Id="rId${index + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${index + 1}.xml"/>`).join('')}<Relationship Id="rId${sheets.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`;
    files['xl/styles.xml'] =
      '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><numFmts count="2"><numFmt numFmtId="164" formatCode="#,##0.000"/><numFmt numFmtId="165" formatCode="dd mmm yyyy"/></numFmts><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF0F2D3A"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="5"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyAlignment="1"><alignment wrapText="1" vertical="center"/></xf><xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/><xf numFmtId="165" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment wrapText="1" vertical="top"/></xf></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>';
    sheets.forEach(
      ([, rows], index) =>
        (files[`xl/worksheets/sheet${index + 1}.xml`] = sheet(rows, index === 3)),
    );
    return zip(files);
  };
  const download = (blob, name) => {
    const address = URL.createObjectURL(blob),
      anchor = document.createElement('a');
    anchor.href = address;
    anchor.download = name;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(address), 1000);
  };
  return { build, download };
})();
