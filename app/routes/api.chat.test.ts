import { vi, describe, it, expect } from 'vitest';
import { parseCookies } from './api.chat';

describe('parseCookies', () => {
  it('should parse cookie string into key-value pairs', () => {
    const cookieStr = 'name=value; key=123; foo=bar';
    const result = parseCookies(cookieStr);
    expect(result).toEqual({
      name: 'value',
      key: '123',
      foo: 'bar',
    });
  });

  it('should handle empty cookie string', () => {
    const result = parseCookies('');
    expect(result).toEqual({});
  });

  it('should handle cookie with encoded values', () => {
    const cookieStr = 'name=hello%20world; key=foo%2Fbar';
    const result = parseCookies(cookieStr);
    expect(result).toEqual({
      name: 'hello world',
      key: 'foo/bar',
    });
  });

  it('should handle cookie with equals sign in value', () => {
    const cookieStr = 'key=value=123; foo=bar';
    const result = parseCookies(cookieStr);
    expect(result).toEqual({
      key: 'value=123',
      foo: 'bar',
    });
  });

  it('should handle malformed cookie entries', () => {
    const cookieStr = 'invalid; key=value; =nokey; novalue=';
    const result = parseCookies(cookieStr);
    expect(result).toEqual({
      key: 'value',
      invalid: '',
      novalue: '',
    });
  });

  it('should handle cookie with multiple semicolons', () => {
    const cookieStr = 'key=value;;;foo=bar;;';
    const result = parseCookies(cookieStr);
    expect(result).toEqual({
      key: 'value',
      foo: 'bar',
    });
  });

  it('should handle cookie with whitespace', () => {
    const cookieStr = '  key  =  value  ;  foo  =  bar  ';
    const result = parseCookies(cookieStr);
    expect(result).toEqual({
      key: 'value',
      foo: 'bar',
    });
  });
});
