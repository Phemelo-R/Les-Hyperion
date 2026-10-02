// Dates may be YYYY, YYYY-MM or YYYY-MM-DD. Never invent missing precision.
export function researchDateKey(project) {
  for (const value of [project.date, project.year]) {
    const match = String(value ?? '').match(/^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?$/);
    if (!match) continue;
    const year = Number(match[1]),
      month = Number(match[2] || 1),
      day = Number(match[3] || 1);
    const date = new Date(Date.UTC(year, month - 1, day));
    if (
      date.getUTCFullYear() === year &&
      date.getUTCMonth() === month - 1 &&
      date.getUTCDate() === day
    )
      return date.getTime();
  }
  return -Infinity;
}

export function sortResearch(projects) {
  return [...projects].sort((first, second) => {
    const firstDate = researchDateKey(first),
      secondDate = researchDateKey(second);
    return (
      (firstDate === secondDate ? 0 : firstDate > secondDate ? -1 : 1) ||
      first.title.localeCompare(second.title, 'en')
    );
  });
}

export function researchStatus(status) {
  const labels = {
    'in-progress': 'In preparation',
    draft: 'In preparation',
    'under-review': 'Under review',
    published: 'Published',
    complete: 'Completed project',
  };
  if (!labels[status]) throw new Error(`Unknown research status: ${status}`);
  return labels[status];
}
