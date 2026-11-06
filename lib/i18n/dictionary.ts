import type { CompanyStatus } from "@/lib/companies/types";

export type Locale = "en" | "nl";

export type Dictionary = {
  appTitle: string;
  signInTitle: string;
  signOut: string;
  tokenLabel: string;
  tokenHint: string;
  tokenRequired: string;
  continue: string;
  searchLabel: string;
  searchPlaceholder: string;
  statusLabel: string;
  statusAll: string;
  status: Record<CompanyStatus, string>;
  name: string;
  domain: string;
  created: string;
  loading: string;
  loadError: string;
  retry: string;
  empty: string;
  previous: string;
  next: string;
  pagination: string;
  create: string;
  editTitle: string;
  createTitle: string;
  close: string;
  save: string;
  saving: string;
  cancel: string;
  nameRequired: string;
  domainInvalid: string;
  statusInvalid: string;
  drawerLoading: string;
  drawerError: string;
  notFound: string;
  conflict: string;
  reload: string;
  reloaded: string;
  validationError: string;
  saveError: string;
  language: string;
  noDomain: string;
  sortByName: string;
  sortByCreated: string;
};

export const dictionaries: Record<Locale, Dictionary> = {
  en: {
    appTitle: "Companies",
    signInTitle: "Sign in",
    signOut: "Sign out",
    tokenLabel: "Access token",
    tokenHint: "Any non-empty value is accepted.",
    tokenRequired: "Enter a token to continue.",
    continue: "Continue",
    searchLabel: "Search",
    searchPlaceholder: "Search by name or domain...",
    statusLabel: "Status",
    statusAll: "All statuses",
    status: {
      new: "New",
      researching: "Researching",
      contacted: "Contacted",
      qualified: "Qualified",
      rejected: "Rejected",
    },
    name: "Name",
    domain: "Domain",
    created: "Created",
    loading: "Loading companies",
    loadError: "Could not load companies.",
    retry: "Retry",
    empty: "No companies match these filters.",
    previous: "Previous",
    next: "Next",
    pagination: "Pagination",
    create: "Create Company",
    editTitle: "Edit company",
    createTitle: "Create company",
    close: "Close",
    save: "Save Changes",
    saving: "Saving",
    cancel: "Cancel",
    nameRequired: "Name is required.",
    domainInvalid: "Domain must be a string.",
    statusInvalid: "Status is invalid.",
    drawerLoading: "Loading company",
    drawerError: "Could not load this company.",
    notFound: "This company was not found.",
    conflict:
      "Someone else has updated this company. Reload to fetch the latest version without losing your edits.",
    reload: "Reload & Keep Edits",
    reloaded: "Latest version loaded. Your edits are unchanged.",
    validationError: "Please fix the highlighted fields.",
    saveError: "Could not save this company.",
    language: "Language",
    noDomain: "None",
    sortByName: "Sort by name",
    sortByCreated: "Sort by created date",
  },
  nl: {
    appTitle: "Bedrijven",
    signInTitle: "Inloggen",
    signOut: "Uitloggen",
    tokenLabel: "Toegangstoken",
    tokenHint: "Elke niet-lege waarde wordt geaccepteerd.",
    tokenRequired: "Voer een token in om door te gaan.",
    continue: "Doorgaan",
    searchLabel: "Zoeken",
    searchPlaceholder: "Zoek op naam of domein...",
    statusLabel: "Status",
    statusAll: "Alle statussen",
    status: {
      new: "Nieuw",
      researching: "In onderzoek",
      contacted: "Benaderd",
      qualified: "Gekwalificeerd",
      rejected: "Afgewezen",
    },
    name: "Naam",
    domain: "Domein",
    created: "Aangemaakt",
    loading: "Bedrijven laden",
    loadError: "Bedrijven laden is mislukt.",
    retry: "Opnieuw",
    empty: "Geen bedrijven gevonden voor deze filters.",
    previous: "Vorige",
    next: "Volgende",
    pagination: "Paginering",
    create: "Bedrijf aanmaken",
    editTitle: "Bedrijf bewerken",
    createTitle: "Bedrijf toevoegen",
    close: "Sluiten",
    save: "Wijzigingen opslaan",
    saving: "Bezig met opslaan",
    cancel: "Annuleren",
    nameRequired: "Naam is verplicht.",
    domainInvalid: "Domein moet tekst zijn.",
    statusInvalid: "Status is ongeldig.",
    drawerLoading: "Bedrijf laden",
    drawerError: "Dit bedrijf laden is mislukt.",
    notFound: "Dit bedrijf is niet gevonden.",
    conflict:
      "Iemand anders heeft dit bedrijf bijgewerkt. Herlaad om de laatste versie op te halen zonder je wijzigingen te verliezen.",
    reload: "Herladen en bewerkingen behouden",
    reloaded: "Laatste versie geladen. Je wijzigingen zijn ongewijzigd.",
    validationError: "Corrigeer de gemarkeerde velden.",
    saveError: "Dit bedrijf opslaan is mislukt.",
    language: "Taal",
    noDomain: "Geen",
    sortByName: "Sorteren op naam",
    sortByCreated: "Sorteren op aanmaakdatum",
  },
};

export function pageStatus(locale: Locale, page: number, pages: number): string {
  if (locale === "nl") return `Pagina ${page} van ${pages}`;
  return `Page ${page} of ${pages}`;
}

export function showingRange(
  locale: Locale,
  start: number,
  end: number,
  total: number,
): string {
  if (locale === "nl") {
    if (total === 0) return "Toont 0 van 0";
    return `Toont ${start}–${end} van ${total}`;
  }
  if (total === 0) return "Showing 0 of 0";
  return `Showing ${start}–${end} of ${total}`;
}

export function companyMeta(locale: Locale, id: string, version: number): string {
  if (locale === "nl") return `ID: ${id} (versie ${version})`;
  return `ID: ${id} (version ${version})`;
}

export function formatCompanyDate(iso: string, locale: Locale): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat(locale === "nl" ? "nl-NL" : "en-GB", {
    dateStyle: "medium",
  }).format(date);
}

const KNOWN_FIELD_MESSAGES = {
  "Name is required.": "nameRequired",
  "Domain must be a string.": "domainInvalid",
  "Status is invalid.": "statusInvalid",
} as const;

export function translateFieldMessage(
  message: string,
  dictionary: Dictionary,
): string {
  const key = KNOWN_FIELD_MESSAGES[message as keyof typeof KNOWN_FIELD_MESSAGES];
  return key ? dictionary[key] : message;
}
