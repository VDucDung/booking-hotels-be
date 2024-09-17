import slugify from 'slugify';

export function createSlug(name: string): string {
  return slugify(name, {
    lower: true,
    strict: true,
    locale: 'vi',
    trim: true,
  });
}

export function createUniqueSlug(
  name: string,
  existingSlugs: string[],
): string {
  let slug = createSlug(name);
  let suffix = 1;

  while (existingSlugs.includes(slug)) {
    slug = createSlug(`${name}-${suffix}`);
    suffix++;
  }

  return slug;
}
