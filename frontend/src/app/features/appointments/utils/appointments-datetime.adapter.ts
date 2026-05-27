const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const UI_DATE_REGEX = /^\d{2}\/\d{2}\/\d{4}$/;
const ISO_TIME_REGEX = /^\d{2}:\d{2}$/;

function extractIsoDate(value: string): string | null {
  if (!value) return null;
  return value.includes('T') ? value.split('T')[0] : value;
}

export function apiDateToUiDate(value: string): string | null {
  const isoDate = extractIsoDate(value);
  if (!isoDate || !ISO_DATE_REGEX.test(isoDate)) return null;
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
}

export function apiDateTimeToUiTime(value: string): string | null {
  if (!value) return null;
  if (ISO_TIME_REGEX.test(value)) return value;
  const match = value.match(/T(\d{2}):(\d{2})/);
  return match ? `${match[1]}:${match[2]}` : null;
}

export function apiDateTimeToUiDateTime(
  value: string
): { date: string | null; time: string | null } {
  return {
    date: apiDateToUiDate(value),
    time: apiDateTimeToUiTime(value)
  };
}

export function uiDateToApiDate(value: string): string | null {
  const trimmed = value?.trim() ?? '';
  if (!trimmed) return null;
  if (ISO_DATE_REGEX.test(trimmed)) return trimmed;
  if (!UI_DATE_REGEX.test(trimmed)) return null;
  const [day, month, year] = trimmed.split('/');
  return `${year}-${month}-${day}`;
}

export function uiTimeToApiTime(value: string): string | null {
  const trimmed = value?.trim() ?? '';
  if (!trimmed) return null;
  if (ISO_TIME_REGEX.test(trimmed)) return trimmed;
  return null;
}

export function uiDateTimeToApiDateTime(
  date: string,
  time: string
): string | null {
  const isoDate = uiDateToApiDate(date);
  const isoTime = uiTimeToApiTime(time);
  if (!isoDate || !isoTime) return null;
  return `${isoDate}T${isoTime}Z`;
}
