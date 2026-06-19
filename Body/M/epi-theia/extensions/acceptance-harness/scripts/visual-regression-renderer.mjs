import { createHash } from 'node:crypto';
import { deflateSync, inflateSync } from 'node:zlib';

const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

let crcTable;

function makeCrcTable() {
    const table = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
        let c = n;
        for (let k = 0; k < 8; k++) {
            c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
        }
        table[n] = c >>> 0;
    }
    return table;
}

function crc32(buffer) {
    crcTable ??= makeCrcTable();
    let c = 0xffffffff;
    for (const byte of buffer) {
        c = crcTable[(c ^ byte) & 0xff] ^ (c >>> 8);
    }
    return (c ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data = Buffer.alloc(0)) {
    const typeBuffer = Buffer.from(type, 'ascii');
    const length = Buffer.alloc(4);
    length.writeUInt32BE(data.length, 0);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
    return Buffer.concat([length, typeBuffer, data, crc]);
}

export function sha256(buffer) {
    return createHash('sha256').update(buffer).digest('hex');
}

export function encodePngRgba(width, height, rgba) {
    if (rgba.length !== width * height * 4) {
        throw new Error(`RGBA length ${rgba.length} does not match ${width}x${height}`);
    }

    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(width, 0);
    ihdr.writeUInt32BE(height, 4);
    ihdr[8] = 8; // bit depth
    ihdr[9] = 6; // RGBA
    ihdr[10] = 0;
    ihdr[11] = 0;
    ihdr[12] = 0;

    const scanlineLength = width * 4;
    const raw = Buffer.alloc((scanlineLength + 1) * height);
    for (let y = 0; y < height; y++) {
        const rawOffset = y * (scanlineLength + 1);
        raw[rawOffset] = 0;
        Buffer.from(rgba.buffer, rgba.byteOffset + y * scanlineLength, scanlineLength)
            .copy(raw, rawOffset + 1);
    }

    return Buffer.concat([
        PNG_SIGNATURE,
        pngChunk('IHDR', ihdr),
        pngChunk('IDAT', deflateSync(raw, { level: 9 })),
        pngChunk('IEND')
    ]);
}

export function decodePngRgba(buffer) {
    if (!buffer.subarray(0, PNG_SIGNATURE.length).equals(PNG_SIGNATURE)) {
        throw new Error('Invalid PNG signature');
    }

    let offset = PNG_SIGNATURE.length;
    let width = 0;
    let height = 0;
    let colorType = 0;
    let bitDepth = 0;
    const idat = [];

    while (offset < buffer.length) {
        const length = buffer.readUInt32BE(offset);
        offset += 4;
        const type = buffer.subarray(offset, offset + 4).toString('ascii');
        offset += 4;
        const data = buffer.subarray(offset, offset + length);
        offset += length;
        offset += 4;

        if (type === 'IHDR') {
            width = data.readUInt32BE(0);
            height = data.readUInt32BE(4);
            bitDepth = data[8];
            colorType = data[9];
        } else if (type === 'IDAT') {
            idat.push(data);
        } else if (type === 'IEND') {
            break;
        }
    }

    if (bitDepth !== 8 || colorType !== 6) {
        throw new Error(`Unsupported PNG format: bitDepth=${bitDepth}, colorType=${colorType}`);
    }

    const inflated = inflateSync(Buffer.concat(idat));
    const stride = width * 4;
    const rgba = new Uint8Array(width * height * 4);
    let source = 0;

    for (let y = 0; y < height; y++) {
        const filter = inflated[source++];
        const row = inflated.subarray(source, source + stride);
        source += stride;
        const targetOffset = y * stride;

        for (let x = 0; x < stride; x++) {
            const left = x >= 4 ? rgba[targetOffset + x - 4] : 0;
            const up = y > 0 ? rgba[targetOffset + x - stride] : 0;
            const upLeft = y > 0 && x >= 4 ? rgba[targetOffset + x - stride - 4] : 0;
            let value;

            if (filter === 0) {
                value = row[x];
            } else if (filter === 1) {
                value = row[x] + left;
            } else if (filter === 2) {
                value = row[x] + up;
            } else if (filter === 3) {
                value = row[x] + Math.floor((left + up) / 2);
            } else if (filter === 4) {
                const p = left + up - upLeft;
                const pa = Math.abs(p - left);
                const pb = Math.abs(p - up);
                const pc = Math.abs(p - upLeft);
                const predictor = pa <= pb && pa <= pc ? left : pb <= pc ? up : upLeft;
                value = row[x] + predictor;
            } else {
                throw new Error(`Unsupported PNG filter ${filter}`);
            }

            rgba[targetOffset + x] = value & 0xff;
        }
    }

    return { width, height, rgba };
}

function hashByte(seed, offset) {
    const digest = createHash('sha256').update(`${seed}:${offset}`).digest();
    return digest[0];
}

function makePalette(seed) {
    const a = hashByte(seed, 1);
    const b = hashByte(seed, 2);
    const c = hashByte(seed, 3);
    return {
        background: [18 + (a % 24), 22 + (b % 22), 28 + (c % 20), 255],
        cool: [42 + (a % 46), 86 + (b % 74), 176 + (c % 58), 255],
        warm: [172 + (a % 44), 104 + (b % 54), 38 + (c % 48), 255],
        green: [42 + (a % 36), 146 + (b % 72), 104 + (c % 44), 255],
        red: [170 + (a % 46), 56 + (b % 42), 68 + (c % 38), 255],
        text: [225, 232, 238, 255],
        muted: [88 + (a % 42), 100 + (b % 36), 118 + (c % 36), 255]
    };
}

function putPixel(rgba, width, height, x, y, color) {
    if (x < 0 || y < 0 || x >= width || y >= height) {
        return;
    }
    const index = (Math.floor(y) * width + Math.floor(x)) * 4;
    rgba[index] = color[0];
    rgba[index + 1] = color[1];
    rgba[index + 2] = color[2];
    rgba[index + 3] = color[3];
}

function rect(rgba, width, height, x, y, w, h, color) {
    const x0 = Math.max(0, Math.floor(x));
    const y0 = Math.max(0, Math.floor(y));
    const x1 = Math.min(width, Math.ceil(x + w));
    const y1 = Math.min(height, Math.ceil(y + h));
    for (let py = y0; py < y1; py++) {
        for (let px = x0; px < x1; px++) {
            putPixel(rgba, width, height, px, py, color);
        }
    }
}

function line(rgba, width, height, x0, y0, x1, y1, color) {
    x0 = Math.round(x0);
    y0 = Math.round(y0);
    x1 = Math.round(x1);
    y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0);
    const sx = x0 < x1 ? 1 : -1;
    const dy = -Math.abs(y1 - y0);
    const sy = y0 < y1 ? 1 : -1;
    let error = dx + dy;
    let x = x0;
    let y = y0;

    while (true) {
        putPixel(rgba, width, height, x, y, color);
        if (x === x1 && y === y1) {
            break;
        }
        const doubled = 2 * error;
        if (doubled >= dy) {
            error += dy;
            x += sx;
        }
        if (doubled <= dx) {
            error += dx;
            y += sy;
        }
    }
}

function circle(rgba, width, height, cx, cy, radius, color) {
    const r2 = radius * radius;
    for (let y = Math.floor(cy - radius); y <= Math.ceil(cy + radius); y++) {
        for (let x = Math.floor(cx - radius); x <= Math.ceil(cx + radius); x++) {
            const dx = x - cx;
            const dy = y - cy;
            if (dx * dx + dy * dy <= r2) {
                putPixel(rgba, width, height, x, y, color);
            }
        }
    }
}

function drawHeader(rgba, width, height, palette, seed, frame) {
    rect(rgba, width, height, 0, 0, width, 24, [palette.muted[0], palette.muted[1], palette.muted[2], 255]);
    const blocks = Math.max(6, Math.floor(width / 54));
    for (let i = 0; i < blocks; i++) {
        const tone = i % 2 === 0 ? palette.cool : palette.warm;
        rect(rgba, width, height, 12 + i * 46, 8, 28 + (hashByte(seed, i) % 12), 5, tone);
    }
    const markerWidth = Math.max(18, Math.floor(width * ((frame.phase ?? (frame.tickIndex ?? 0) / 11) + 0.08) / 7));
    rect(rgba, width, height, width - markerWidth - 16, 7, markerWidth, 8, palette.green);
}

function drawLemniscate(rgba, width, height, palette, frame) {
    const phase = frame.phase ?? 0;
    const cx = width / 2;
    const cy = height / 2 + 10;
    const scale = Math.min(width, height) * 0.32;
    let previous;

    for (let i = 0; i <= 240; i++) {
        const t = (i / 240) * Math.PI * 2;
        const denom = 1 + Math.sin(t) * Math.sin(t);
        const x = cx + (scale * Math.cos(t)) / denom;
        const y = cy + (scale * Math.sin(t) * Math.cos(t)) / denom;
        const travelled = i / 240;
        const color = travelled <= phase + 0.02 ? palette.warm : palette.cool;
        if (previous) {
            line(rgba, width, height, previous.x, previous.y, x, y, color);
            line(rgba, width, height, previous.x, previous.y + 1, x, y + 1, color);
        }
        previous = { x, y };
    }

    circle(rgba, width, height, cx - scale * 0.48, cy, 7 + phase * 5, palette.cool);
    circle(rgba, width, height, cx + scale * 0.48, cy, 7 + (1 - phase) * 5, palette.warm);
    rect(rgba, width, height, 28, height - 30, (width - 56) * phase, 8, palette.green);
}

function drawTickMatrices(rgba, width, height, palette, frame) {
    const tick = frame.tickIndex ?? 0;
    const active = frame.matrixIndex ?? tick % 6;
    const gap = 10;
    const top = 38;
    const matrixWidth = Math.floor((width - gap * 7) / 6);
    const matrixHeight = height - top - 24;

    for (let matrix = 0; matrix < 6; matrix++) {
        const x = gap + matrix * (matrixWidth + gap);
        const color = matrix === active ? palette.warm : palette.muted;
        rect(rgba, width, height, x, top, matrixWidth, matrixHeight, [color[0], color[1], color[2], 255]);
        rect(rgba, width, height, x + 4, top + 4, matrixWidth - 8, matrixHeight - 8, palette.background);
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                const cell = ((tick + matrix + row * 2 + col * 3) % 11) / 10;
                const tone = matrix === active ? palette.green : palette.cool;
                const alphaColor = [
                    Math.floor(tone[0] * cell + palette.background[0] * (1 - cell)),
                    Math.floor(tone[1] * cell + palette.background[1] * (1 - cell)),
                    Math.floor(tone[2] * cell + palette.background[2] * (1 - cell)),
                    255
                ];
                rect(
                    rgba,
                    width,
                    height,
                    x + 10 + col * ((matrixWidth - 20) / 4),
                    top + 12 + row * ((matrixHeight - 24) / 4),
                    Math.max(3, (matrixWidth - 28) / 4),
                    Math.max(3, (matrixHeight - 32) / 4),
                    alphaColor
                );
            }
        }
    }

    const markerX = gap + active * (matrixWidth + gap) + matrixWidth / 2;
    circle(rgba, width, height, markerX, height - 12, 6, palette.green);
}

function drawIntegratedComposition(rgba, width, height, palette, manifest, frame) {
    const isCosmic = manifest.fixtureId.includes('1-2-3');
    const slots = isCosmic
        ? ['m1-paramasiva', 'm2-parashakti', 'm3-mahamaya']
        : ['m4-nara', 'm5-epii', 'm0-anuttara'];
    const slotColors = isCosmic
        ? [palette.cool, palette.green, palette.warm]
        : [palette.green, palette.red, palette.cool];
    const margin = 18;
    const top = 42;
    const panelWidth = Math.floor((width - margin * 4) / 3);
    const panelHeight = height - top - 30;

    for (let i = 0; i < 3; i++) {
        const x = margin + i * (panelWidth + margin);
        const y = top + (i === 1 ? 10 : 0);
        rect(rgba, width, height, x, y, panelWidth, panelHeight - (i === 1 ? 10 : 0), slotColors[i]);
        rect(rgba, width, height, x + 5, y + 5, panelWidth - 10, panelHeight - 10, palette.background);
        for (let stripe = 0; stripe < 8; stripe++) {
            const stripeColor = stripe % 2 === 0 ? slotColors[i] : palette.muted;
            rect(rgba, width, height, x + 12, y + 18 + stripe * 16, panelWidth - 24, 5, stripeColor);
        }
        const slotSeed = slots[i].length + (frame.width ?? width);
        circle(rgba, width, height, x + panelWidth - 24, y + 24, 6 + (slotSeed % 8), slotColors[i]);
    }

    const tabCount = manifest.omniPanel?.tabs?.length ?? 8;
    const tabWidth = Math.max(14, Math.floor((width - 40) / tabCount));
    for (let tab = 0; tab < tabCount; tab++) {
        const color = tab === (isCosmic ? 0 : 5) ? palette.warm : palette.muted;
        rect(rgba, width, height, 20 + tab * tabWidth, height - 18, tabWidth - 3, 6, color);
    }
}

export function renderVisualBaselinePng(manifest, frame) {
    const width = frame.width;
    const height = frame.height;
    const seed = `${manifest.fixtureId}:${frame.id}:${frame.viewport ?? ''}`;
    const palette = makePalette(seed);
    const rgba = new Uint8Array(width * height * 4);

    rect(rgba, width, height, 0, 0, width, height, palette.background);
    drawHeader(rgba, width, height, palette, seed, frame);

    if (manifest.fixtureId.includes('lemniscate')) {
        drawLemniscate(rgba, width, height, palette, frame);
    } else if (manifest.fixtureId.includes('tick')) {
        drawTickMatrices(rgba, width, height, palette, frame);
    } else {
        drawIntegratedComposition(rgba, width, height, palette, manifest, frame);
    }

    return encodePngRgba(width, height, rgba);
}

export function comparePngToRenderedBaseline(actualBuffer, manifest, frame) {
    const actual = decodePngRgba(actualBuffer);
    const expected = decodePngRgba(renderVisualBaselinePng(manifest, frame));
    if (actual.width !== expected.width || actual.height !== expected.height) {
        return {
            width: actual.width,
            height: actual.height,
            expectedWidth: expected.width,
            expectedHeight: expected.height,
            changedPixels: Number.POSITIVE_INFINITY,
            pixelRatio: 1
        };
    }

    let changedPixels = 0;
    for (let i = 0; i < actual.rgba.length; i += 4) {
        const changed =
            actual.rgba[i] !== expected.rgba[i] ||
            actual.rgba[i + 1] !== expected.rgba[i + 1] ||
            actual.rgba[i + 2] !== expected.rgba[i + 2] ||
            actual.rgba[i + 3] !== expected.rgba[i + 3];
        if (changed) {
            changedPixels++;
        }
    }

    return {
        width: actual.width,
        height: actual.height,
        expectedWidth: expected.width,
        expectedHeight: expected.height,
        changedPixels,
        pixelRatio: changedPixels / (actual.width * actual.height)
    };
}
