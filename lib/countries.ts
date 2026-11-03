"use client";

import { useEffect, useState } from "react";
import { loadCountries, type Country } from "./api";

/**
 * Spellings already saved on resumes, pointed at the name the public list uses.
 * The code is matched separately, so "IN" still resolves to India.
 */
const ALIASES: Record<string, string> = {
  usa: "United States",
  us: "United States",
  "u.s.": "United States",
  "u.s.a.": "United States",
  "united states of america": "United States",
  uk: "United Kingdom",
  "u.k.": "United Kingdom",
  britain: "United Kingdom",
  "great britain": "United Kingdom",
  uae: "United Arab Emirates",
  czechia: "Czech Republic",
  holland: "Netherlands",
  "viet nam": "Vietnam",
  "russian federation": "Russia",
  "south korea": "South Korea",
  "republic of korea": "South Korea",
  korea: "South Korea",
};

let cache: Country[] | null = null;
let pending: Promise<Country[]> | null = null;

export function useCountries() {
  const [countries, setCountries] = useState<Country[]>(cache || []);
  const [ready, setReady] = useState(Boolean(cache));

  useEffect(() => {
    let stale = false;
    if (!pending) {
      pending = loadCountries()
        .then((result) => {
          cache = result.countries;
          return result.countries;
        })
        .catch(() => {
          pending = null;
          return cache || [];
        });
    }
    pending.then((list) => {
      if (stale) return;
      setCountries(list);
      setReady(true);
    });
    return () => {
      stale = true;
    };
  }, []);

  return { countries, ready };
}

function indexCountries(countries: Country[]) {
  const byKey = new Map<string, string>();
  for (const country of countries) {
    byKey.set(country.name.toLowerCase(), country.name);
    if (country.code) byKey.set(country.code.toLowerCase(), country.name);
  }
  return byKey;
}

function resolveCountry(raw: string, byKey: Map<string, string>) {
  const key = raw.trim().toLowerCase().replace(/\.$/, "");
  if (!key) return "";
  const direct = byKey.get(key);
  if (direct) return direct;
  const alias = ALIASES[key];
  return alias ? byKey.get(alias.toLowerCase()) || "" : "";
}

/**
 * Split a stored "City, Country" line. Until the list has loaded, a trailing
 * word is shown as the country so the field does not jump. Once it has, only
 * a real country is pulled out — "Remote" and "Pune" stay in the city.
 */
export function splitPlace(location: string, countries: Country[]) {
  const value = location.trim();
  if (!value) return { city: "", country: "" };

  const byKey = indexCountries(countries);
  const whole = resolveCountry(value, byKey);
  if (whole) return { city: "", country: whole };

  const comma = value.lastIndexOf(",");
  if (comma > 0) {
    const city = value.slice(0, comma).trim();
    const raw = value.slice(comma + 1).trim();
    const known = resolveCountry(raw, byKey);
    if (known) return { city, country: known };
    if (!countries.length) return { city, country: raw };
  }

  return { city: value, country: "" };
}

export function joinPlace(city: string, country: string) {
  return [city.trim(), country.trim()].filter(Boolean).join(", ");
}
