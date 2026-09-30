import {
  extractBearerToken,
  secureTokenEquals,
} from '@/modules/auth/m2m.token';

describe('secureTokenEquals', () => {
  it('returns true for matching tokens', () => {
    expect(secureTokenEquals('shared-m2m-token', 'shared-m2m-token')).toBe(
      true
    );
  });

  it('returns false for different tokens', () => {
    expect(secureTokenEquals('shared-m2m-token', 'other-token')).toBe(false);
  });

  it('returns false when lengths differ', () => {
    expect(secureTokenEquals('short', 'much-longer-token')).toBe(false);
  });
});

describe('extractBearerToken', () => {
  it('returns the token from a Bearer header', () => {
    expect(extractBearerToken('Bearer abc.def.ghi')).toBe('abc.def.ghi');
  });

  it('returns undefined when the header is missing', () => {
    expect(extractBearerToken(undefined)).toBeUndefined();
  });

  it('returns undefined for a non-Bearer scheme', () => {
    expect(extractBearerToken('Basic abc')).toBeUndefined();
  });

  it('returns undefined when the header has extra parts', () => {
    expect(extractBearerToken('Bearer a b')).toBeUndefined();
  });
});
