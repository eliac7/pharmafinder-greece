import { formatPharmacyHours, getPharmacyStatus } from './status';

describe('Pharmacy Status Logic', () => {
  describe('formatPharmacyHours', () => {
    it('should return null for empty hours', () => {
      expect(formatPharmacyHours([])).toBeNull();
    });

    it('should format a single time slot', () => {
      const hours = [{ open_time: '08:00:00', close_time: '14:30:00', date: null }];
      expect(formatPharmacyHours(hours)).toBe('08:00 - 14:30');
    });

    it('should format multiple time slots joined by comma', () => {
      const hours = [
        { open_time: '08:00:00', close_time: '14:00:00', date: null },
        { open_time: '17:00:00', close_time: '21:00:00', date: null },
      ];
      expect(formatPharmacyHours(hours)).toBe('08:00 - 14:00, 17:00 - 21:00');
    });
  });

  describe('getPharmacyStatus', () => {
    const regularShift = [{ open_time: '08:00:00', close_time: '14:00:00', date: null }];
    const overnightShift = [{ open_time: '22:00:00', close_time: '06:00:00', date: null }];

    // Helper to mock current time
    const mockTime = (hour: number, minute: number) => {
      jest.useFakeTimers();
      const date = new Date(2026, 0, 1, hour, minute, 0); // Jan 1st 2026
      jest.setSystemTime(date);
    };

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return "closed" if no hours provided', () => {
      expect(getPharmacyStatus([], null, null, 'now').status).toBe('closed');
    });

    it('should return "scheduled" for "today" filter regardless of time', () => {
      mockTime(23, 0); // Late night
      const result = getPharmacyStatus(regularShift, null, null, 'today');
      expect(result.status).toBe('scheduled');
      expect(result.statusColor).toContain('emerald'); // or whatever scheduled color is
    });

    describe('Regular Shift (08:00 - 14:00)', () => {
      it('should be closed before opening (07:00)', () => {
        mockTime(7, 0);
        const result = getPharmacyStatus(regularShift, null, null, 'now');
        expect(result.status).toBe('closed');
      });

      it('should be open during hours (10:00)', () => {
        mockTime(10, 0);
        const result = getPharmacyStatus(regularShift, null, null, 'now');
        expect(result.status).toBe('open');
        expect(result.closingTime).toBe('14:00:00');
      });

      it('should be closing soon 15 mins before close (13:45)', () => {
        mockTime(13, 45);
        const result = getPharmacyStatus(regularShift, null, null, 'now');
        expect(result.status).toBe('closing-soon');
        expect(result.minutesUntilClose).toBe(15);
      });

      it('should be closed after closing time (14:01)', () => {
        mockTime(14, 1);
        const result = getPharmacyStatus(regularShift, null, null, 'now');
        expect(result.status).toBe('closed');
      });
    });

    describe('Overnight Shift (22:00 - 06:00 next day)', () => {
      it('should be closed before opening (21:00)', () => {
        mockTime(21, 0);
        const result = getPharmacyStatus(overnightShift, null, null, 'now');
        expect(result.status).toBe('closed');
      });

      it('should be open before midnight (23:00)', () => {
        mockTime(23, 0);
        const result = getPharmacyStatus(overnightShift, null, null, 'now');
        expect(result.status).toBe('open');
      });

      it('should be open after midnight (03:00)', () => {
        mockTime(3, 0);
        const result = getPharmacyStatus(overnightShift, null, null, 'now');
        expect(result.status).toBe('open');
      });

      it('should be closing soon near morning (05:45)', () => {
        mockTime(5, 45);
        const result = getPharmacyStatus(overnightShift, null, null, 'now');
        expect(result.status).toBe('closing-soon');
        expect(result.minutesUntilClose).toBe(15);
      });

      it('should be closed after morning close (06:05)', () => {
        mockTime(6, 5);
        const result = getPharmacyStatus(overnightShift, null, null, 'now');
        expect(result.status).toBe('closed');
      });
    });
  });
});
