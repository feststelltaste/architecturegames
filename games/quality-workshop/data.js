/* Daten für den Qualitäts-Workshop: Qualitätsmerkmale (ISO/IEC 25010) und Fälle. */
window.QW = window.QW || {};

/* Die 8 Produktqualitätsmerkmale nach ISO/IEC 25010:2011, im Uhrzeigersinn ab 12 Uhr. */
QW.ATTRS = [
  { id: 'functional',      name: 'Funktionale Eignung',  lines: ['Funktionale', 'Eignung'], fullLines: ['Funktionale', 'Eignung'] },
  { id: 'performance',     name: 'Performance-Effizienz', lines: ['Performance-', 'Effizienz'], fullLines: ['Performance-', 'Effizienz'] },
  { id: 'compatibility',   name: 'Kompatibilität',       lines: ['Kompatibilität'], fullLines: ['Kompati-', 'bilität'] },
  { id: 'usability',       name: 'Benutzbarkeit',        lines: ['Benutzbarkeit'], fullLines: ['Benutz-', 'barkeit'] },
  { id: 'reliability',     name: 'Zuverlässigkeit',      lines: ['Zuverlässigkeit'], fullLines: ['Zuverlässig-', 'keit'] },
  { id: 'security',        name: 'Sicherheit',           lines: ['Sicherheit'], fullLines: ['Sicherheit'] },
  { id: 'maintainability', name: 'Wartbarkeit',          lines: ['Wartbarkeit'], fullLines: ['Wart-', 'barkeit'] },
  { id: 'portability',     name: 'Übertragbarkeit',      lines: ['Übertragbarkeit'], fullLines: ['Übertrag-', 'barkeit'] }
];

/* Skala 0-10: was die Punkte bedeuten. */
QW.SCALE = [
  { from: 0, to: 0,  label: 'völlig egal' },
  { from: 1, to: 2,  label: 'kaum relevant' },
  { from: 3, to: 4,  label: 'nice to have' },
  { from: 5, to: 6,  label: 'wichtig' },
  { from: 7, to: 8,  label: 'sehr wichtig' },
  { from: 9, to: 10, label: 'geschäftskritisch' }
];

/* Schwierigkeitsgrade. Nur "easy" ist spielbar, die anderen sind vorgemerkt. */
QW.LEVELS = [
  { id: 'easy',   name: 'Einfach', people: '3 Personen', blurb: 'Jede Aussage zielt klar auf ein Qualitätsmerkmal.', available: true },
  { id: 'medium', name: 'Mittel',  people: '4 Personen', blurb: 'Aussagen sind vage und indirekt, Merkmale werden mehrfach genannt.', available: true },
  { id: 'hard',   name: 'Schwer',  people: '5 Personen', blurb: 'Widersprüche und Zielkonflikte: du musst abwägen.', available: true }
];

/*
 * Ein Fall: Personen mit Aussagen. Jede Aussage bezieht sich auf ein Merkmal (attr).
 * "truth" ist der Wert 0-10, den die Runde insgesamt meint.
 * look: Aussehen der Pixelfigur (siehe sprites.js).
 */
QW.SCENARIOS = [
  {
    id: 'shop',
    level: 'easy',
    title: 'Schnürsenkel24',
    subtitle: 'Ein Online-Shop für Sportschuhe',
    intro: 'Der Shop soll neu gebaut werden. Hör dir die Beteiligten an und trag ein, wie wichtig jedes Qualitätsmerkmal ist.',
    truth: { functional: 7, performance: 9, compatibility: 4, usability: 8, reliability: 8, security: 9, maintainability: 5, portability: 2 },
    people: [
      {
        id: 'brandt', name: 'Frau Brandt', role: 'Geschäftsführung', color: '#ffd23f',
        look: { skin: '#f0c8a0', hair: '#7a3b1e', hairStyle: 'long', shirt: '#b8324a', extras: [] },
        statements: [
          { attr: 'performance', text: 'Am Black Friday kommen 20.000 Bestellungen pro Stunde. Wenn die Seite lahmt, kaufen alle bei der Konkurrenz. Das überlebt die Firma nicht.' },
          { attr: 'usability', text: 'Unsere Kundschaft ist zwischen 15 und 80. Wer den Bestellknopf nicht findet, ist weg. Die Bedienung muss wirklich sehr gut sein.' },
          { attr: 'functional', text: 'Alles aus dem Lastenheft brauchen wir. Nur der Schuh-Konfigurator ist Zukunftsmusik, der darf später kommen.' }
        ]
      },
      {
        id: 'tim', name: 'Tim', role: 'Entwickler', color: '#6fe3ff',
        look: { skin: '#e8b890', hair: '#2b2b3a', hairStyle: 'short', shirt: '#3a4a8c', iris: '#3a6a9c', extras: ['glasses'] },
        statements: [
          { attr: 'security', text: 'Kreditkarten, Adressen, Passwörter. Wenn da was abfließt, haben wir die DSGVO und die Presse am Hals. Da gibt es keine Abstriche.' },
          { attr: 'maintainability', text: 'Wir sind nur zu dritt am Code. Ein bisschen Ordnung reicht, aber für perfekte Architektur fehlt uns die Zeit.' }
        ]
      },
      {
        id: 'holger', name: 'Holger', role: 'Betrieb', color: '#9dff7a',
        look: { skin: '#d9a77c', hair: '#8a8a8a', hairStyle: 'bald', shirt: '#3d7a4a', iris: '#4a7a9a', extras: ['beard'] },
        statements: [
          { attr: 'reliability', text: 'Wenn der Shop nachts um drei ausfällt, klingelt mein Telefon. Der muss durchlaufen, mindestens 99,9 Prozent.' },
          { attr: 'compatibility', text: 'Ans Warenwirtschaftssystem hängen wir uns über eine Standard-Schnittstelle. Mehr Systeme gibt es nicht. Nett, wenn es klappt, kein Aufreger.' },
          { attr: 'portability', text: 'Alles läuft beim Hoster in Frankfurt und bleibt da. Umziehen? Haben wir nie vor. Das ist mir völlig egal.' }
        ]
      }
    ]
  },
  {
    id: 'klinik',
    level: 'easy',
    title: 'Klinikum Nordstadt',
    subtitle: 'Ein Terminportal für ein Krankenhaus',
    intro: 'Das Klinikum will Termine, Befunde und Labor in einem Portal bündeln. Wer will was?',
    truth: { functional: 8, performance: 4, compatibility: 9, usability: 6, reliability: 9, security: 10, maintainability: 6, portability: 3 },
    people: [
      {
        id: 'weber', name: 'Dr. Weber', role: 'Oberärztin', color: '#ff9ec7',
        look: { skin: '#f3d0b0', hair: '#c9a24a', hairStyle: 'bun', shirt: '#e8eef2', outfit: 'coat', iris: '#4a8a5a', extras: [] },
        statements: [
          { attr: 'reliability', text: 'Fällt die Terminvergabe in der Notaufnahme aus, kann das Leben kosten. Ausfälle sind für mich nicht verhandelbar.' },
          { attr: 'functional', text: 'Die Befund- und Terminlogik muss exakt stimmen. Ein falsch zugeordneter Befund ist ein Kunstfehler.' },
          { attr: 'usability', text: 'Die Kolleginnen werden ja geschult. Es muss ordentlich bedienbar sein, aber ein Designpreis ist nicht nötig.' }
        ]
      },
      {
        id: 'yilmaz', name: 'Frau Yilmaz', role: 'Datenschutz', color: '#ffb36b',
        look: { skin: '#c99468', hair: '#1c1418', hairStyle: 'curly', shirt: '#6a3a8c', extras: ['glasses'] },
        statements: [
          { attr: 'security', text: 'Das sind Gesundheitsdaten, besonders geschützt. Ein Leck, und wir stehen in der Zeitung und bei der Aufsichtsbehörde. Höchste Stufe, ohne Wenn und Aber.' },
          { attr: 'performance', text: 'Eine Terminabfrage darf auch mal drei Sekunden dauern. Wir haben nur 300 Mitarbeitende, das ist kein Online-Shop.' }
        ]
      },
      {
        id: 'jens', name: 'Jens', role: 'IT-Leitung', color: '#8fb8ff',
        look: { skin: '#e5b48a', hair: '#4a3020', hairStyle: 'short', shirt: '#3a3a44', extras: ['tie'] },
        statements: [
          { attr: 'compatibility', text: 'Wir haben 14 Altsysteme: Labor, Radiologie, Abrechnung. Alles spricht HL7, DICOM oder etwas Selbstgebasteltes. Das Portal muss mit allem reden, sonst ist es wertlos.' },
          { attr: 'maintainability', text: 'Das System soll zehn Jahre laufen, auch wenn das Team wechselt. Aber ein Update im Jahr reicht. Wir sind keine Webbude.' },
          { attr: 'portability', text: 'Es läuft in unserem Rechenzentrum und bleibt dort. Cloud ist verboten. An einen Umzug denkt hier keiner.' }
        ]
      }
    ]
  },
  {
    id: 'schule',
    level: 'easy',
    title: 'Lern-Löwe',
    subtitle: 'Eine Lern-App für Grundschulen',
    intro: 'Ein junges Start-up baut eine Lern-App für Erstklässler. Auch Lehrkräfte und der Schulträger reden mit.',
    truth: { functional: 6, performance: 5, compatibility: 5, usability: 10, reliability: 5, security: 8, maintainability: 8, portability: 8 },
    people: [
      {
        id: 'lindner', name: 'Frau Lindner', role: 'Lehrerin', color: '#ffe066',
        look: { skin: '#f0c8a0', hair: '#a14a2a', hairStyle: 'short', shirt: '#2f8f83', extras: ['glasses'] },
        statements: [
          { attr: 'usability', text: 'Meine Erstklässler können kaum lesen. Kommt ein Kind nicht allein klar, stehe ich mit 25 Kindern da. Es muss ohne jede Erklärung gehen.' },
          { attr: 'reliability', text: 'Wenn mittags mal eine Stunde nichts geht, ärgert mich das, aber Arbeitsblätter liegen im Schrank. Ich bin da entspannt.' },
          { attr: 'performance', text: 'Flott genug, dass die Kinder nicht quengeln. Einen Rennwagen brauchen wir nicht.' }
        ]
      },
      {
        id: 'ben', name: 'Ben', role: 'Gründer', color: '#7affc4',
        look: { skin: '#e8b890', hair: '#2a1a10', hairStyle: 'curly', shirt: '#ff7a3d', outfit: 'tshirt', iris: '#3a6a9c', extras: [] },
        statements: [
          { attr: 'functional', text: 'Wir haben Mathe und Deutsch, mehr nicht. Für den Start reicht ein Kern, Hauptsache die Aufgaben stimmen.' },
          { attr: 'maintainability', text: 'Wir wollen jede Woche neue Aufgabentypen ausrollen. Kostet jeder Typ zwei Wochen Umbau, sind wir pleite. Änderbarkeit ist unser Geschäftsmodell.' },
          { attr: 'portability', text: 'Schulen haben iPads, Android-Tablets und alte Windows-Rechner. Wir wollen überall laufen, ohne alles dreimal zu bauen.' }
        ]
      },
      {
        id: 'mia', name: 'Mia', role: 'Schulträger-IT', color: '#d6a6ff',
        look: { skin: '#d9a77c', hair: '#1c1c1c', hairStyle: 'long', shirt: '#4a4a9c', extras: [] },
        statements: [
          { attr: 'security', text: 'Das sind Kinderdaten, Noten, Lernstände. Eltern sind da zu Recht empfindlich. Sauber muss es sein, aber wir sind keine Bank.' },
          { attr: 'compatibility', text: 'Die Schul-Logins laufen über unseren Verzeichnisdienst. Einmal anbinden, fertig. Mehr Integration brauchen wir nicht.' }
        ]
      }
    ]
  },
  /* ---------------- Mittel: vage, indirekte Aussagen, Merkmale mehrfach genannt ---------------- */
  {
    id: 'heizung',
    level: 'medium',
    title: 'SmartHeat',
    subtitle: 'Eine App für Heizungssteuerungen',
    intro: 'Ein Hersteller will seine Heizungsregler per App steuerbar machen. Hier fällt kaum jemand mit der Tür ins Haus: Lies zwischen den Zeilen.',
    truth: { functional: 6, performance: 3, compatibility: 8, usability: 8, reliability: 9, security: 7, maintainability: 7, portability: 6 },
    people: [
      {
        id: 'okafor', name: 'Frau Okafor', role: 'Produktmanagement', color: '#ffd23f',
        look: { skin: '#8a5a3a', hair: '#1a1010', hairStyle: 'curly', shirt: '#d0478a', outfit: 'shirt', iris: '#3a2a1a', extras: [] },
        statements: [
          { attr: 'reliability', text: 'Letzten Winter stand eine Seniorin bei minus acht Grad ohne Heizung da, weil die App einen Befehl verschluckt hat. Am nächsten Tag stand es in der Zeitung.', hint: 'Gefahr für Menschen plus schlechte Presse: Ausfälle sind kaum tolerierbar.' },
          { attr: 'usability', text: 'Unsere Kundschaft ist über siebzig. Meine Mutter hat die App nach drei Minuten genervt wieder gelöscht.', hint: 'Wer eine App nach drei Minuten löscht, findet sich nicht zurecht. Bei dieser Zielgruppe ist der Anspruch sehr hoch.' },
          { attr: 'functional', text: 'Wochenprogramm, Absenkung, Urlaubsmodus: Das hat jeder Wettbewerber. Fehlt eins davon, fragt der Handel sofort nach.', hint: 'Der Standardumfang wird erwartet, Exotisches nicht. Wichtig, aber nicht kritisch.' }
        ]
      },
      {
        id: 'dennis', name: 'Dennis', role: 'Firmware-Entwicklung', color: '#6fe3ff',
        look: { skin: '#f0c8a0', hair: '#c9a24a', hairStyle: 'short', shirt: '#2f6a8c', outfit: 'tshirt', iris: '#3a6a9c', extras: ['glasses'] },
        statements: [
          { attr: 'maintainability', text: 'Die Heizungen laufen fünfzehn Jahre. In der Zeit ändern sich Protokolle, Cloud-Dienste und Betriebssysteme. Ich will nicht der Einzige sein, der den Code dann noch versteht.', hint: 'Lange Laufzeit bei sich ändernder Umgebung: Änderbarkeit ist sehr wichtig.' },
          { attr: 'compatibility', text: 'Viele haben schon einen Thermostat von einem anderen Hersteller oder eine Alexa im Haus. Redet unsere App mit denen nicht, ist sie ein Insel-Spielzeug.', hint: 'Ohne Zusammenspiel mit Fremdgeräten ist die App eine Insel. Hohe Kompatibilität.' },
          { attr: 'performance', text: 'Der Kessel reagiert sowieso nur alle paar Minuten. Ob die App in zweihundert Millisekunden oder in zwei Sekunden antwortet, merkt niemand.', hint: 'Die Heizung reagiert ohnehin träge. Antwortzeiten sind kaum relevant.' }
        ]
      },
      {
        id: 'kaya', name: 'Frau Kaya', role: 'Kundenservice', color: '#ffa94d',
        look: { skin: '#e0b088', hair: '#2a1a14', hairStyle: 'long', shirt: '#e8a02a', outfit: 'shirt', iris: '#4a3020', extras: [] },
        statements: [
          { attr: 'usability', text: 'Die meisten Anrufe lauten: „Wie stelle ich die Nachtabsenkung ein?“ Würde die Hälfte davon wegfallen, könnte ich eine Stelle anders besetzen.', hint: 'Viele Anrufe zur Bedienung zeigen: Die App erklärt sich nicht selbst. Das kostet Geld.' },
          { attr: 'security', text: 'Neulich fragte eine Kundin, ob Fremde in der App sehen können, wann sie im Urlaub ist. Sie war wirklich beunruhigt.', hint: 'Anwesenheitsdaten sind sensibel. Die Sorge der Kundschaft ist ein Warnsignal.' }
        ]
      },
      {
        id: 'vogel', name: 'Herr Vogel', role: 'Vertrieb', color: '#9dff7a',
        look: { skin: '#e8b890', hair: '#8a8a8a', hairStyle: 'short', shirt: '#3a3a44', iris: '#4a7a9a', extras: ['tie'] },
        statements: [
          { attr: 'portability', text: 'Wir verkaufen die Regler in drei Baureihen und wollen sie ab nächstem Jahr auch für Wärmepumpen anbieten. Hoffentlich müssen wir dafür nicht alles neu bauen.', hint: 'Neue Baureihen und Wärmepumpen: Dieselbe Software muss auf andere Geräte übertragbar sein.' },
          { attr: 'reliability', text: 'Wenn Installateure wegen eines Ausfalls nachts rausmüssen, kündigen sie uns die Partnerschaft.', hint: 'Nachteinsätze kosten Vertriebspartner: noch einmal ein Hinweis auf sehr hohe Zuverlässigkeit.' },
          { attr: 'functional', text: 'Mit Wetterprognose oder KI-Optimierung gewinne ich keinen einzigen Handwerker. Die wollen, dass es einfach läuft.', hint: 'Spielereien sind unwichtig. Der Kern muss einfach funktionieren.' }
        ]
      }
    ]
  },
  {
    id: 'rathaus',
    level: 'medium',
    title: 'Stadt Neuberg',
    subtitle: 'Ein Bürgerportal für das Rathaus',
    intro: 'Die Stadt will Ummeldungen und Anträge online anbieten. Jede und jeder im Rathaus sieht ein anderes Stück davon.',
    truth: { functional: 8, performance: 4, compatibility: 7, usability: 7, reliability: 5, security: 9, maintainability: 8, portability: 5 },
    people: [
      {
        id: 'hahn', name: 'Frau Hahn', role: 'Bürgermeisterin', color: '#ffd23f',
        look: { skin: '#f0c8a0', hair: '#9a9a9a', hairStyle: 'bun', shirt: '#2a4a8c', outfit: 'suit', iris: '#4a6a9c', extras: [] },
        statements: [
          { attr: 'usability', text: 'Ich wünsche mir, dass die Leute einen Wohnsitzwechsel erledigen, ohne einmal im Bürgerbüro anzurufen. Hat das Büro nur noch die Hälfte der Anrufe, bin ich zufrieden.', hint: 'Selbstbedienung ohne Rückfragen heißt gute Benutzbarkeit, aber ohne Extremanspruch.' },
          { attr: 'security', text: 'Steht irgendwo in der Zeitung, dass Meldedaten unserer Stadt im Netz lagen, trete ich zurück. So einfach ist das.', hint: 'Der Verlust von Meldedaten wäre politisch existenzbedrohend.' }
        ]
      },
      {
        id: 'demir', name: 'Herr Demir', role: 'Amtsleitung', color: '#6fe3ff',
        look: { skin: '#d9a77c', hair: '#1c1c1c', hairStyle: 'short', shirt: '#5a5a64', iris: '#3a2a1a', extras: ['tie', 'glasses'] },
        statements: [
          { attr: 'functional', text: 'Jedes Formular muss exakt dem entsprechen, was das Gesetz vorschreibt. Ein falsches Feld, und der Bescheid ist anfechtbar.', hint: 'Rechtliche Exaktheit ist Kern der Funktion. Sehr hoch.' },
          { attr: 'compatibility', text: 'Im Haus laufen drei Fachverfahren für Melde-, Steuer- und Sozialwesen. Die kann ich nicht ersetzen, die gehören dem Land.', hint: 'Feste Altsysteme müssen angebunden werden. Hohe Kompatibilität.' },
          { attr: 'reliability', text: 'Nachts und am Wochenende darf das Portal von mir aus auch mal stehen. Wir sind ja kein Notdienst.', hint: 'Kein Rund-um-die-Uhr-Betrieb nötig: mittlere Zuverlässigkeit.' }
        ]
      },
      {
        id: 'schulz', name: 'Frau Schulz', role: 'Sachbearbeitung', color: '#9dff7a',
        look: { skin: '#f3d0b0', hair: '#a14a2a', hairStyle: 'long', shirt: '#6a9a4a', outfit: 'shirt', iris: '#4a8a5a', extras: ['glasses'] },
        statements: [
          { attr: 'maintainability', text: 'Alle paar Monate ändert der Bund Gebühren oder Fristen. Beim letzten Mal hat der Dienstleister sechs Wochen gebraucht, um das in der Software anzupassen.', hint: 'Häufige Gesetzesänderungen verlangen schnelle Anpassbarkeit. Sehr wichtig.' },
          { attr: 'performance', text: 'Montagmorgen, wenn alle Ummeldungen reinkommen, ist es zäh. Aber das war schon im Papierzeitalter so.', hint: 'Spitzen sind bekannt und werden hingenommen. Leistung ist kein großes Thema.' },
          { attr: 'usability', text: 'Viele Ältere kommen mit dem Smartphone vom Enkel. Das Formular muss auch auf kleinen Bildschirmen gehen.', hint: 'Mobile Nutzung und ungeübte Menschen: Benutzbarkeit sehr wichtig.' }
        ]
      },
      {
        id: 'jonas', name: 'Jonas', role: 'Dienstleister', color: '#d6a6ff',
        look: { skin: '#e5b48a', hair: '#2a1a10', hairStyle: 'curly', shirt: '#7a4ac0', outfit: 'tshirt', iris: '#3a6a9c', extras: ['beard'] },
        statements: [
          { attr: 'portability', text: 'Wir hosten im kommunalen Rechenzentrum. Ob wir später in eine Landes-Cloud müssen, weiß keiner. Schön wäre, wir müssten dafür nicht komplett umbauen.', hint: 'Ein möglicher Umzug ohne Umbau: Übertragbarkeit ist mittel bis wichtig.' },
          { attr: 'reliability', text: 'Fällt es aus, muss es innerhalb eines Werktags wieder laufen. Mehr verlangt der Vertrag nicht.', hint: 'Wiederanlauf in einem Werktag bestätigt: mittlere Zuverlässigkeit.' },
          { attr: 'performance', text: 'Bei achtzigtausend Einwohnern reden wir über ein paar hundert Zugriffe am Tag. Dafür brauchen wir keine Lastspitzen-Architektur.', hint: 'Kleine Last: Leistung ist nebensächlich bis nice to have.' }
        ]
      }
    ]
  },
  /* ---------------- Schwer: Widersprüche und Zielkonflikte ---------------- */
  {
    id: 'bank',
    level: 'hard',
    title: 'Vorwärts-Bank',
    subtitle: 'Eine Neobank-App kurz vor dem Start',
    intro: 'Fünf Leute, fünf Interessen. Manche widersprechen sich offen. Wer Daten oder Auflagen auf seiner Seite hat, hat meist recht.',
    truth: { functional: 6, performance: 6, compatibility: 7, usability: 7, reliability: 9, security: 9, maintainability: 6, portability: 5 },
    why: {
      performance: 'Datenlage schlägt Wunsch: Nach etwa drei Sekunden brechen Nutzer ab, darüber hinaus bringt Tempo kaum etwas. Wichtig, aber nicht geschäftskritisch.',
      maintainability: 'Marktstart und Nachhaltigkeit ziehen in verschiedene Richtungen. Realistisch ist ein sauberer Kern bei bewusst aufgeschobenen Details.',
      security: 'Die Aufsicht schreibt starke Authentifizierung vor. Das ist gesetzt und nicht verhandelbar.',
      usability: 'Auflagen begrenzen, wie wenige Schritte möglich sind. Benutzbarkeit bleibt sehr wichtig, ordnet sich aber der Pflicht zur Sicherheit unter.'
    },
    people: [
      {
        id: 'lang', name: 'Frau Lang', role: 'Geschäftsführung', color: '#ffd23f',
        look: { skin: '#f0c8a0', hair: '#d8b84a', hairStyle: 'long', shirt: '#1a1a2a', outfit: 'suit', iris: '#4a6a9c', extras: [] },
        statements: [
          { attr: 'performance', claim: 9, text: 'Unser Slogan lautet: schneller als jede andere Bank. Liegt die App auch nur einen Tick hinter dem Wettbewerb, ist die Marke tot.' },
          { attr: 'maintainability', claim: 2, text: 'In sechs Monaten muss das Ding live sein, sonst springt der Investor ab. Aufräumen können wir danach immer noch.' },
          { attr: 'portability', text: 'Nach Deutschland kommen Österreich und Frankreich, vielleicht Italien. Dass die Bank mit in neue Länder wandern kann, gehört zur Story.' }
        ]
      },
      {
        id: 'brandl', name: 'Herr Brandl', role: 'Technikleitung', color: '#6fe3ff',
        look: { skin: '#e8b890', hair: '#555555', hairStyle: 'bald', shirt: '#3a4a5a', outfit: 'tshirt', iris: '#4a7a9a', extras: ['glasses', 'beard'] },
        statements: [
          { attr: 'maintainability', claim: 9, text: 'Ich habe zwei Banken an ihrer Altlast eingehen sehen. Wir bauen von Anfang an sauber, sonst zahlen wir in drei Jahren doppelt.' },
          { attr: 'compatibility', text: 'Zahlungsverkehr, Kartenanbieter, Schufa, Geldwäsche-Scoring: Das sind zwölf externe Schnittstellen. Hier darf nichts brechen.' }
        ]
      },
      {
        id: 'albrecht', name: 'Frau Albrecht', role: 'Compliance', color: '#ff9ec7',
        look: { skin: '#e0b088', hair: '#6a3a1a', hairStyle: 'bun', shirt: '#5a2a4a', outfit: 'suit', iris: '#4a3020', extras: ['glasses'] },
        statements: [
          { attr: 'security', claim: 10, text: 'Die Aufsicht erwartet starke Authentifizierung bei jeder sensiblen Aktion. Das ist keine Option, sondern Pflicht.' },
          { attr: 'reliability', text: 'Fällt die Überweisung länger als ein paar Stunden aus, muss ich es der Aufsicht melden. Das kostet uns Ärger um die Lizenz.' }
        ]
      },
      {
        id: 'kai', name: 'Kai', role: 'Produkt', color: '#7affc4',
        look: { skin: '#c99468', hair: '#1c1418', hairStyle: 'curly', shirt: '#2fa89a', outfit: 'tshirt', iris: '#3a2a1a', extras: [] },
        statements: [
          { attr: 'usability', claim: 9, text: 'Jeder zusätzliche Schritt bei der Überweisung kostet uns Kundschaft, das haben wir gemessen. In drei Taps muss es erledigt sein.' },
          { attr: 'functional', text: 'Zum Start: Girokonto, Überweisung, Karte. Kredite, Aktien und Krypto kommen irgendwann. Erst einmal der Kern.' },
          { attr: 'performance', text: 'Unsere Tests zeigen: Nach drei Sekunden Wartezeit brechen Leute ab. Alles darunter merken sie kaum.' }
        ]
      },
      {
        id: 'roth', name: 'Herr Roth', role: 'Betrieb', color: '#ffa94d',
        look: { skin: '#d9a77c', hair: '#8a8a8a', hairStyle: 'short', shirt: '#4a6a3a', outfit: 'shirt', iris: '#4a7a9a', extras: ['beard'] },
        statements: [
          { attr: 'performance', claim: 4, text: 'Ob die Überweisung in dreihundert oder in achthundert Millisekunden läuft, merkt keiner. Dafür bauen wir keinen Hochleistungs-Cluster.' },
          { attr: 'reliability', text: 'Nachts ist bei uns niemand im Haus. Das System muss sich selbst heilen, sonst klingelt mein Telefon.' }
        ]
      }
    ]
  },
  {
    id: 'agri',
    level: 'hard',
    title: 'AgriLink',
    subtitle: 'Eine Plattform für Landwirtschaftsbetriebe',
    intro: 'Gründung, Geldgeber, Feldarbeit und Datenschutz an einem Tisch. Nicht alle wollen dasselbe, und nicht alle haben dieselbe Ahnung von der Praxis.',
    truth: { functional: 7, performance: 7, compatibility: 7, usability: 8, reliability: 7, security: 8, maintainability: 7, portability: 6 },
    why: {
      usability: 'Die Praxis entscheidet: Wer mit Handschuhen auf dem Traktor sitzt, bedient keine Experten-Dashboards. Schulungen ersetzen keine gute Bedienbarkeit.',
      security: 'Vertrauen und Einwilligung sind die Geschäftsgrundlage. Ohne sie gibt es keine Daten und keine Kundschaft, auch keinen Datenhandel.',
      reliability: 'Funklöcher sind Fakt: Offline-Fähigkeit zählt mehr als Cloud-Verfügbarkeit. Ein Cloud-Ausfall wäre verkraftbar, aber nicht egal.',
      performance: 'Das Datenvolumen der Sensoren ist gegeben und keine Frage der Priorität. Wer das nicht schluckt, hat keine aktuellen Karten.',
      functional: 'Das Expertendashboard ist der Preisgrund, aber nicht der Alltag der Nutzer im Feld. Wichtig, nicht der Kern.',
      compatibility: 'ISOBUS deckt das meiste ab. Spezialfälle muss man nicht alle bedienen, aber wichtige Marken schon.'
    },
    people: [
      {
        id: 'thiel', name: 'Frau Thiel', role: 'Gründerin', color: '#ffd23f',
        look: { skin: '#f3d0b0', hair: '#c0602a', hairStyle: 'bun', shirt: '#2a8a5a', outfit: 'shirt', iris: '#4a8a5a', extras: [] },
        statements: [
          { attr: 'functional', claim: 9, text: 'Unser Kern ist das Expertendashboard mit Ertragskarten, Bodenanalyse und Düngeplanung. Damit rechtfertigen wir unseren Preis.' },
          { attr: 'usability', claim: 4, text: 'Die Bedienung bringen wir den Landwirten schon bei, dafür machen wir ja Schulungen.' },
          { attr: 'reliability', claim: 3, text: 'Steht die Cloud mal einen Tag, ist das ärgerlich. Der Landwirt schaut halt morgen wieder rein.' }
        ]
      },
      {
        id: 'bauer', name: 'Herr Bauer', role: 'Landwirt', color: '#9dff7a',
        look: { skin: '#d9a77c', hair: '#8a6a3a', hairStyle: 'short', shirt: '#a0402a', outfit: 'shirt', iris: '#4a7a9a', extras: ['beard'] },
        statements: [
          { attr: 'usability', claim: 10, text: 'Ich sitze mit Handschuhen auf dem Traktor. Brauche ich zum Antippen mehr als zwei Versuche, schalte ich das Ding aus.' },
          { attr: 'compatibility', claim: 9, text: 'Mein Traktor ist ein Fendt, die Sämaschine von Amazone, die Sensoren sind vom Nachbarn. Reden die nicht miteinander, brauche ich keine App.' }
        ]
      },
      {
        id: 'sommer', name: 'Herr Sommer', role: 'Investor', color: '#8fb8ff',
        look: { skin: '#f0c8a0', hair: '#c9c9c9', hairStyle: 'short', shirt: '#1a2a4a', outfit: 'suit', iris: '#4a6a9c', extras: ['tie'] },
        statements: [
          { attr: 'security', claim: 4, text: 'Daten sind das neue Öl. Wir wollen sie später anonymisiert an Düngerhersteller verkaufen. Zu viele Hürden bremsen das nur.' },
          { attr: 'performance', claim: 3, text: 'Wir sind ein Start-up. Geschwindigkeit optimieren wir, wenn wir Geld verdienen.' },
          { attr: 'portability', claim: 7, text: 'Nach Polen und Brasilien soll es gehen: andere Maschinen, andere Gesetze. Das ist die Wachstumsgeschichte für die nächste Runde.' }
        ]
      },
      {
        id: 'nowak', name: 'Frau Nowak', role: 'Datenschutz', color: '#ff9ec7',
        look: { skin: '#e8b890', hair: '#1c1c1c', hairStyle: 'long', shirt: '#8a3a5a', outfit: 'shirt', iris: '#3a2a1a', extras: ['glasses'] },
        statements: [
          { attr: 'security', claim: 10, text: 'Betriebsdaten von Höfen sind Geschäftsgeheimnisse. Ohne Einwilligung geht nichts raus. Verlieren wir das Vertrauen, ist die Firma weg.' }
        ]
      },
      {
        id: 'lea', name: 'Lea', role: 'Sensorik-Entwicklung', color: '#d6a6ff',
        look: { skin: '#c99468', hair: '#3a1a14', hairStyle: 'curly', shirt: '#3a3a8a', outfit: 'tshirt', iris: '#3a2a1a', extras: ['glasses'] },
        statements: [
          { attr: 'performance', claim: 8, text: 'Fünftausend Sensoren funken im Sekundentakt. Die Daten müssen wir ohne Rückstau schlucken, sonst sind die Karten veraltet.' },
          { attr: 'reliability', claim: 8, text: 'Auf dem Feld gibt es Funklöcher. Die App muss offline weiterarbeiten und später abgleichen. Das ist wichtiger als Cloud-Verfügbarkeit.' },
          { attr: 'maintainability', text: 'Jeden Monat kommt ein neuer Sensortyp. Kostet jeder Typ eine Woche Anpassung, kommen wir nicht hinterher.' },
          { attr: 'compatibility', claim: 6, text: 'ISOBUS decken wir ab, das sind rund neunzig Prozent der Maschinen. Für den Rest bauen wir nicht jeden Spezialadapter.' }
        ]
      }
    ]
  }
];

/* Wie sich Stimmungen aus dem Fehler (Abstand zwischen deiner Zahl und der gemeinten) ergeben. */
QW.JUDGE = {
  attrPoints: function (diff) { return diff === 0 ? 100 : diff === 1 ? 80 : diff === 2 ? 55 : diff === 3 ? 30 : 0; },
  mood: function (meanDiff) { return meanDiff <= 1 ? 'happy' : meanDiff <= 2.5 ? 'meh' : 'angry'; }
};

QW.REACTIONS = {
  happy: ['Genau so sehe ich das auch!', 'Der Architekt hat zugehört. Gut!', 'Passt. Damit kann ich arbeiten.', 'Endlich versteht uns mal jemand.'],
  meh:   ['Na ja, so ungefähr.', 'Hmm. Nicht ganz, was ich meinte.', 'Geht so. Da war mehr drin.', 'Ich hätte es etwas anders gewichtet.'],
  angry: ['Wir haben doch klar gesagt, was wir wollen!', 'Hast du überhaupt zugehört?!', 'Das geht an unseren Anforderungen vorbei!', 'So wird das nichts. Gar nichts!']
};

QW.RANKS = [
  { min: 90, title: 'Principal Architect' },
  { min: 75, title: 'Senior Architect' },
  { min: 55, title: 'Architekt' },
  { min: 35, title: 'Junior Architect' },
  { min: 0,  title: 'Praktikant mit Whiteboard-Marker' }
];
