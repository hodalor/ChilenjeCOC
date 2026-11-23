/**
 * Audit hymn files for duplicate numbers, duplicate lyrics, and gaps.
 * Usage: node scripts/audit-hymns.js
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');

const FILES = [
  ['English', 'scr/db/english-hymns.js', 'englishHymns'],
  ['Bemba', 'scr/db/bemba-hymns.js', 'bembaHymns'],
  ['Chewa', 'scr/db/chewa-hymns.js', 'chewaHymns'],
  ['Tonga', 'scr/db/tonga-hymns.js', 'tongaHymns'],
  ['Tumbuka', 'scr/db/tumbuka-hymns.js', 'tumbukaHymns'],
  ['Zulu', 'scr/db/zulu-hymns.js', 'zuluHymns'],
];

function load(file, varName) {
  let text = fs.readFileSync(path.join(ROOT, file), 'utf8');
  text = text.replace(/export const \w+ = /, 'module.exports = ');
  const module = {exports: {}};
  vm.runInNewContext(text, {module, exports: module.exports});
  return module.exports;
}

function norm(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[^a-z0-9']+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function linesOf(hymn) {
  const parts = [];
  if (Array.isArray(hymn.chorus)) {
    parts.push(...hymn.chorus);
  }
  for (const stanza of hymn.stanzers || []) {
    parts.push(...(stanza.lines || []));
  }
  return parts.map(line => String(line || '').trim()).filter(Boolean);
}

function contentKey(hymn) {
  return linesOf(hymn).map(norm).filter(Boolean).join('\n');
}

function preview(hymn) {
  const lines = linesOf(hymn);
  return {
    no: hymn.hymnNo,
    title: hymn.title,
    lineCount: lines.length,
    chars: lines.join(' ').length,
    first: lines.slice(0, 2).join(' | '),
  };
}

function audit(name, hymns) {
  const byNo = new Map();
  const byContent = new Map();
  const byTitle = new Map();
  let empty = 0;
  let nonNumeric = 0;
  let outOfOrder = 0;
  let prev = -Infinity;

  hymns.forEach((hymn, index) => {
    const no = hymn.hymnNo;
    if (typeof no !== 'number') {
      nonNumeric += 1;
    } else if (no < prev) {
      outOfOrder += 1;
    }
    if (typeof no === 'number') {
      prev = no;
    }
    const key = contentKey(hymn);
    if (!key) {
      empty += 1;
    }
    if (!byNo.has(no)) {
      byNo.set(no, []);
    }
    byNo.get(no).push({index, hymn, key});
    if (key) {
      if (!byContent.has(key)) {
        byContent.set(key, []);
      }
      byContent.get(key).push({index, hymn});
    }
    const titleKey = norm(hymn.title);
    if (titleKey) {
      if (!byTitle.has(titleKey)) {
        byTitle.set(titleKey, []);
      }
      byTitle.get(titleKey).push({index, hymn, key});
    }
  });

  const numbers = [...byNo.keys()].filter(no => typeof no === 'number');
  const max = numbers.length ? Math.max(...numbers) : 0;
  const min = numbers.length ? Math.min(...numbers) : 0;
  const unique = numbers.length;
  const gaps = [];
  if (numbers.length) {
    const set = new Set(numbers);
    for (let n = min; n <= max; n += 1) {
      if (!set.has(n)) {
        gaps.push(n);
      }
    }
  }

  const dupNumbers = [];
  for (const [no, items] of byNo) {
    if (items.length < 2) {
      continue;
    }
    const keys = new Set(items.map(item => item.key));
    dupNumbers.push({
      no,
      count: items.length,
      distinctContent: keys.size,
      items: items.map(item => preview(item.hymn)),
    });
  }

  const dupContent = [];
  for (const [, items] of byContent) {
    const numbersForContent = [...new Set(items.map(item => item.hymn.hymnNo))];
    if (items.length < 2) {
      continue;
    }
    if (numbersForContent.length < 2 && items.length === numbersForContent.length) {
      continue;
    }
    dupContent.push({
      count: items.length,
      numbers: items.map(item => item.hymn.hymnNo),
      titles: [...new Set(items.map(item => item.hymn.title))],
      first: preview(items[0].hymn).first,
    });
  }

  const sameTitleDifferentContent = [];
  for (const [title, items] of byTitle) {
    const keys = new Set(items.map(item => item.key));
    const nos = new Set(items.map(item => item.hymn.hymnNo));
    if (keys.size > 1 && nos.size > 1) {
      sameTitleDifferentContent.push({
        title,
        entries: items.map(item => preview(item.hymn)),
      });
    }
  }

  console.log('\n======== ' + name + ' ========');
  console.log(
    JSON.stringify(
      {
        totalEntries: hymns.length,
        uniqueNumbers: unique,
        min,
        max,
        empty,
        nonNumeric,
        outOfOrderSteps: outOfOrder,
        duplicateNumberGroups: dupNumbers.length,
        duplicateContentGroups: dupContent.length,
        sameTitleDifferentNumbers: sameTitleDifferentContent.length,
        gapCount: gaps.length,
        gaps: gaps.length > 80 ? gaps.slice(0, 80).concat(['...+' + (gaps.length - 80)]) : gaps,
      },
      null,
      2,
    ),
  );

  if (dupNumbers.length) {
    console.log('\n-- duplicate numbers --');
    dupNumbers.forEach(group => {
      console.log(
        `#${group.no} x${group.count} distinctContent=${group.distinctContent}`,
      );
      group.items.forEach(item => {
        console.log(
          `   lines=${item.lineCount} chars=${item.chars} title=${JSON.stringify(item.title)} :: ${item.first}`,
        );
      });
    });
  }

  if (dupContent.length) {
    console.log('\n-- same lyrics, more than one entry --');
    dupContent.forEach(group => {
      console.log(
        `x${group.count} nos=${group.numbers.join(',')} titles=${group.titles.map(t => JSON.stringify(t)).join(' | ')}`,
      );
      console.log('   ' + group.first);
    });
  }

  if (sameTitleDifferentContent.length) {
    console.log('\n-- same title, different lyrics and numbers (first 40) --');
    sameTitleDifferentContent.slice(0, 40).forEach(group => {
      console.log('TITLE ' + JSON.stringify(group.title));
      group.entries.forEach(item => {
        console.log(
          `   #${item.no} lines=${item.lineCount} :: ${item.first}`,
        );
      });
    });
    if (sameTitleDifferentContent.length > 40) {
      console.log('... ' + (sameTitleDifferentContent.length - 40) + ' more title groups');
    }
  }
}

for (const [name, file] of FILES) {
  const hymns = load(file);
  audit(name, hymns);
}
