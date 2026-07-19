import { describe, it, expect } from 'vitest';
import { toPaise, fromPaise, formatINR, shortAddress } from '../lib/format';

describe('format helpers', () => {
  it('converts rupees to paise correctly', () => {
    expect(toPaise(250)).toBe(25000);
    expect(toPaise(19.99)).toBe(1999);
  });

  it('converts paise back to rupees correctly', () => {
    expect(fromPaise(25000)).toBe(250);
  });

  it('formats paise as an INR currency string', () => {
    expect(formatINR(25000)).toBe('₹250.00');
  });

  it('shortens a Stellar address to first/last 4 chars', () => {
    const addr = 'GABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890ABCDEFGHIJKLMNOP';
    expect(shortAddress(addr)).toBe('GABC...MNOP');
  });

  it('returns an empty string for a missing address', () => {
    expect(shortAddress(undefined)).toBe('');
  });
});
