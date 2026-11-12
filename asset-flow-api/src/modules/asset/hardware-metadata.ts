import { BadRequestException } from '@nestjs/common';

export const COMPONENTS = [
  'Mouse',
  'Keyboard',
  'Headset',
  'UPS/AVR',
  'Camera',
  'External HDD',
  'USB Hub',
];

/** Merge a metadata patch without erasing unrelated keys. Never treat false as missing. */
export function mergeHardwareMetadata(
  existing: Record<string, unknown> | null | undefined,
  patch: Record<string, unknown> | undefined,
  category: string,
): Record<string, any> {
  const result = { ...(existing || {}), ...(patch || {}) };
  if (patch && Object.hasOwn(patch, 'components')) {
    if (!Array.isArray(patch.components) || patch.components.length > 50)
      throw new BadRequestException(
        'Components must be a list of at most 50 names',
      );
    const names = new Map<string, string>();
    for (const item of patch.components) {
      if (typeof item !== 'string' || !item.trim() || item.trim().length > 80)
        throw new BadRequestException(
          'Each component needs a name of 1–80 characters',
        );
      const name = item.trim();
      names.set(
        name.toLowerCase(),
        COMPONENTS.find((x) => x.toLowerCase() === name.toLowerCase()) || name,
      );
    }
    result.components = [...names.values()];
    result.hasMouse = names.has('mouse');
    result.hasKeyboard = names.has('keyboard');
  }
  if (!['laptop', 'mobile', 'noc'].includes(category.trim().toLowerCase())) {
    delete result.chargerIncluded;
  } else if (
    Object.hasOwn(result, 'chargerIncluded') &&
    typeof result.chargerIncluded !== 'boolean'
  ) {
    throw new BadRequestException('Charger Included must be true or false');
  }
  if (patch && Object.hasOwn(patch, 'ocsLink')) {
    if (patch.ocsLink === null || patch.ocsLink === '') delete result.ocsLink;
    else {
      if (
        typeof patch.ocsLink !== 'string' ||
        patch.ocsLink.trim().length > 2048
      )
        throw new BadRequestException('Invalid OCS URL');
      try {
        const url = new URL(patch.ocsLink.trim());
        if (
          !['http:', 'https:'].includes(url.protocol) ||
          url.username ||
          url.password
        )
          throw new Error();
        result.ocsLink = url.href;
      } catch {
        throw new BadRequestException(
          'OCS Link must be an absolute HTTP or HTTPS URL without credentials',
        );
      }
    }
  }
  return result;
}
