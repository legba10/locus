/**
 * TZ-2: единый fallback для изображений, чтобы не было crash при отсутствии фото.
 * Использовать: src={photo ?? PLACEHOLDER_IMAGE}
 */
export const PLACEHOLDER_IMAGE = '/placeholder.svg';
