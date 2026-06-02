/**
 * DI tokens for the pratibimba-layouts extension.
 *
 * Hoisted into a no-import-dependencies file so circular import paths through
 * the common barrel cannot leave a `@inject(...)` decorator with an undefined
 * token at class-decoration time.
 */
export const LAYOUT_SWITCHER = Symbol('PratibimbaLayoutSwitcher');
