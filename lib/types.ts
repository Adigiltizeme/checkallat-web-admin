/** Plage de dates utilisée par les filtres des pages liste */
export interface DateRange {
  start: string | null;
  end: string | null;
  mode: 'range' | 'single';
  singleDate: string | null;
}

export const DATE_RANGE_EMPTY: DateRange = { start: null, end: null, mode: 'range', singleDate: null };
