import { mergeHardwareMetadata } from './hardware-metadata';

describe('Hardware metadata compatibility', () => {
  it('preserves unrelated keys and explicit false', () => {
    expect(
      mergeHardwareMetadata(
        { warranty: '3 years', chargerIncluded: true },
        {
          components: [' mouse ', 'MOUSE', 'usb Hub', 'Custom scanner'],
          chargerIncluded: false,
        },
        'Laptop',
      ),
    ).toEqual({
      warranty: '3 years',
      components: ['Mouse', 'USB Hub', 'Custom scanner'],
      hasMouse: true,
      hasKeyboard: false,
      chargerIncluded: false,
    });
  });
  it('clears an empty list without removing other metadata', () => {
    expect(
      mergeHardwareMetadata(
        { components: ['Mouse'], warranty: '1 year' },
        { components: [] },
        'Desktop',
      ),
    ).toMatchObject({ components: [], warranty: '1 year', hasMouse: false });
  });
  it('leaves omitted selections intact and removes charger for an ineligible category', () => {
    expect(
      mergeHardwareMetadata(
        { components: ['Mouse'], chargerIncluded: true },
        undefined,
        'Desktop',
      ),
    ).toEqual({ components: ['Mouse'] });
  });
  it.each([[''], [1], ['x'.repeat(81)], 'Mouse', null])(
    'rejects malformed components %j',
    (components) => {
      expect(() =>
        mergeHardwareMetadata(null, { components }, 'Laptop'),
      ).toThrow();
    },
  );
  it.each([
    'javascript:alert(1)',
    'https://user:pass@example.com',
    '/relative',
    'file:///etc/passwd',
  ])('rejects unsafe OCS link %s', (ocsLink) => {
    expect(() => mergeHardwareMetadata(null, { ocsLink }, 'Desktop')).toThrow();
  });
  it('normalizes and clears links explicitly', () => {
    expect(
      mergeHardwareMetadata(
        { warranty: 'x' },
        { ocsLink: ' https://ocs.example.com/123 ' },
        'Desktop',
      ).ocsLink,
    ).toBe('https://ocs.example.com/123');
    expect(
      mergeHardwareMetadata(
        { ocsLink: 'https://example.com' },
        { ocsLink: '' },
        'Desktop',
      ),
    ).not.toHaveProperty('ocsLink');
  });
  it('rejects string booleans', () =>
    expect(() =>
      mergeHardwareMetadata(null, { chargerIncluded: 'false' }, 'NOC'),
    ).toThrow());
});
