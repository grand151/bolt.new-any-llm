import { describe, it, expect } from 'vitest';
import { parseCookies } from './api.chat';

describe('parseCookies', () => {
  it('should parse valid cookie string', () => {
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

  it('should handle malformed cookie string', () => {
    const cookieStr = 'invalid;cookie=value;;=empty;novalue=';
    const result = parseCookies(cookieStr);
    expect(result).toEqual({
      invalid: '',
      cookie: 'value',
      novalue: '',
    });
  });

  it('should handle cookies with special characters', () => {
    const cookieStr = 'name=%20value%20; key=%3D%3D; foo=bar%20baz';
    const result = parseCookies(cookieStr);
    expect(result).toEqual({
      name: ' value ',
      key: '==',
      foo: 'bar baz',
    });
  });

  it('should handle cookies with equals sign in value', () => {
    const cookieStr = 'key=value=with=equals';
    const result = parseCookies(cookieStr);
    expect(result).toEqual({
      key: 'value=with=equals',
    });
  });
});
