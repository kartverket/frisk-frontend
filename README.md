# FRISK Frontend

Velkommen til FRISK Frontend!

Dette repoet inneholder frontend-koden til FRISK, som står for FunksjonsRegistreret i Statens Kartvert. Det er en applikasjon for å bygge opp og redigere et vilkårlig hierarki av _funksjoner_.

Hver funksjon er lenket til en _forelder-funksjon_ og består av et navn og egendefinerte metadata som kan bli konfiguert til å passe et spesifikt bruksområde. En detaljert beskrivelse av oppsettet til konfigurasjonsfilen `frisk.config.js` finnes i seksjonen [Konfigurasjon](#konfigurer-funksjonshierarkiet).

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

## Konfigurer funksjonshierarkiet
