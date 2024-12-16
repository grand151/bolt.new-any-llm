import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { isMobile } from './mobile';

describe('isMobile', () => {
  let originalInnerWidth: number;

  beforeEach(() => {
    originalInnerWidth = globalThis.innerWidth;
  });

  afterEach(() => {
    globalThis.innerWidth = originalInnerWidth;
  });

  it('should return true if innerWidth is less than 640', () => {
    globalThis.innerWidth = 639;
    expect(isMobile()).toBe(true);
  });

  it('should return false if innerWidth is equal to 640', () => {
    globalThis.innerWidth = 640;
    expect(isMobile()).toBe(false);
  });

  it('should return false if innerWidth is greater than 640', () => {
    globalThis.innerWidth = 641;
    expect(isMobile()).toBe(false);
  });
});
