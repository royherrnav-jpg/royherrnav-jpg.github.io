// Imports photos into albums. Each photo's date and exposure details go into the
// album file; the published copy is resized and has all metadata removed.
//
//   node scripts/import-photos.mjs ~/Desktop/"Website Photos"
//
// Each subfolder becomes an album named after it. A folder with no subfolders
// becomes a single album. Existing albums are skipped, so re-running is safe.
// GPS is never read into the album file or kept in the published images.
import exifr from 'exifr';
import sharp from 'sharp';
import { execFileSync } from 'node:child_process';
import { access, mkdir, mkdtemp, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const MAX_EDGE = 2400;
const SHARP_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.tif', '.tiff']);
const HEIC_EXT = new Set(['.heic', '.heif']);

const albumsDir = fileURLToPath(new URL('../src/content/albums/', import.meta.url));
const source = process.argv[2]?.replace(/^~(?=$|\/)/, process.env.HOME);
if (!source) {
  console.error('Usage: node scripts/import-photos.mjs <folder>');
  process.exit(1);
}

const isImage = (name) => {
  const ext = path.extname(name).toLowerCase();
  return SHARP_EXT.has(ext) || HEIC_EXT.has(ext);
};

const slugify = (name) =>
  name
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const exists = (p) => access(p).then(() => true, () => false);
const pad = (n) => String(n).padStart(2, '0');
const titleCase = (s) => (s === s.toUpperCase() ? s[0] + s.slice(1).toLowerCase() : s);

// EXIF dates carry no timezone. exifr turns them into local-time Dates, so the
// local getters give back the camera's wall-clock time.
const wallClock = (d) =>
  d instanceof Date && !Number.isNaN(d.valueOf())
    ? `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
    : undefined;

async function readDetails(file) {
  // Pass a buffer: exifr's own file reader fails on current Node versions.
  const tags = await exifr.parse(await readFile(file), { gps: false }).catch(() => undefined);
  if (!tags) return {};

  const make = tags.Make?.trim();
  const model = tags.Model?.trim();
  const camera =
    make && model && !model.toLowerCase().startsWith(make.toLowerCase())
      ? `${titleCase(make)} ${model}`
      : model || (make && titleCase(make));

  // Third-party lenses put the brand in LensMake ("VILTROX" + "AF 35/1.7 XF").
  // Manual lenses often report no model name, only their focal length and aperture.
  const lensMake = tags.LensMake?.trim();
  const lensModel = tags.LensModel?.trim();
  const spec = tags.LensSpecification;
  const lens =
    (lensModel && lensMake && !lensModel.toLowerCase().includes(lensMake.toLowerCase())
      ? `${titleCase(lensMake)} ${lensModel}`
      : lensModel) ||
    (Array.isArray(spec) && spec[0]
      ? `${spec[0]}${spec[1] && spec[1] !== spec[0] ? `–${spec[1]}` : ''}mm f/${spec[2]}`
      : undefined);

  const t = tags.ExposureTime;
  const iso = Array.isArray(tags.ISO) ? tags.ISO[0] : tags.ISO;
  return {
    taken: wallClock(tags.DateTimeOriginal ?? tags.CreateDate),
    camera,
    lens,
    focalLength: tags.FocalLength ? Math.round(tags.FocalLength) : undefined,
    aperture: tags.FNumber ? Math.round(tags.FNumber * 10) / 10 : undefined,
    shutter: t ? (t >= 1 ? `${Math.round(t * 10) / 10}` : `1/${Math.round(1 / t)}`) : undefined,
    iso: iso || undefined,
  };
}

async function listAlbums(root) {
  const entries = await readdir(root, { withFileTypes: true });
  const albums = [];
  for (const dir of entries.filter((e) => e.isDirectory() && !e.name.startsWith('.'))) {
    const files = (await readdir(path.join(root, dir.name))).filter(isImage);
    if (files.length) albums.push({ name: dir.name, dir: path.join(root, dir.name), files });
  }
  const loose = entries.filter((e) => e.isFile() && isImage(e.name)).map((e) => e.name);
  if (loose.length) albums.push({ name: path.basename(root), dir: root, files: loose });
  return albums;
}

async function importAlbum({ name, dir, files }) {
  const slug = slugify(name);
  const outDir = path.join(albumsDir, slug);
  const mdPath = path.join(albumsDir, `${slug}.md`);
  if ((await exists(mdPath)) || (await exists(outDir))) {
    console.log(`skip  ${name} (album "${slug}" already exists)`);
    return;
  }

  const heicTmp = await mkdtemp(path.join(tmpdir(), 'heic-'));
  const frames = [];
  for (const [i, file] of files.entries()) {
    let input = path.join(dir, file);
    const { mtimeMs } = await stat(input);
    if (HEIC_EXT.has(path.extname(file).toLowerCase())) {
      // sharp's prebuilt binaries can't decode HEIC; macOS sips can, and keeps the EXIF.
      const converted = path.join(heicTmp, `${i}.jpg`);
      execFileSync('sips', ['-s', 'format', 'jpeg', input, '--out', converted], { stdio: 'ignore' });
      input = converted;
    }
    frames.push({ file, input, mtimeMs, details: await readDetails(input) });
  }

  // Chronological order, falling back to file name for undated frames.
  frames.sort(
    (a, b) =>
      (a.details.taken ?? '￿').localeCompare(b.details.taken ?? '￿') ||
      a.file.localeCompare(b.file, undefined, { numeric: true }),
  );

  await mkdir(outDir, { recursive: true });
  const blocks = [];
  for (const [i, frame] of frames.entries()) {
    const outName = `${pad(i + 1)}.jpg`;
    // rotate() bakes in the EXIF orientation before the metadata is dropped;
    // sharp writes no EXIF/GPS/XMP unless asked to.
    await sharp(frame.input)
      .rotate()
      .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85, mozjpeg: true })
      .toFile(path.join(outDir, outName));
    const fields = Object.entries(frame.details)
      .filter(([, v]) => v !== undefined && v !== '')
      .map(([k, v]) => `    ${k}: ${JSON.stringify(v)}`);
    blocks.push([`  - src: ./${slug}/${outName}`, ...fields].join('\n'));
  }

  const dates = frames.map((f) => f.details.taken?.slice(0, 10)).filter(Boolean).sort();
  const start = dates[0] ?? new Date(Math.min(...frames.map((f) => f.mtimeMs))).toISOString().slice(0, 10);
  const end = dates.at(-1) ?? start;
  const frontmatter = [
    '---',
    `title: ${JSON.stringify(name)}`,
    `date: ${start}`,
    ...(end !== start ? [`dateEnd: ${end}`] : []),
    `cover: ./${slug}/01.jpg`,
    'photos:',
    ...blocks,
    '---',
    '',
  ];
  await writeFile(mdPath, frontmatter.join('\n'));
  console.log(`added ${name} → ${slug} (${frames.length} photos, ${start} to ${end})`);
}

for (const album of await listAlbums(source)) {
  await importAlbum(album);
}
