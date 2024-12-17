# FRISK Frontend

Velkommen til FRISK Frontend!

Dette repoet inneholder frontend-koden til FRISK, som står for FunksjonsRegistreret i Statens Kartverk. Det er en applikasjon for å bygge opp og redigere et vilkårlig hierarki av _funksjoner_.

Hver funksjon er lenket til en _forelder-funksjon_ og består av et navn og egendefinerte metadata som kan bli konfiguert til å passe et spesifikt bruksområde. En detaljert beskrivelse av oppsettet til konfigurasjonsfilen `frisk.config.js` finnes i seksjonen [Konfigurasjon](#konfigurer-funksjonshierarkiet).

< Eksempelbilde av et demo-funksjonshierarki >

## Sett opp frisk-frontend lokalt

### Steg 1

Klon repoet fra github

`git clone <repository-url>`

### Steg 2

For å kjøre lokalt, må du ha Bun installert. Kjør følgende kommando og følg instruksjonene.

`curl -fsSL https://bun.sh/install | bash`

### Steg 3

Installer avhengigheter

`bun install`

### Steg 4

Kjør lokalt

`bun run dev`

## Konfigurer Applikasjonen

Innholdet i applikasjonen kan konfigureres gjennom filen `frisk.config.js`. Denne filen eksporterer et config JSON-objekt der en kan endre generelt innhold i applikasjonen som f.eks. logo eller selve innholdet i hver funksjon i funksjonshierarkiet, kalt funkjons-metadata.

### Generell konfigurasjon

I config-objektet kan man kofigurere følgende generelle innstillinger:

- `logo`: Logo som skal vises på toppen av siden. Spesifiseres gjennom et følgende objekt:

  - `{imageSource: string;}`, der `imageSource` er pathen til logoen som skal vises.

- `title`: Tittel på siden.

- `description`: Forklaringstekst over funksjonshierarkiet.

- `rootNodeName`: Navn på rotfunksjonen i funksjonshierarkiet.

- `columnName`: Navn på kolonnene i funksjonshierarkiet.

- `addButtonName`: Navnet på knappen for å opprette en ny funksjon.

### Metadata på funksjoner

Funksjoner i funksjonshierarkiet kan konfigureres gjennom følgende metadata:

- `key`: Nøkkel som identifiserer metadataen.
- `title`: Tittel på metadataen i visningsmodus.
- `label`: Beskrivelse på metadata input-feltet.
- `type`: Typen til metadataen. Kan være `select`, `text` eller `url`.
  - `selectMode`: Ved type `select` kan metadataen være en `single` eller `multi`-select.
  - `getOptions`: Ved type `select` må getOptions være en funksjon som returnerer en liste med objekter med `value` og `label` properties.
- `getDisplayValue`: En funksjon som returnerer hvordan metadataen skal visuelt fremstilles. Et eksempel på funksjonens bruksområde kan være hvis verdien til metadaten er en ID, men ønsket er å vise navnet ID'en refererer til. Funksjonen tar inn et følgende objekt: {key: string, value: string}. Funksjonen må returnere et objekt med følgende properties:

  - `displayValue`: Visningsteksten som skal vises i visningsmodus.
  - `value`: _Optional_. Brukes ofte i sammenheng med typen `select` siden select options har både en `value` og en `name`.
  - `displayOptions`: _Optional_. Hvordan displayValue skal vises. Kan være `text`, `pill` eller `url`.

- `isRequired`: Kan være `true` eller `false`. Ved `true` vil metadata-feltet være påkrevd ved opprettelse av en funksjon.
- `showOn`: Bestemmer hvor metadataen skal vises. Kan være `update`, `createAndUpdate` eller `readOnly`.
  - `createAndUpdate`: Metadataen vises ved opprettelse og ved redigering av en funksjon.
  - `update`: Metadataen vises kun ved redigering av en funksjon.
  - `readOnly`: Metadataen vises kun ved visning av en funksjon.
- `placeholder`: Placeholder verdien for metadata input-feltet.
- `inheritFromParent`: Kan være `true` eller `false`. Ved `true` vil funksjonen arve metadaten fra sin forelderfunksjon.
