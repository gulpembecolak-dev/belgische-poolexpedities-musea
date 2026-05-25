/**
 * expeditions.js — all expedition content data.
 *
 * Belgica: fully populated from the master brief.
 * Boudewijn & Hubert: structurally complete, placeholder photo slots.
 */

export const expeditions = {
  adrien: {
    id: 'adrien',
    captain: 'Adrien de Gerlache',
    year: '1897–1899',
    yearShort: '1897',
    ship: 'Belgica',
    motto: 'om te overleven',
    subtitle: 'De eerste Antarctische overwintering',
    customScene: 'adrien-gallery',
    intro: 'In 1897 vertrok een omgebouwd zeiljacht uit Antwerpen naar het einde van de wereld. Wat volgde was geen triomf, maar een beproeving — dertien maanden opgesloten in het ijs, twee doden, en een bemanning die langzaam weggleed in waanzin en duisternis. Toch keerden ze terug. En wat ze meebrachten veranderde de wetenschap voorgoed.',
    portraitPath: '/photos/adrien/portrait.jpg',
    portraitPosition: '60% 25%',
    aesthetic: {
      bg: 'var(--color-bg-primary)',
      accent: 'var(--color-lantaarn)',
    },

    poster: [
      { number: 19,  label: 'mannen',         detail: 'multinationaal' },
      { number: 88,  label: 'ontdekkingen',    detail: 'incl. Gerlachestraat met eilanden' },
      { number: 92,  label: 'publicaties',     detail: '9 volumes, compilatie >40 jaar' },
      { number: 380, label: 'dagen',           detail: 'vastgevroren in pakijs' },
    ],

    figures: [
      { name: 'Adrien de Gerlache',  role: 'Expedtieleider',              detail: 'Belgisch officier, droomde van de Zuidpool sinds zijn jeugd' },
      { name: 'Roald Amundsen',      role: 'Eerste stuurman (Noors)',      detail: 'Later de eerste mens op de Zuidpool (1911)' },
      { name: 'Frederick Cook',      role: 'Arts & fotograaf (Amerikaans)',detail: 'Hield de bemanning in leven met zeehondenvlees tegen scheurbuik' },
      { name: 'Emil Racoviță',       role: 'Zoöloog (Roemeens)',           detail: 'Grondlegger van de biospeleologie' },
      { name: 'Georges Lecointe',    role: 'Eerste stuurman & navigator',  detail: 'Verantwoordelijk voor astronomische waarnemingen' },
      { name: 'Auguste-Karl Wiencke',role: 'Matroos (Noors)',              detail: 'Overboord geslagen, eerste sterfgeval — 22 jan 1898' },
      { name: 'Émile Danco',         role: 'Geofysicus (Belgisch)',        detail: 'Overleed aan hartfalen — 5 juni 1898' },
    ],

    moments: [
      {
        id: 'vertrek',
        date: '16 augustus 1897',
        place: 'Antwerpen',
        title: 'Vertrek van de Belgica',
        body: 'Op een grijze augustusdag verlaat het driemaster-zeiljacht de Scheldekaaien. De Belgica — oorspronkelijk de Noorse Patria, gebouwd in 1884 — is omgebouwd voor poolonderzoek. Aan boord: negentien mannen uit zes landen. Onder hen een jonge Noorse stuurman genaamd Roald Amundsen, en een Amerikaanse arts die later beroemd én berucht zal worden: Frederick Cook. Niemand weet dat ze pas over twee jaar en twee maanden zullen terugkeren.',
        photoPath: '/photos/adrien/moments/vertrek.jpg',
        photoCredit: 'Archief Koninklijk Belgisch Instituut voor Natuurwetenschappen',
      },
      {
        id: 'patagonia',
        date: 'najaar 1897',
        place: 'Patagonië',
        title: 'Verkenning in Patagonië',
        body: 'Voordat ze naar het zuiden afdalen, brengen de wetenschappers weken door in Vuurland. Cook trekt de wildernis in en leeft bij de Ona-indianen. Racoviță verzamelt honderden specimens van flora en fauna. Het is de laatste keer dat ze groen zullen zien — voor heel lange tijd.',
        photoPath: '/photos/adrien/moments/patagonia.jpg',
        photoCredit: 'Frederick Cook, 1897',
      },
      {
        id: 'wiencke',
        date: '22 januari 1898',
        place: 'Antarctische wateren',
        title: 'Wiencke overboord',
        body: 'Tijdens een storm slaat de jonge Noorse matroos Auguste-Karl Wiencke overboord. Lecointe springt hem achterna, maar het ijskoude water is te sterk. Wiencke verdwijnt in de golven. Hij is negentien jaar oud — het eerste sterfgeval van de expeditie. Een eiland in de Palmerarchipel draagt vandaag zijn naam.',
        photoPath: '/photos/adrien/moments/wiencke.jpg',
        photoCredit: 'Archief Emil Racoviță',
      },
      {
        id: 'gerlachestraat',
        date: 'begin februari 1898',
        place: 'Antarctisch Schiereiland',
        title: 'Ontdekking Gerlachestraat',
        body: 'De Belgica vaart een nog onbekende zeestraat in tussen het Antarctisch Schiereiland en een archipel van eilanden. De Gerlache noemt ze naar Belgische steden: Antwerpen, Brabant, Gent, Luik. De straat zelf zal later zijn naam dragen. Het is een van de 88 geografische ontdekkingen van de expeditie.',
        photoPath: '/photos/adrien/moments/gerlachestraat.jpg',
        photoCredit: 'Archief Belgica-expeditie',
      },
      {
        id: 'vastgevroren',
        date: '28 februari 1898',
        place: '71°30′ Z, 85°15′ W',
        title: 'Vast in het pakijs',
        body: 'Op 71°30\' zuiderbreedte, nabij het afgelegen Peter I-eiland, sluit het pakijs zich rond de Belgica. Het schip zit muurvast. De Gerlache realiseert zich dat ze niet meer kunnen ontsnappen vóór de winter. Ze zijn de eersten die onvrijwillig een Antarctische winter zullen doorbrengen — een beproeving waar niemand zich op heeft voorbereid.',
        photoPath: '/photos/adrien/moments/vastgevroren.jpg',
        photoCredit: 'Frederick Cook, 1898',
      },
      {
        id: 'poolnacht',
        date: '18 mei 1898',
        place: 'Bellingshausen Zee',
        title: 'Begin van de poolnacht',
        body: 'De zon zakt onder de horizon en komt zeventig dagen lang niet meer terug. De temperatuur daalt tot min veertig graden. De bemanning leeft bij olielampenlicht in een bevroren schip. Sommigen worden gek. Anderen worden apathisch. Cook, de arts, schrijft dat de duisternis "de ziel langzaam verstikt."',
        photoPath: '/photos/adrien/moments/poolnacht.jpg',
        photoCredit: 'Frederick Cook, 1898',
      },
      {
        id: 'maanfoto',
        date: '20 mei 1898',
        place: 'Pakijs',
        title: 'Cooks maanfoto',
        body: 'In de absolute stilte van de poolnacht maakt Frederick Cook een foto die iconisch zal worden: de Belgica verlicht door maanlicht, omringd door ijs. De belichting duurt negentig minuten bij min veertig graden. Cook moet de camera handmatig stabiel houden. Het resultaat is een van de eerste nachtfoto\'s ooit gemaakt in Antarctica.',
        photoPath: '/photos/adrien/moments/maanfoto.jpg',
        photoCredit: 'Frederick Cook, 1898 — 90 min belichting, -40°C',
      },
      {
        id: 'danco',
        date: '5 juni 1898',
        place: 'Pakijs',
        title: 'Danco overlijdt',
        body: 'De Belgische geofysicus Émile Danco, al wekenlang verzwakt, overlijdt aan hartfalen. Hij is het tweede sterfgeval. Zijn lichaam wordt door een gat in het ijs in zee gelaten. De bemanning staat in het maanlicht. Cook noteert: "Het ijs sloot zich boven hem als een grafsteen van kristal."',
        photoPath: '/photos/adrien/moments/danco.jpg',
        photoCredit: 'Archief Belgica-expeditie',
      },
      {
        id: 'zon-terug',
        date: '21 juli 1898',
        place: 'Pakijs',
        title: 'De zon keert terug',
        body: 'Na zeventig dagen duisternis verschijnt de eerste rand van de zon boven de horizon. De bemanning verzamelt zich aan dek. Sommigen huilen. Het licht is zwak en koud, maar het is er. Cook schrijft dat ze voelden "alsof de wereld opnieuw geboren werd."',
        photoPath: '/photos/adrien/moments/zon-terug.jpg',
        photoCredit: 'Archief Emil Racoviță',
      },
      {
        id: 'sledetocht',
        date: '30 juli 1898',
        place: 'Pakijs',
        title: 'Eerste sledetocht',
        body: 'Amundsen, Lecointe en Cook ondernemen de eerste sledetocht over het ijs. Het is een verkenning, een oefening, een daad van verzet tegen de bewegingloosheid. Voor Amundsen is het een les die hij veertien jaar later zal gebruiken — als hij als eerste mens de Zuidpool bereikt.',
        photoPath: '/photos/adrien/moments/sledetocht.jpg',
        photoCredit: 'Frederick Cook, 1898',
      },
      {
        id: 'kanaal',
        date: 'januari 1899',
        place: 'Pakijs',
        title: 'Het kanaal door het ijs',
        body: 'Na maanden van planning begint de bemanning met explosieven en handzagen een kanaal door het pakijs te hakken. Honderden meters ijs moeten wijken. Het werk is uitputtend — elke dag vriest het kanaal weer dicht. Maar langzaam, centimeter voor centimeter, banen ze een weg naar open water.',
        photoPath: '/photos/adrien/moments/kanaal.jpg',
        photoCredit: 'Archief Belgica-expeditie',
      },
      {
        id: 'bevrijding',
        date: '15 februari 1899',
        place: 'Bellingshausen Zee',
        title: 'Bevrijd uit het pakijs',
        body: 'Na 380 dagen gevangenschap breekt de Belgica eindelijk vrij uit het pakijs. Het moment is stil — geen gejuich, geen vlaggen. De bemanning is te uitgeput. Maar het schip beweegt weer. Het water is open. De weg naar huis ligt voor hen.',
        photoPath: '/photos/adrien/moments/bevrijding.jpg',
        photoCredit: 'Frederick Cook, 1899',
      },
      {
        id: 'terugkomst',
        date: '5 november 1899',
        place: 'Antwerpen',
        title: 'Terugkomst',
        body: 'Na twee jaar, twee maanden en twintig dagen keert de Belgica terug naar Antwerpen. De bemanning is getekend maar levend. Ze brengen negen volumes aan wetenschappelijke data mee — 92 publicaties die meer dan veertig jaar zullen vergen om samen te stellen. Het is de belangrijkste wetenschappelijke Antarctische expeditie tot dan toe.',
        photoPath: '/photos/adrien/moments/terugkomst.jpg',
        photoCredit: 'Archief Stad Antwerpen',
      },
      {
        id: 'anker-2025',
        date: '2025',
        place: 'Oostende',
        title: 'Het anker keert terug',
        body: 'Honderdachtentwintig jaar na het vertrek keert het anker van de Belgica terug naar België. Een cyclus is afgesloten. Het verhaal is een cirkel geworden.',
        photoPath: '/photos/adrien/moments/anker-2025.jpg',
        photoCredit: '',
      },
    ],

    route: {
      label: 'Route van de Belgica',
      coordinates: [
        { lat: 51.22, lng: 4.40, label: 'Antwerpen' },
        { lat: 32.63, lng: -16.90, label: 'Madeira' },
        { lat: -22.91, lng: -43.17, label: 'Rio de Janeiro' },
        { lat: -34.88, lng: -56.16, label: 'Montevideo' },
        { lat: -53.16, lng: -70.91, label: 'Punta Arenas' },
        { lat: -64.50, lng: -62.00, label: 'Antarctisch Schiereiland' },
        { lat: -71.50, lng: -85.25, label: 'Vastgevroren (pakijs)' },
        { lat: -64.00, lng: -63.00, label: 'Bevrijding' },
        { lat: -53.16, lng: -70.91, label: 'Punta Arenas (terug)' },
        { lat: 51.22, lng: 4.40, label: 'Antwerpen (terug)' },
      ],
    },
  },

  gaston: {
    id: 'gaston',
    captain: 'Gaston de Gerlache',
    year: '1957–1967',
    yearShort: '1957',
    ship: 'Polarhav',
    motto: 'om een spoor achter te laten',
    subtitle: 'Boudewijn Basis — het vergeten spoor',
    customScene: 'gaston-expedition',
    intro: 'Zestig jaar na de Belgica keert een De Gerlache terug naar Antarctica. Gaston, zoon van Adrien, bouwt een basis in Koningin Maud Land. Tien jaar lang zal ze dienst doen — tot het geld opraakt, de politiek verschuift, en de sneeuw haar begrafenist. Vandaag is er niets meer zichtbaar. Het verdwijnen IS het verhaal.',
    portraitPath: '/photos/gaston/portrait.jpg',
    portraitPosition: '50% 20%',
    aesthetic: {
      bg: 'var(--color-bg-primary)',
      accent: '#8AA8C8',
    },

    poster: [
      { number: 3,  label: 'expedities',     detail: 'Belgische poolexpedities' },
      { number: 2,  label: 'bergketens',      detail: 'Belgica- & Koningin Fabiolagebergte' },
      { number: 10, label: 'jaren',           detail: 'basis operationeel (1957–1967)' },
      { number: 0,  label: 'zichtbare resten',detail: 'volledig ondergesneeuwd' },
    ],

    figures: [
      { name: 'Gaston de Gerlache',  role: 'Expedtieleider',        detail: 'Zoon van Adrien — de poolroeping ging over in het bloed' },
      { name: 'Tony Van Autenboer',  role: 'Glacioloog',            detail: 'Leidde het wetenschappelijk onderzoek' },
      { name: 'Guido Derom',         role: 'Piloot & verkenner',    detail: 'Ontdekte het Koningin Fabiolagebergte vanuit de lucht' },
      { name: 'F. Bastin',           role: 'Geoloog',               detail: 'Bestudeerde de Antarctische rotsformaties' },
      { name: 'Hugo Decleir',        role: 'Glacioloog',            detail: 'Documenteerde de ijsdynamiek rond de basis' },
    ],

    moments: [
      {
        id: 'aankomst',
        date: '26 december 1957',
        place: 'Koningin Maud Land',
        title: 'Aankomst met de Polarhav',
        body: 'De ijsbreker Polarhav bereikt de kust van Koningin Maud Land op 70°26\' zuiderbreedte. Gaston de Gerlache — zoon van Adrien, die zestig jaar eerder dezelfde reis maakte — leidt de bouw van wat de Boudewijn Basis zal worden. Het is IGY-jaar: het Internationaal Geofysisch Jaar dat de wetenschappelijke aanwezigheid op Antarctica formaliseert.',
        photoPath: '/photos/gaston/moments/aankomst.jpg',
        photoCredit: '',
      },
      {
        id: 'eerste-overwintering',
        date: '1958',
        place: 'Boudewijn Basis',
        title: 'Eerste overwintering',
        body: 'De eerste ploeg overwintert in de pas gebouwde basis. Het onderzoek richt zich op zuiderlicht, ionosfeer, aardmagnetisme en glaciologie. De winter is stil maar productief. Buiten raast de wind; binnen verzamelen de wetenschappers data die decennia later nog relevant zullen zijn.',
        photoPath: '/photos/gaston/moments/overwintering.jpg',
        photoCredit: '',
      },
      {
        id: 'fabiola',
        date: '1960',
        place: 'Koningin Maud Land',
        title: 'Ontdekking Fabiolagebergte',
        body: 'Piloot Guido Derom ontdekt vanuit de lucht een onbekende bergketen. Hij noemt haar naar de Belgische koningin Fabiola. Het is een van de twee bergketens die de Belgische expedities ontdekken — de andere, het Belgicagebergte, draagt de naam van het schip dat alles begon.',
        photoPath: '/photos/gaston/moments/fabiola.jpg',
        photoCredit: '',
      },
      {
        id: 'sluiting-1961',
        date: '31 januari 1961',
        place: 'Boudewijn Basis',
        title: 'Eerste sluiting',
        body: 'Het geld is op. De Belgische overheid sluit de basis na drie jaar. De gebouwen worden achtergelaten, de instrumenten ingepakt. De wind en de sneeuw nemen het over.',
        photoPath: '/photos/gaston/moments/sluiting-1961.jpg',
        photoCredit: '',
      },
      {
        id: 'heropening',
        date: '1964',
        place: 'Boudewijn Basis',
        title: 'Heropening',
        body: 'Drie jaar later keren Belgische en Nederlandse wetenschappers terug. De oude basis is ondergesneeuwd — onherkenbaar. Ze graven een nieuwe ingang, herstellen wat ze kunnen. Het is een spookachtige ervaring: hun eigen verleden begraven onder meters ijs.',
        photoPath: '/photos/gaston/moments/heropening.jpg',
        photoCredit: '',
      },
      {
        id: 'sluiting-1967',
        date: '1967',
        place: 'Boudewijn Basis',
        title: 'Definitieve sluiting',
        body: 'De basis wordt voor de laatste keer gesloten. Ditmaal is er geen plan om terug te keren. De gebouwen verdwijnen langzaam onder het ijs. Vandaag is er niets meer zichtbaar aan het oppervlak. De Boudewijn Basis bestaat alleen nog in archieven en herinneringen.',
        photoPath: '/photos/gaston/moments/sluiting-1967.jpg',
        photoCredit: '',
      },
      {
        id: 'pe-station',
        date: '2009–heden',
        place: 'Koningin Maud Land',
        title: 'Princess Elisabeth Station',
        body: 'De Belgische pooltraditie leeft voort. Het Princess Elisabeth Station — het eerste zero-emission poolstation ter wereld — opent in 2009. Het is geen opvolger van de Boudewijn Basis, maar het draagt dezelfde droom: Belgisch onderzoek op het zesde continent.',
        photoPath: '/photos/gaston/moments/pe-station.jpg',
        photoCredit: '',
      },
    ],

    route: {
      label: 'Route naar Boudewijn Basis',
      coordinates: [
        { lat: 51.22, lng: 4.40, label: 'Antwerpen' },
        { lat: -33.92, lng: 18.42, label: 'Kaapstad' },
        { lat: -70.43, lng: 24.32, label: 'Boudewijn Basis' },
      ],
    },
  },

  hubert: {
    id: 'hubert',
    captain: 'Dixie Dansercoer',
    year: '1997–2021',
    yearShort: '1997',
    ship: null,
    motto: 'om de wind te volgen',
    subtitle: 'De moderne verkenners',
    videoIntroSrc: '/videos/dansercoer/hero.mp4',
    customScene: 'hubert-expedition',
    intro: 'Honderd jaar na de Belgica trekken twee Belgen te voet over Antarctica — in de voetsporen van De Gerlache, maar met kites in plaats van zeilen. Alain Hubert en Dixie Dansercoer belichamen een nieuw soort verkenning: niet met een schip, maar met hun lichaam. Hun verhaal eindigt in 2021, op het ijs van Groenland, met een stilte die nog naresoneert.',
    portraitPath: '/photos/hubert/portrait.avif',
    portraitPosition: '50% 30%',
    aesthetic: {
      bg: 'var(--color-bg-primary)',
      accent: '#7EB8A0',
    },

    poster: [
      { number: 100, label: 'dagen',          detail: 'oversteek Antarctica (1997–98)' },
      { number: 30,  label: 'boeken',          detail: 'door Dansercoer' },
      { number: 24,  label: 'jaren',           detail: 'tussen jubileum en dood' },
      { number: 0,   label: 'lichamen teruggevonden', detail: '' },
    ],

    figures: [
      { name: 'Alain Hubert',     role: 'Verkenner & oprichter IPF', detail: 'Initieerde de jubileumoversteek en het Princess Elisabeth Station' },
      { name: 'Dixie Dansercoer', role: 'Verkenner & auteur',        detail: '1962–2021 — verongelukt in een gletsjersspleet op Groenland' },
    ],

    moments: [
      {
        id: 'oversteek',
        date: '1997–1998',
        place: 'Antarctica',
        title: 'In voetsporen van de Belgica',
        body: 'Precies honderd jaar na het vertrek van de Belgica trekken Alain Hubert en Dixie Dansercoer te voet en met kites over Antarctica. Honderd dagen lang. Het is een jubileumhulde en een sportieve prestatie tegelijk — een nieuw hoofdstuk in de Belgische poolgeschiedenis.',
        photoPath: '/photos/hubert/moments/oversteek.jpg',
        photoCredit: '',
      },
      {
        id: 'boek-tanden',
        date: '1998',
        place: 'België',
        title: 'De tanden van de wind',
        body: 'Na hun terugkeer verschijnt het boek "De tanden van de wind: in honderd dagen over Antarctica" van Hubert, Dansercoer en Brent. Het wordt een bestseller en inspireert een generatie.',
        photoPath: '/photos/hubert/moments/boek-tanden.jpg',
        photoCredit: '',
      },
      {
        id: 'chaos-op-ijs',
        date: '2003',
        place: 'Noordpool',
        title: 'Chaos op het ijs',
        body: 'Dansercoer trekt naar het noorden. Zijn Arctic crossing levert het boek "Chaos op het ijs" op. Hij wordt een van de meest ervaren poolverkenners ter wereld.',
        photoPath: '/photos/hubert/moments/chaos-op-ijs.jpg',
        photoCredit: '',
      },
      {
        id: 'solo-110',
        date: '2007–2008',
        place: 'Antarctica',
        title: '110-jarig jubileum',
        body: 'Dansercoer keert solo terug naar Antarctica, honderdtien jaar na de Belgica. Het is een eenzame tocht — geen team, geen schip, alleen hij en de wind.',
        photoPath: '/photos/hubert/moments/solo-110.jpg',
        photoCredit: '',
      },
      {
        id: 'dood-dansercoer',
        date: '7 juni 2021',
        place: 'Groenland',
        title: 'Dixie Dansercoer',
        body: 'Op 7 juni 2021 valt Dixie Dansercoer in een gletsjersspleet op Groenland. Zijn lichaam wordt nooit teruggevonden. Hij was achtenvijftig jaar oud. De stilte die volgde was anders dan de stilte van het ijs — het was de stilte van een verhaal dat te vroeg eindigt.',
        photoPath: '/photos/hubert/moments/dood-dansercoer.jpg',
        photoCredit: '',
      },
      {
        id: 'pe-erfenis',
        date: 'heden',
        place: 'Antarctica',
        title: 'Belgische pooltraditie',
        body: 'Het Princess Elisabeth Station — mede geïnitieerd door Alain Hubert — draagt de Belgische pooltraditie verder. Van de Belgica in 1897 tot het zero-emission station in 2009: meer dan een eeuw van Belgische aanwezigheid op het zesde continent.',
        photoPath: '/photos/hubert/moments/pe-erfenis.jpg',
        photoCredit: '',
      },
    ],

    route: {
      label: 'Kite-traverse Antarctica',
      coordinates: [
        { lat: -71.95, lng: 23.35, label: 'Start (kust)' },
        { lat: -82.00, lng: 10.00, label: 'Binnenland' },
        { lat: -90.00, lng: 0.00, label: 'Zuidpool' },
        { lat: -78.00, lng: -85.00, label: 'Aankomst' },
      ],
    },
  },
};

/** Get an expedition by ID */
export function getExpedition(id) {
  return expeditions[id] ?? null;
}

/** Get all expedition IDs */
export function getExpeditionIds() {
  return Object.keys(expeditions);
}

/** Get a specific moment from an expedition */
export function getMoment(expeditionId, momentId) {
  const exp = expeditions[expeditionId];
  if (!exp) return null;
  return exp.moments.find((m) => m.id === momentId) ?? null;
}

/** Search across all expeditions' moments */
export function searchMoments(query) {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  const results = [];
  for (const exp of Object.values(expeditions)) {
    for (const moment of exp.moments) {
      const searchable = `${moment.title} ${moment.body} ${moment.date} ${moment.place}`.toLowerCase();
      if (searchable.includes(q)) {
        results.push({ expedition: exp, moment });
      }
    }
  }
  return results;
}
