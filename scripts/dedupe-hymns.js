/**
 * One hymn number, one song. Drops repeated copies, keeps the book number,
 * and separates chorus supplements that were stored under the same number.
 *
 * Usage:
 *   node scripts/dedupe-hymns.js
 *   node scripts/dedupe-hymns.js --write
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');

const FILES = [
  ['English', 'scr/db/english-hymns.js', 'englishHymns', 'English hymns'],
  ['Bemba', 'scr/db/bemba-hymns.js', 'bembaHymns', 'Bemba hymns'],
  ['Chewa', 'scr/db/chewa-hymns.js', 'chewaHymns', 'Chewa hymns'],
  ['Tonga', 'scr/db/tonga-hymns.js', 'tongaHymns', 'Tonga hymns'],
  ['Tumbuka', 'scr/db/tumbuka-hymns.js', 'tumbukaHymns', 'Tumbuka hymns'],
  ['Zulu', 'scr/db/zulu-hymns.js', 'zuluHymns', 'Zulu hymns'],
];

const MOJIBAKE = [
  ['\u0393\u00c7\u00d6', "'"],
  ['\u0393\u00c7\u00a3', '"'],
  ['\u0393\u00c7\u00a5', '"'],
  ['\u0393\u00c7\u00f4', '-'],
  ['\u0393\u00c7\u00f6', '-'],
  ['\u0393\u00c7\u00aa', '...'],
  ['\u00e2\u20ac\u2122', "'"],
  ['\u00e2\u20ac\u0153', '"'],
  ['\u00e2\u20ac\u009d', '"'],
  ['\u00e2\u20ac\u201c', '-'],
  ['\u00e2\u20ac\u201d', '-'],
  ['\u00e2\u20ac\u00a6', '...'],
];

function loadHymns(file) {
  let text = fs.readFileSync(path.join(ROOT, file), 'utf8');
  text = text.replace(/export const \w+ = /, 'module.exports = ');
  const module = {exports: {}};
  vm.runInNewContext(text, {module, exports: module.exports});
  return module.exports;
}

function cleanText(value) {
  let text = String(value ?? '');
  MOJIBAKE.forEach(([bad, good]) => {
    if (text.includes(bad)) {
      text = text.split(bad).join(good);
    }
  });
  text = text
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, ' ')
    .replace(/\u00a0/g, ' ')
    .replace(/\\?"\s*],?\s*$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (/^[_\-.=]{3,}$/.test(text) || /^\d+$/.test(text)) {
    return '';
  }
  return text;
}

function cleanTitle(title, hymnNo) {
  let text = cleanText(title).replace(/\s*\(2\)\s*$/i, '').trim();
  const number = String(hymnNo ?? '').match(/^(\d+)/);
  if (number) {
    const pattern = new RegExp(`^${number[1]}\\s+(?=[A-Za-z\\u00c0-\\u024f])`, 'i');
    text = text.replace(pattern, '').trim();
  }
  return text;
}

function isBadTitle(title) {
  const text = String(title || '').trim();
  if (text.length < 2 || /^untitled$/i.test(text)) {
    return true;
  }
  if (/^[,.'"\-_\s]+$/.test(text)) {
    return true;
  }
  return /^hymn\s*\d*$/i.test(text);
}

function titleFromLyric(line) {
  const lines = Array.isArray(line) ? line : [line];
  for (const entry of lines) {
    let text = cleanText(entry).replace(/^\d+\s*[.)-]?\s*/, '').trim();
    if (!text || /^\d+$/.test(text)) {
      continue;
    }
    if (text.length > 64) {
      text = `${text.slice(0, 61).replace(/\s+\S*$/, '').trim()}...`;
    }
    return text;
  }
  return '';
}

function cleanHymn(hymn) {
  const hymnNo = hymn.hymnNo;
  const chorus = Array.isArray(hymn.chorus)
    ? hymn.chorus.map(cleanText).filter(Boolean)
    : null;
  const stanzers = (hymn.stanzers || [])
    .map(stanza => ({
      ...stanza,
      lines: (stanza.lines || []).map(cleanText).filter(Boolean),
    }))
    .filter(stanza => stanza.lines.length);
  let title = cleanTitle(hymn.title, hymnNo);
  if (isBadTitle(title)) {
    const firstLines = lyricLines({chorus, stanzers});
    title = titleFromLyric(firstLines) || title || 'Untitled';
  }
  return {
    hymnNo,
    title,
    creator: cleanText(hymn.creator) || 'Unknown',
    chorus: chorus && chorus.length ? chorus : null,
    stanzers,
  };
}

function lyricLines(hymn) {
  const lines = [];
  if (Array.isArray(hymn.chorus)) {
    lines.push(...hymn.chorus);
  }
  (hymn.stanzers || []).forEach(stanza => {
    lines.push(...(stanza.lines || []));
  });
  return lines.map(line => String(line || '').trim()).filter(Boolean);
}

function fold(value) {
  return cleanText(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function contentKey(hymn) {
  return lyricLines(hymn).map(fold).filter(Boolean).join('\n');
}

function wordSet(key) {
  return new Set(String(key || '').split(' ').filter(word => word.length > 1));
}

function jaccard(a, b) {
  const left = wordSet(a);
  const right = wordSet(b);
  if (!left.size && !right.size) {
    return 1;
  }
  let shared = 0;
  left.forEach(word => {
    if (right.has(word)) {
      shared += 1;
    }
  });
  return shared / (left.size + right.size - shared || 1);
}

function canonId(value) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  const text = String(value ?? '').trim();
  if (/^\d+$/.test(text)) {
    return Number(text);
  }
  const match = text.match(/^(\d+)([a-z]+)$/i);
  if (match) {
    return `${Number(match[1])}${match[2].toUpperCase()}`;
  }
  return text;
}

function idRank(id) {
  const match = String(id).match(/^(\d+)(.*)$/);
  if (!match) {
    return [9, Number.MAX_SAFE_INTEGER, String(id)];
  }
  return [match[2] ? 1 : 0, Number(match[1]), match[2]];
}

function lowestId(ids) {
  return [...ids].sort((a, b) => {
    const left = idRank(a);
    const right = idRank(b);
    for (let index = 0; index < 3; index += 1) {
      if (left[index] < right[index]) {
        return -1;
      }
      if (left[index] > right[index]) {
        return 1;
      }
    }
    return 0;
  })[0];
}

function richness(hymn) {
  return lyricLines(hymn).join('\n').length;
}

function isChorusEntry(hymn) {
  return /^\s*c\s*[.\-:]/i.test(String(hymn.title || ''));
}

class UnionFind {
  constructor(size) {
    this.parent = Array.from({length: size}, (_, index) => index);
  }

  find(index) {
    let current = index;
    while (this.parent[current] !== current) {
      this.parent[current] = this.parent[this.parent[current]];
      current = this.parent[current];
    }
    return current;
  }

  union(left, right) {
    const a = this.find(left);
    const b = this.find(right);
    if (a !== b) {
      this.parent[b] = a;
    }
  }
}

function shouldMerge(left, right, reason) {
  if (!left.key || !right.key) {
    return false;
  }
  if (left.key === right.key) {
    return true;
  }
  const score = jaccard(left.key, right.key);
  const words = Math.min(wordSet(left.key).size, wordSet(right.key).size);
  if (reason === 'number') {
    const leftTitle = left.titleKey;
    const rightTitle = right.titleKey;
    const titleClose =
      leftTitle.length > 6 &&
      rightTitle.length > 6 &&
      (leftTitle === rightTitle ||
        leftTitle.includes(rightTitle) ||
        rightTitle.includes(leftTitle));
    if (titleClose && score >= 0.62 && words >= 6) {
      return true;
    }
    return score >= 0.9 && words >= 6;
  }
  if (reason === 'title') {
    return score >= 0.78 && words >= 8;
  }
  return false;
}

function suggestGap(laterIndex, hymns, taken, ownNumber) {
  let previous = null;
  for (let index = laterIndex - 1; index >= 0; index -= 1) {
    if (typeof hymns[index].hymnNo === 'number') {
      previous = hymns[index].hymnNo;
      break;
    }
  }
  // Only fill a hole when this copy sits out of order, for example 226 placed after 228.
  if (ownNumber == null || previous == null || ownNumber >= previous) {
    return null;
  }
  let next = null;
  for (let index = laterIndex + 1; index < hymns.length; index += 1) {
    if (typeof hymns[index].hymnNo === 'number') {
      next = hymns[index].hymnNo;
      break;
    }
  }
  if (previous == null || next == null || next <= previous + 1) {
    return null;
  }
  for (let gap = previous + 1; gap < next; gap += 1) {
    if (!taken.has(gap)) {
      return gap;
    }
  }
  return null;
}

function freeSuffix(number, taken, preferred) {
  const letters = preferred === 'C' ? ['C', 'B', 'D', 'E'] : ['B', 'D', 'E', 'F'];
  for (const letter of letters) {
    const id = `${number}${letter}`;
    if (!taken.has(id)) {
      return id;
    }
  }
  return `${number}X`;
}

function dedupeHymns(input, label = 'Hymns') {
  const report = {
    label,
    before: input.length,
    droppedInvalid: [],
    merged: [],
    renumbered: [],
    retitled: [],
  };

  const hymns = [];
  input.forEach(raw => {
    const hymn = cleanHymn(raw);
    if (typeof hymn.hymnNo === 'number' && hymn.hymnNo > 2000) {
      report.droppedInvalid.push({no: hymn.hymnNo, title: hymn.title});
      return;
    }
    if (!lyricLines(hymn).length) {
      report.droppedInvalid.push({no: hymn.hymnNo, title: hymn.title || '(empty)'});
      return;
    }
    hymns.push(hymn);
  });

  const records = hymns.map((hymn, index) => ({
    index,
    hymn,
    key: contentKey(hymn),
    titleKey: fold(hymn.title),
    id: canonId(hymn.hymnNo),
  }));

  const groups = new UnionFind(records.length);
  const byKey = new Map();
  const byTitle = new Map();
  const byNumber = new Map();

  records.forEach((record, index) => {
    if (record.key) {
      if (!byKey.has(record.key)) {
        byKey.set(record.key, []);
      }
      byKey.get(record.key).push(index);
    }
    if (record.titleKey.length > 3) {
      if (!byTitle.has(record.titleKey)) {
        byTitle.set(record.titleKey, []);
      }
      byTitle.get(record.titleKey).push(index);
    }
    if (!byNumber.has(record.id)) {
      byNumber.set(record.id, []);
    }
    byNumber.get(record.id).push(index);
  });

  function linkGroup(indexes, reason) {
    for (let left = 0; left < indexes.length; left += 1) {
      for (let right = left + 1; right < indexes.length; right += 1) {
        if (shouldMerge(records[indexes[left]], records[indexes[right]], reason)) {
          groups.union(indexes[left], indexes[right]);
        }
      }
    }
  }

  byKey.forEach(indexes => linkGroup(indexes, 'exact'));
  byTitle.forEach(indexes => linkGroup(indexes, 'title'));
  byNumber.forEach(indexes => linkGroup(indexes, 'number'));

  const clustered = new Map();
  records.forEach((record, index) => {
    const root = groups.find(index);
    if (!clustered.has(root)) {
      clustered.set(root, []);
    }
    clustered.get(root).push(record);
  });

  const clusters = [...clustered.values()].map(members => {
    const candidates = [...new Set(members.map(member => member.id))];
    const richest = members.slice().sort((a, b) => richness(b.hymn) - richness(a.hymn))[0];
    return {members, candidates, richest};
  });

  const usage = new Map();
  clusters.forEach(cluster => {
    cluster.candidates.forEach(id => {
      usage.set(id, (usage.get(id) || 0) + 1);
    });
  });

  const taken = new Set();
  clusters.forEach(cluster => {
    const exclusive = cluster.candidates.filter(id => usage.get(id) === 1);
    if (!exclusive.length) {
      return;
    }
    cluster.assigned = lowestId(exclusive);
    taken.add(cluster.assigned);
  });

  clusters
    .filter(cluster => cluster.assigned == null)
    .sort((a, b) => idRank(lowestId(a.candidates))[1] - idRank(lowestId(b.candidates))[1])
    .forEach(cluster => {
      const free = cluster.candidates
        .filter(id => !taken.has(id))
        .sort((a, b) => {
          const left = idRank(a);
          const right = idRank(b);
          for (let index = 0; index < 3; index += 1) {
            if (left[index] !== right[index]) {
              return left[index] < right[index] ? -1 : 1;
            }
          }
          return 0;
        });
      if (free.length) {
        cluster.assigned = free[0];
        taken.add(cluster.assigned);
      }
    });

  clusters
    .filter(cluster => cluster.assigned == null)
    .forEach(cluster => {
      const base = cluster.candidates.map(id => idRank(id)[1]).sort((a, b) => a - b)[0];
      const chorus = cluster.members.some(member => isChorusEntry(member.hymn));
      const otherChorusClaim = clusters.some(
        other =>
          other !== cluster &&
          other.assigned == null &&
          other.members.some(member => isChorusEntry(member.hymn)) &&
          other.candidates.some(id => idRank(id)[1] === base),
      );
      if (chorus && !otherChorusClaim) {
        const id = freeSuffix(base, taken, 'C');
        cluster.assigned = id;
        taken.add(id);
        report.renumbered.push({
          from: cluster.candidates.join(', '),
          to: id,
          title: cluster.richest.hymn.title,
          reason: 'chorus supplement',
        });
        return;
      }
      const later = Math.max(...cluster.members.map(member => member.index));
      const gap = suggestGap(later, hymns, taken, base);
      if (gap != null) {
        cluster.assigned = gap;
        taken.add(gap);
        report.renumbered.push({
          from: cluster.candidates.join(', '),
          to: gap,
          title: cluster.richest.hymn.title,
          reason: 'placed in the empty number beside it',
        });
        return;
      }
      const id = freeSuffix(base, taken);
      cluster.assigned = id;
      taken.add(id);
      report.renumbered.push({
        from: cluster.candidates.join(', '),
        to: id,
        title: cluster.richest.hymn.title,
        reason: 'same number held two different songs',
      });
    });

  const chosenTitle = cluster => {
    const scored = cluster.members
      .map(member => ({
        title: cleanTitle(member.hymn.title, cluster.assigned),
        matchesNumber: canonId(member.hymn.hymnNo) === cluster.assigned,
      }))
      .filter(item => !isBadTitle(item.title));
    scored.sort((a, b) => {
      if (a.matchesNumber !== b.matchesNumber) {
        return a.matchesNumber ? -1 : 1;
      }
      return b.title.length - a.title.length;
    });
    if (scored.length) {
      return scored[0].title;
    }
    return titleFromLyric(lyricLines(cluster.richest.hymn)) || 'Untitled';
  };

  let hymnsOut = clusters.map(cluster => {
    const source = cluster.richest.hymn;
    const duplicates = cluster.members.length - 1;
    if (duplicates > 0) {
      report.merged.push({
        kept: cluster.assigned,
        dropped: cluster.members
          .map(member => member.hymn.hymnNo)
          .filter(number => canonId(number) !== cluster.assigned),
        title: source.title,
        copies: cluster.members.length,
      });
    }
    return {
      hymnNo: cluster.assigned,
      title: chosenTitle(cluster),
      creator: source.creator || 'Unknown',
      chorus: source.chorus,
      stanzers: source.stanzers,
      _index: Math.min(...cluster.members.map(member => member.index)),
    };
  });

  const titleOwners = new Map();
  hymnsOut.forEach(hymn => {
    const key = fold(hymn.title);
    if (key.length < 8) {
      return;
    }
    if (!titleOwners.has(key)) {
      titleOwners.set(key, []);
    }
    titleOwners.get(key).push(hymn);
  });
  titleOwners.forEach(group => {
    if (group.length < 2) {
      return;
    }
    const owner = group.find(hymn => fold(lyricLines(hymn).join(' ')).includes(fold(hymn.title)));
    if (!owner) {
      return;
    }
    group.forEach(hymn => {
      if (hymn === owner) {
        return;
      }
      if (fold(lyricLines(hymn).join(' ')).includes(fold(hymn.title))) {
        return;
      }
      const replacement = titleFromLyric(lyricLines(hymn)[0]);
      if (!replacement || fold(replacement) === fold(hymn.title)) {
        return;
      }
      report.retitled.push({no: hymn.hymnNo, from: hymn.title, to: replacement});
      hymn.title = replacement;
    });
  });

  hymnsOut = hymnsOut
    .sort((a, b) => {
      const left = idRank(a.hymnNo);
      const right = idRank(b.hymnNo);
      if (left[1] !== right[1]) {
        return left[1] - right[1];
      }
      if (left[2] !== right[2]) {
        return left[2] < right[2] ? -1 : 1;
      }
      return a._index - b._index;
    })
    .map(hymn => {
      const copy = {...hymn};
      delete copy._index;
      return copy;
    });

  report.after = hymnsOut.length;
  report.hymns = hymnsOut;
  return report;
}

function serialize(varName, comment, hymns) {
  const payload = hymns.map(hymn => ({
    hymnNo: hymn.hymnNo,
    title: hymn.title,
    creator: hymn.creator || 'Unknown',
    chorus: hymn.chorus,
    stanzers: (hymn.stanzers || []).map(stanza => {
      const item = {stanzer: stanza.stanzer, lines: stanza.lines};
      if (stanza.type) {
        item.type = stanza.type;
      }
      if (stanza.label) {
        item.label = stanza.label;
      }
      return item;
    }),
  }));
  return `// ${comment}\nexport const ${varName} = ${JSON.stringify(payload, null, 2)};\n`;
}

function printReport(report) {
  console.log(
    `\n${report.label}: ${report.before} -> ${report.after} ` +
      `(merged groups ${report.merged.length}, renumbered ${report.renumbered.length}, ` +
      `retitled ${report.retitled.length}, removed ${report.droppedInvalid.length})`,
  );
  report.renumbered.forEach(item => {
    console.log(`  renumber ${item.from} -> ${item.to} (${item.reason}) ${item.title}`);
  });
  report.droppedInvalid.forEach(item => {
    console.log(`  removed invalid #${item.no} ${item.title}`);
  });
  if (report.retitled.length) {
    report.retitled.slice(0, 12).forEach(item => {
      console.log(`  title #${item.no}: "${item.from}" -> "${item.to}"`);
    });
    if (report.retitled.length > 12) {
      console.log(`  ... ${report.retitled.length - 12} more title fixes`);
    }
  }
}

function verify(report) {
  const numbers = new Map();
  const contents = new Map();
  report.hymns.forEach(hymn => {
    const id = String(canonId(hymn.hymnNo));
    if (!numbers.has(id)) {
      numbers.set(id, []);
    }
    numbers.get(id).push(hymn.title);
    const key = contentKey(hymn);
    if (!contents.has(key)) {
      contents.set(key, []);
    }
    contents.get(key).push(id);
  });
  const numberClashes = [...numbers.entries()].filter(([, titles]) => titles.length > 1);
  const contentClashes = [...contents.entries()].filter(([, ids]) => new Set(ids).size > 1);
  if (numberClashes.length || contentClashes.length) {
    console.log(`  VERIFY FAIL numbers ${numberClashes.length} contents ${contentClashes.length}`);
    numberClashes.slice(0, 8).forEach(([id, titles]) => {
      console.log(`    number ${id}: ${titles.join(' | ')}`);
    });
    contentClashes.slice(0, 8).forEach(([, ids]) => {
      console.log(`    content under ${ids.join(', ')}`);
    });
    return false;
  }
  const max = report.hymns.reduce((highest, hymn) => {
    const value = idRank(hymn.hymnNo)[1];
    return value > highest ? value : highest;
  }, 0);
  console.log(`  verified unique numbers ${numbers.size}, highest number ${max}`);
  return true;
}

function main() {
  const write = process.argv.includes('--write');
  let ok = true;
  FILES.forEach(([label, file, varName, comment]) => {
    const report = dedupeHymns(loadHymns(file), label);
    printReport(report);
    ok = verify(report) && ok;
    if (write) {
      fs.writeFileSync(
        path.join(ROOT, file),
        serialize(varName, comment, report.hymns),
      );
    }
  });
  if (!ok) {
    process.exitCode = 1;
  }
  if (!write) {
    console.log('\nDry run only. Re-run with --write to update the hymn files.');
  }
}

if (require.main === module) {
  main();
}

module.exports = {dedupeHymns, serialize};
