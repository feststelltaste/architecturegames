/* Daten für den Qualitäts-Workshop: Qualitätsmerkmale (ISO/IEC 25010) und Fälle. */
window.QW = window.QW || {};

/* Die 8 Produktqualitätsmerkmale nach ISO/IEC 25010:2011, im Uhrzeigersinn ab 12 Uhr. */
QW.ATTRS = [
  { id: 'functional',      name: 'Funktionale Eignung',  lines: ['Funktionale', 'Eignung'] },
  { id: 'performance',     name: 'Performance-Effizienz', lines: ['Performance-', 'Effizienz'] },
  { id: 'compatibility',   name: 'Kompatibilität',       lines: ['Kompatibilität'] },
  { id: 'usability',       name: 'Benutzbarkeit',        lines: ['Benutzbarkeit'] },
  { id: 'reliability',     name: 'Zuverlässigkeit',      lines: ['Zuverlässigkeit'] },
  { id: 'security',        name: 'Sicherheit',           lines: ['Sicherheit'] },
  { id: 'maintainability', name: 'Wartbarkeit',          lines: ['Wartbarkeit'] },
  { id: 'portability',     name: 'Übertragbarkeit',      lines: ['Übertragbarkeit'] }
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
  { id: 'medium', name: 'Mittel',  people: '4 Personen', blurb: 'Aussagen sind vager, Merkmale werden mehrfach genannt.', available: false },
  { id: 'hard',   name: 'Schwer',  people: '5 Personen', blurb: 'Widersprüche, Politik und versteckte Anforderungen.', available: false }
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
