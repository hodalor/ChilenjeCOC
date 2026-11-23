/**
 * Reads the volunteer-edited hymn files, repairs broken quoting,
 * and separates choruses from stanzas.
 *
 * Usage: node scripts/normalize-hymns.js
 */
const fs = require('fs');
const path = require('path');
const {dedupeHymns} = require('./dedupe-hymns');

const ROOT = path.join(__dirname, '..');

const SOURCES = [
  {
    file: 'scr/db/SONGS/bemba-hymns.js',
    out: 'scr/db/bemba-hymns.js',
    varName: 'bembaHymns',
    comment: 'Bemba hymns',
  },
  {
    file: 'scr/db/SONGS/chewa revised-hymns.js',
    out: 'scr/db/chewa-hymns.js',
    varName: 'chewaHymns',
    comment: 'Chewa hymns',
  },
  {
    file: 'scr/db/SONGS/ENGLISH 111.js',
    out: 'scr/db/english-hymns.js',
    varName: 'englishHymns',
    comment: 'English hymns',
  },
  {
    file: 'scr/db/SONGS/TONGA.js',
    out: 'scr/db/tonga-hymns.js',
    varName: 'tongaHymns',
    comment: 'Tonga hymns',
  },
];

const LABEL_NAMES =
  'chorus|refrain|ciindululo|cilimbwe|icilimbwe|icilimbo|kololo|korasi|khorasi|khorase';
const LABEL_ONLY = new RegExp(
  `^(?:${LABEL_NAMES})\\s*\\d*\\s*[:;.\\-]?\\s*$`,
  'i',
);
const LABEL_PREFIX = new RegExp(
  `^(${LABEL_NAMES})\\s*(\\d*)\\s*[:;.\\-]\\s+(.+)$`,
  'i',
);

function parseHymnNo(raw) {
  const cleaned = String(raw).replace(/,$/, '').trim();
  if (/^\d+$/.test(cleaned)) {
    return Number(cleaned);
  }
  return cleaned;
}

function unescapeBasic(text) {
  return text
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, ' ')
    .replace(/\\"/g, '"')
    .replace(/\\'/g, "'");
}

function extractLyricPieces(rawLine) {
  let s = rawLine.replace(/\u000b/g, '\n').replace(/\u00a0/g, ' ').trim();
  if (!s) {
    return [];
  }
  if (/^[}\]],?$/.test(s)) {
    return [];
  }
  if (/^["']?stanzers["']?\s*:/.test(s) || /^["']?lines["']?\s*:/.test(s)) {
    return [];
  }
  if (s.startsWith('"') || s.startsWith("'")) {
    s = s.slice(1);
  }
  s = s.replace(/["']\s*,?\s*$/, '');
  s = unescapeBasic(s);
  s = s.replace(/[\u0000-\u0008\u000c\u000e-\u001f]/g, '\n');
  return s
    .split('\n')
    .map(part => part.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
}

function parseHymns(text) {
  const lines = text.split(/\r?\n/);
  const hymns = [];
  let hymn = null;
  let mode = null;
  let currentStanza = null;

  function finishStanza() {
    if (currentStanza) {
      hymn.stanzers.push(currentStanza);
      currentStanza = null;
    }
  }

  function finishHymn() {
    finishStanza();
    if (hymn) {
      hymns.push(hymn);
    }
    hymn = null;
    mode = null;
  }

  for (const rawLine of lines) {
    if (/"hymnNo"\s*:/.test(rawLine)) {
      finishHymn();
      const match = rawLine.match(/"hymnNo"\s*:\s*([^,\s]+)/);
      hymn = {
        hymnNo: match ? parseHymnNo(match[1]) : hymns.length + 1,
        title: '',
        creator: 'Unknown',
        chorus: null,
        stanzers: [],
      };
      mode = 'hymn';
      continue;
    }
    if (!hymn) {
      continue;
    }

    const titleMatch =
      rawLine.match(/"title"\s*:\s*"(.*)"\s*,?\s*$/) ||
      rawLine.match(/"title"\s*:\s*"(.*)$/) ||
      rawLine.match(/"title"\s*:\s*'(.*)'\s*,?\s*$/);
    if (titleMatch && mode !== 'stanza-lines' && mode !== 'chorus') {
      hymn.title = unescapeBasic(titleMatch[1]).replace(/\s+/g, ' ').trim();
      continue;
    }

    const creatorMatch = rawLine.match(/"creator"\s*:\s*"(.*)"/);
    if (creatorMatch && mode !== 'stanza-lines' && mode !== 'chorus') {
      hymn.creator = unescapeBasic(creatorMatch[1]).trim() || 'Unknown';
      continue;
    }

    if (/"chorus"\s*:\s*null/.test(rawLine)) {
      hymn.chorus = null;
      mode = 'hymn';
      continue;
    }
    if (/"chorus"\s*:\s*\[\s*\]/.test(rawLine)) {
      hymn.chorus = [];
      mode = 'hymn';
      continue;
    }
    if (/"chorus"\s*:\s*\[/.test(rawLine)) {
      hymn.chorus = [];
      mode = 'chorus';
      continue;
    }
    if (/"stanzers"\s*:/.test(rawLine)) {
      mode = 'stanzers';
      continue;
    }
    if (/"stanzer"\s*:/.test(rawLine)) {
      finishStanza();
      const number = rawLine.match(/"stanzer"\s*:\s*(\d+)/);
      currentStanza = {
        stanzer: number ? Number(number[1]) : hymn.stanzers.length + 1,
        lines: [],
      };
      mode = 'stanza';
      continue;
    }
    if (/"lines"\s*:\s*\[/.test(rawLine)) {
      if (currentStanza) {
        mode = 'stanza-lines';
      }
      continue;
    }
    if (/^\s*\]\s*,?\s*$/.test(rawLine)) {
      if (mode === 'chorus') {
        mode = 'hymn';
      } else if (mode === 'stanza-lines') {
        mode = 'stanza';
      }
      continue;
    }
    if (/^\s*\}\s*,?\s*$/.test(rawLine)) {
      if (mode === 'stanza' || mode === 'stanza-lines') {
        finishStanza();
        mode = 'stanzers';
      }
      continue;
    }

    if (mode === 'chorus') {
      hymn.chorus.push(...extractLyricPieces(rawLine));
    } else if (mode === 'stanza-lines' && currentStanza) {
      currentStanza.lines.push(...extractLyricPieces(rawLine));
    }
  }

  finishHymn();
  return hymns;
}

function cleanLine(line) {
  return line
    .replace(/(\p{Ll})(?=\p{Lu})/gu, '$1 ')
    .replace(/([.!?])(?=\p{Lu})/gu, '$1 ')
    .replace(/([,;:])(?=\p{Lu})/gu, '$1 ')
    .replace(/\s+/g, ' ')
    .trim();
}

function joinWrappedLines(lines) {
  const joined = [];
  lines.forEach(line => {
    const previous = joined[joined.length - 1];
    if (
      previous &&
      !/[.!?;:,)\]"']$/.test(previous) &&
      /^[\p{Ll}("']/u.test(line)
    ) {
      joined[joined.length - 1] = `${previous} ${line}`;
      return;
    }
    joined.push(line);
  });
  return joined;
}

function expandLongLines(lines) {
  const expanded = [];
  lines.forEach(line => {
    if (line.length < 110) {
      expanded.push(line);
      return;
    }
    const parts = line
      .split(/(?<=[.!;])\s+/)
      .map(part => part.trim())
      .filter(Boolean);
    if (parts.length > 1 && parts.every(part => part.length >= 12)) {
      expanded.push(...parts);
      return;
    }
    expanded.push(line);
  });
  return expanded;
}

function isNoiseLine(line) {
  if (!line) {
    return true;
  }
  if (/^[_\-=.*]{2,}$/.test(line)) {
    return true;
  }
  if (/^\(?\s*repeat\s*\)?\.?$/i.test(line)) {
    return true;
  }
  if (/^\(?\s*x\s*\d+\s*\)?$/i.test(line)) {
    return true;
  }
  return false;
}

function isHeadingLine(line, hymn) {
  const title = (hymn.title || '').replace(/\s+/g, ' ').trim().toLowerCase();
  const raw = line.replace(/\s+/g, ' ').trim();
  const numbered = raw.match(/^(\d+[a-zA-Z]?)\s+(.+)$/);
  if (!numbered || !title) {
    return false;
  }
  const rest = numbered[2].replace(/[.#]+$/g, '').trim().toLowerCase();
  return rest === title || title.startsWith(rest) || rest.startsWith(title);
}

function cleanLines(lines, hymn, dropHeadings) {
  const cleaned = [];
  lines.forEach((line, index) => {
    const next = cleanLine(line);
    if (isNoiseLine(next)) {
      return;
    }
    if (dropHeadings && index === 0 && isHeadingLine(next, hymn)) {
      return;
    }
    if (/^\d+$/.test(next) && next.length < 4) {
      return;
    }
    cleaned.push(next);
  });
  return joinWrappedLines(expandLongLines(cleaned));
}

function stripLeadingTitle(line, title) {
  const caps = line.match(/^([A-Z][A-Z'’ ]{5,}?)(?=[A-Z][a-z])/);
  if (!caps) {
    return line;
  }
  const heading = caps[1].trim();
  const rest = line.slice(caps[1].length).trim();
  const titleHasHeading = title.toLowerCase().includes(heading.toLowerCase());
  const headingStart = heading.toLowerCase().slice(0, Math.min(8, heading.length));
  if (titleHasHeading && rest.toLowerCase().startsWith(headingStart)) {
    return rest;
  }
  return line;
}

function joinAdjacentRepeats(repeatedClusters) {
  if (!repeatedClusters || repeatedClusters.length < 2) {
    return null;
  }
  const ordered = repeatedClusters
    .map(cluster => ({
      cluster,
      positions: cluster.items.map(item => item.index).sort((a, b) => a - b),
    }))
    .sort((a, b) => a.positions[0] - b.positions[0]);
  const count = ordered[0].positions.length;
  if (!ordered.every(item => item.positions.length === count)) {
    return null;
  }
  if (ordered[0].positions[0] === 0) {
    return null;
  }
  for (let occurrence = 0; occurrence < count; occurrence += 1) {
    for (let index = 1; index < ordered.length; index += 1) {
      const expected = ordered[0].positions[occurrence] + index;
      if (ordered[index].positions[occurrence] !== expected) {
        return null;
      }
    }
  }
  const lines = [];
  ordered.forEach(item => {
    lines.push(...bestLines(item.cluster.items));
  });
  return {
    lines,
    clusters: ordered.map(item => item.cluster),
  };
}

function labelInfo(line) {
  const text = cleanLine(line);
  if (LABEL_ONLY.test(text)) {
    const name = text.replace(/[:;.\-\s]+\d*$/i, '').trim();
    const number = text.match(/\d+/);
    return {
      kind: 'only',
      name: name || 'Chorus',
      number: number ? number[0] : '',
    };
  }
  const prefixed = text.match(LABEL_PREFIX);
  if (prefixed) {
    return {
      kind: 'prefix',
      name: prefixed[1],
      number: prefixed[2] || '',
      rest: cleanLine(prefixed[3]),
    };
  }
  return null;
}

function chorusLabelText(info) {
  const base = /^ciindululo$/i.test(info.name) ? 'Ciindululo' : 'Chorus';
  return info.number ? `${base} ${info.number}` : base;
}

function splitBlocks(lines) {
  const blocks = [];
  let current = {type: 'stanza', lines: [], label: null};

  function pushCurrent() {
    if (current.lines.length) {
      blocks.push(current);
    }
  }

  lines.forEach(line => {
    const info = labelInfo(line);
    if (info && info.kind === 'only') {
      pushCurrent();
      current = {type: 'chorus', lines: [], label: chorusLabelText(info)};
      return;
    }
    if (info && info.kind === 'prefix') {
      pushCurrent();
      current = {
        type: 'chorus',
        lines: info.rest ? [info.rest] : [],
        label: chorusLabelText(info),
      };
      return;
    }
    current.lines.push(line);
  });
  pushCurrent();
  return blocks;
}

function normalizeKey(lines) {
  return lines
    .map(line =>
      line
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s]/gu, '')
        .replace(/\s+/g, ' ')
        .trim(),
    )
    .filter(Boolean)
    .join('\n');
}

function levenshtein(a, b) {
  if (a === b) {
    return 0;
  }
  if (!a.length) {
    return b.length;
  }
  if (!b.length) {
    return a.length;
  }
  let prev = new Array(b.length + 1);
  let curr = new Array(b.length + 1);
  for (let j = 0; j <= b.length; j += 1) {
    prev[j] = j;
  }
  for (let i = 1; i <= a.length; i += 1) {
    curr[0] = i;
    const ca = a.charCodeAt(i - 1);
    for (let j = 1; j <= b.length; j += 1) {
      const cost = ca === b.charCodeAt(j - 1) ? 0 : 1;
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[b.length];
}

function similarity(a, b) {
  if (a === b) {
    return 1;
  }
  const maxLen = Math.max(a.length, b.length);
  if (!maxLen) {
    return 1;
  }
  if (Math.abs(a.length - b.length) / maxLen > 0.35) {
    return 0;
  }
  return 1 - levenshtein(a, b) / maxLen;
}

function clusterBySimilarity(items, threshold) {
  const clusters = [];
  items.forEach(item => {
    let best = null;
    let bestScore = threshold;
    clusters.forEach(cluster => {
      const score = similarity(item.key, cluster.key);
      if (score >= bestScore) {
        best = cluster;
        bestScore = score;
      }
    });
    if (!best) {
      clusters.push({key: item.key, items: [item]});
      return;
    }
    best.items.push(item);
    if (item.key.length > best.key.length) {
      best.key = item.key;
    }
  });
  return clusters;
}

function bestLines(items) {
  return items
    .map(item => item.lines)
    .sort((a, b) => b.join('\n').length - a.join('\n').length)[0];
}

function renumberStanzas(blocks) {
  let number = 1;
  return blocks.map(block => {
    if (block.type === 'chorus') {
      return {
        stanzer: 0,
        lines: block.lines,
        type: 'chorus',
        label: block.label || 'Chorus',
      };
    }
    const stanza = {stanzer: number, lines: block.lines};
    number += 1;
    return stanza;
  });
}

function matchesVerseOpening(lines, verses) {
  const key = normalizeKey(lines);
  if (key.length < 20) {
    return false;
  }
  return verses.some(verse => {
    if (verse.lines.length <= lines.length) {
      return false;
    }
    const opening = verse.lines.slice(0, lines.length);
    return similarity(normalizeKey(opening), key) >= 0.9;
  });
}

function trimChorusAgainstVerses(chorusLines, verses) {
  let lines = chorusLines.slice();
  let guard = 0;
  while (lines.length >= 3 && guard < 6) {
    guard += 1;
    let trimmed = false;
    for (let len = lines.length - 1; len >= 2; len -= 1) {
      const suffix = lines.slice(lines.length - len);
      if (matchesVerseOpening(suffix, verses)) {
        lines = lines.slice(0, lines.length - len);
        trimmed = true;
        break;
      }
      const prefix = lines.slice(0, len);
      if (matchesVerseOpening(prefix, verses)) {
        lines = lines.slice(len);
        trimmed = true;
        break;
      }
    }
    if (!trimmed) {
      break;
    }
  }
  return lines;
}

function collapseConsecutiveDuplicates(blocks) {
  const result = [];
  blocks.forEach(block => {
    const previous = result[result.length - 1];
    if (
      previous &&
      previous.type === block.type &&
      normalizeKey(previous.lines) === normalizeKey(block.lines)
    ) {
      return;
    }
    result.push(block);
  });
  return result;
}

function stripTrailingChorus(lines, chorusLines) {
  if (!chorusLines || chorusLines.length === 0) {
    return lines;
  }
  if (lines.length <= chorusLines.length) {
    return lines;
  }
  const tail = lines.slice(-chorusLines.length);
  const score = similarity(normalizeKey(tail), normalizeKey(chorusLines));
  if (score >= 0.92 && normalizeKey(chorusLines).length >= 15) {
    return lines.slice(0, -chorusLines.length);
  }
  return lines;
}

function titleCleanup(title) {
  return title
    .replace(/^[\s.\-#]+/, '')
    .replace(/\s+/g, ' ')
    .replace(/\(\s*\)/g, '')
    .trim();
}

function normalizeHymn(raw) {
  const hymn = {
    hymnNo: raw.hymnNo,
    title: titleCleanup(raw.title || `Hymn ${raw.hymnNo}`),
    creator: raw.creator || 'Unknown',
    chorus: null,
    stanzers: [],
  };

  const existingChorus = cleanLines(raw.chorus || [], hymn, false).filter(
    line => !labelInfo(line) || labelInfo(line).kind === 'prefix',
  );
  const cleanedExisting = [];
  existingChorus.forEach(line => {
    const info = labelInfo(line);
    if (info && info.kind === 'prefix' && info.rest) {
      cleanedExisting.push(info.rest);
      return;
    }
    if (!info) {
      cleanedExisting.push(line);
    }
  });

  let blocks = [];
  raw.stanzers.forEach(stanza => {
    const lines = cleanLines(stanza.lines || [], hymn, true);
    splitBlocks(lines).forEach(block => {
      if (block.lines.length) {
        blocks.push(block);
      }
    });
  });

  if (blocks[0] && blocks[0].type !== 'chorus' && blocks[0].lines[0]) {
    blocks[0].lines[0] = stripLeadingTitle(blocks[0].lines[0], hymn.title);
    blocks[0].lines = blocks[0].lines.filter(Boolean);
    if (!blocks[0].lines.length) {
      blocks.shift();
    }
  }

  const labeledChorus = blocks.filter(block => block.type === 'chorus');
  const labeledClusters = clusterBySimilarity(
    labeledChorus.map((block, index) => ({
      key: normalizeKey(block.lines),
      lines: block.lines,
      label: block.label,
      index,
    })),
    0.9,
  ).filter(cluster => cluster.key.length > 0);

  let primaryChorus = null;
  if (labeledClusters.length === 1) {
    primaryChorus = bestLines(labeledClusters[0].items);
    const primaryKey = normalizeKey(primaryChorus);
    blocks = blocks.filter(block => {
      if (block.type !== 'chorus') {
        return true;
      }
      return similarity(normalizeKey(block.lines), primaryKey) < 0.9;
    });
  }

  const stanzaBlocks = blocks.filter(block => block.type !== 'chorus');
  const stanzaClusters = clusterBySimilarity(
    stanzaBlocks.map((block, index) => ({
      key: normalizeKey(block.lines),
      lines: block.lines,
      index,
      block,
    })),
    0.92,
  );

  const repeated = stanzaClusters.filter(cluster => {
    if (cluster.items.length < 2) {
      return false;
    }
    if (cluster.key.length < 15) {
      return false;
    }
    const positions = cluster.items.map(item => item.index);
    if (positions.includes(0)) {
      return false;
    }
    return positions.some((position, index) => {
      return index > 0 && position - positions[index - 1] > 1;
    });
  });

  function removeMatchingStanzas(lines) {
    const key = normalizeKey(lines);
    blocks = blocks.filter(block => {
      if (block.type === 'chorus') {
        return true;
      }
      return similarity(normalizeKey(block.lines), key) < 0.92;
    });
  }

  function removeCluster(cluster) {
    removeMatchingStanzas(bestLines(cluster.items));
  }

  const joined = joinAdjacentRepeats(repeated);
  if (!primaryChorus && joined) {
    primaryChorus = joined.lines;
    joined.clusters.forEach(removeCluster);
  } else if (!primaryChorus && repeated.length === 1) {
    primaryChorus = bestLines(repeated[0].items);
    removeMatchingStanzas(primaryChorus);
  } else if (!primaryChorus && repeated.length > 1) {
    const sorted = repeated.slice().sort((a, b) => b.items.length - a.items.length);
    if (sorted[0].items.length > sorted[1].items.length) {
      primaryChorus = bestLines(sorted[0].items);
      removeMatchingStanzas(primaryChorus);
    }
  } else if (primaryChorus && repeated.length) {
    const primaryKey = normalizeKey(primaryChorus);
    repeated.forEach(cluster => {
      if (similarity(cluster.key, primaryKey) >= 0.9) {
        removeCluster(cluster);
      }
    });
    if (joined && similarity(normalizeKey(joined.lines), primaryKey) < 0.9) {
      primaryChorus = primaryChorus.concat(joined.lines);
      joined.clusters.forEach(removeCluster);
    } else {
      const extras = repeated.filter(
        cluster => similarity(cluster.key, primaryKey) < 0.9,
      );
      if (extras.length === 1) {
        const extraLines = bestLines(extras[0].items);
        primaryChorus = primaryChorus.concat(extraLines);
        removeMatchingStanzas(extraLines);
      }
    }
  }

  if (!primaryChorus && labeledClusters.length < 2 && cleanedExisting.length) {
    primaryChorus = cleanedExisting;
  } else if (primaryChorus && cleanedExisting.length) {
    const score = similarity(
      normalizeKey(primaryChorus),
      normalizeKey(cleanedExisting),
    );
    if (score >= 0.84 && cleanedExisting.join('\n').length > primaryChorus.join('\n').length) {
      primaryChorus = cleanedExisting;
    }
  }

  if (primaryChorus) {
    const verses = blocks.filter(block => block.type !== 'chorus');
    primaryChorus = trimChorusAgainstVerses(primaryChorus, verses);
  }

  if (primaryChorus) {
    blocks = blocks.map(block => {
      if (block.type === 'chorus') {
        return block;
      }
      return {
        ...block,
        lines: stripTrailingChorus(block.lines, primaryChorus),
      };
    }).filter(block => block.lines.length);
  }

  blocks = collapseConsecutiveDuplicates(blocks);
  hymn.chorus = primaryChorus && primaryChorus.length ? primaryChorus : null;
  hymn.stanzers = renumberStanzas(blocks);

  if (!hymn.stanzers.length && hymn.chorus) {
    hymn.stanzers = [{stanzer: 1, lines: hymn.chorus}];
    hymn.chorus = null;
  }

  return hymn;
}

function serialize(varName, comment, hymns) {
  const payload = hymns.map(hymn => {
    const record = {
      hymnNo: hymn.hymnNo,
      title: hymn.title,
      creator: hymn.creator || 'Unknown',
      chorus: hymn.chorus,
      stanzers: hymn.stanzers.map(stanza => {
        const item = {
          stanzer: stanza.stanzer,
          lines: stanza.lines,
        };
        if (stanza.type === 'chorus') {
          item.type = 'chorus';
          item.label = stanza.label || 'Chorus';
        }
        return item;
      }),
    };
    return record;
  });
  return `// ${comment}\nexport const ${varName} = ${JSON.stringify(payload, null, 2)};\n`;
}

function summarize(name, rawHymns, hymns) {
  const withChorus = hymns.filter(hymn => hymn.chorus && hymn.chorus.length).length;
  const inline = hymns.filter(hymn =>
    hymn.stanzers.some(stanza => stanza.type === 'chorus'),
  ).length;
  const empty = hymns.filter(
    hymn => !hymn.stanzers.length || hymn.stanzers.every(stanza => !stanza.lines.length),
  ).length;
  const rawChorus = rawHymns.filter(hymn => hymn.chorus && hymn.chorus.length).length;
  console.log(
    `${name}: parsed ${rawHymns.length}, written ${hymns.length}, chorus ${rawChorus} -> ${withChorus}, extra inline choruses ${inline}, empty ${empty}`,
  );
}

function main() {
  SOURCES.forEach(source => {
    const absolute = path.join(ROOT, source.file);
    const text = fs.readFileSync(absolute, 'utf8');
    const rawHymns = parseHymns(text);
    const normalized = rawHymns.map(normalizeHymn);
    const hymns = dedupeHymns(normalized, source.varName).hymns;
    const output = serialize(source.varName, source.comment, hymns);
    fs.writeFileSync(path.join(ROOT, source.out), output);
    summarize(source.varName, rawHymns, hymns);
  });
}

main();
