import { createContext, useCallback, useContext } from 'react';
import en from '../locales/en.json';
import id from '../locales/id.json';

export enum Lang {
  Id = 'id',
  En = 'en',
}

export const LANGS: Lang[] = [Lang.Id, Lang.En];
export const DEFAULT_LANG: Lang = Lang.Id;

/** Short label for the switch in the header. */
export const LANG_LABEL: Record<Lang, string> = { [Lang.Id]: 'ID', [Lang.En]: 'EN' };

/**
 * en.json is the shape of the record, so this assignment fails to compile if
 * id.json is missing a key or has invented one. No string can go untranslated
 * without the build saying so.
 */
const idStrings: typeof en = id;
const DICTS: Record<Lang, typeof en> = { [Lang.Id]: idStrings, [Lang.En]: en };

export type StringKey = keyof typeof en;

/**
 * The full name of each language, used as the switch's accessible name. It lives
 * in the dictionaries like every other word, keyed by the enum so no component
 * holds a language name or a ternary that picks one.
 */
export const LANG_NAME_KEY: Record<Lang, StringKey> = {
  [Lang.Id]: 'lang.id',
  [Lang.En]: 'lang.en',
};
type Vars = Record<string, string | number>;

export function coerceLang(value: unknown): Lang {
  return value === Lang.En ? Lang.En : DEFAULT_LANG;
}

export function translate(lang: Lang, key: StringKey, vars?: Vars): string {
  const template = DICTS[lang][key] ?? en[key] ?? key;
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match,
  );
}

export type Translate = (key: StringKey, vars?: Vars) => string;

/** Same translation function, for non component callers with an explicit language. */
export function translator(lang: Lang): Translate {
  return (key, vars) => translate(lang, key, vars);
}

/**
 * The language is the first path segment, so the provider takes it from the route
 * parameters rather than holding its own state. One source of truth, shareable links.
 */
export const LangContext = createContext<Lang>(DEFAULT_LANG);

export function useLang(): Lang {
  return useContext(LangContext);
}

export function useT(): Translate {
  const lang = useLang();
  return useCallback<Translate>((key, vars) => translate(lang, key, vars), [lang]);
}
