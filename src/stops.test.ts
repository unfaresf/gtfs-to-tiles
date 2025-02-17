import { expect, test, vi, describe, beforeEach, afterEach } from 'vitest';
import GenerateStopsGeoJson from './stops.js';

describe('GenerateStopsGeoJson', () => {
  let db;

  beforeEach(() => {
    db = vi.fn()
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('adds 1 + 2 to equal 3', () => {
    expect(GenerateStopsGeoJson(db, '/unit/test/path')).resolves.toBe('/unit/test/path');
  });
});
