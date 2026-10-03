# Tema Shopify – Nuovo Brand

Tema Shopify **Online Store 2.0** scritto da zero in Liquid, CSS e JavaScript vanilla (nessuna dipendenza).
Il nome del brand viene preso automaticamente da **Impostazioni → Nome negozio**; logo, colori, font e testi si cambiano dall'editor del tema.

Colore principale di default: **`#1F8A5F`** (verde smeraldo).

## Come installarlo

**Opzione A – Caricamento .zip (più semplice)**
1. Scarica `nuovo-brand-theme.zip` dalla root del repo.
2. Shopify Admin → **Negozio online → Temi → Aggiungi tema → Carica file zip**.
3. Clicca **Personalizza** per inserire logo, immagini e testi, poi **Pubblica**.

**Opzione B – Shopify CLI (per sviluppare)**
```bash
npm install -g @shopify/cli
cd theme
shopify theme dev --store tuo-negozio.myshopify.com   # anteprima live
shopify theme push --unpublished                      # carica come nuovo tema
```

## Cosa contiene

| Pagina | Sezioni |
|---|---|
| Home | Hero, Benefici/icone, Collezione in evidenza, Immagine con testo, Video, Recensioni, FAQ, Newsletter |
| Prodotto | Galleria con miniature e swipe, stelline, prezzo con badge sconto, varianti, quantità, bottone + pagamento rapido, garanzie, descrizione, tab a scomparsa, barra "Aggiungi al carrello" fissa, Benefici, Video, Recensioni, FAQ, Prodotti correlati |
| Collezione | Griglia prodotti con ordinamento e paginazione |
| Carrello | Carrello laterale AJAX (o pagina), barra spedizione gratuita |
| Altre | Ricerca, Pagina, Contatti, Blog, Articolo, 404, Password ("Stiamo arrivando"), Account cliente, Gift card |

Tutte le sezioni sono aggiungibili/riordinabili dall'editor. Header e footer usano i section group.

## Impostazioni globali (Personalizza → Impostazioni tema)

- **Colori**: principale, testo bottoni, accento (stelle), sfondo, sfondo alternativo, testo, prezzo scontato
- **Tipografia**: font titoli e testo (libreria font Shopify)
- **Layout**: larghezza pagina, arrotondamento card e bottoni
- **Carrello**: laterale o pagina, soglia spedizione gratuita (es. `49`)
- **Social**: Instagram, TikTok, Facebook, YouTube
- **Favicon**

## Cosa configurare in Shopify dopo l'installazione

1. **Navigazione**: crea i menu `main-menu` e `footer`.
2. **Pagina Contatti**: crea una pagina e assegnale il template `page.contact`.
3. **Collezioni**: in Personalizza, seleziona la collezione nelle sezioni "Collezione in evidenza".
4. **Recensioni**: i testi di esempio vanno sostituiti con recensioni reali. Se usi un'app (Judge.me, Loox…), aggiungi il suo blocco app nella sezione Prodotto: la sezione supporta gli `@app` block.
5. **Policy**: Impostazioni → Policy (spedizione, resi, privacy).

## Struttura

```
theme/
├── assets/       base.css, theme.js
├── config/       settings_schema.json, settings_data.json
├── layout/       theme.liquid, password.liquid
├── locales/      it.default.json
├── sections/     tutte le sezioni + header-group.json / footer-group.json
├── snippets/     product-card, price, icon, cart-drawer, ...
└── templates/    template JSON + customers/*.liquid + gift_card.liquid
```

Il tema passa `theme-check` di Shopify senza errori.
