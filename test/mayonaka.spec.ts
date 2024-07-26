import { describe, it, beforeEach, afterEach, expect } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import { Readable } from 'node:stream';
import { Mayonaka, MayonakaSync } from '../src/index.js';

const testDir = path.join(__dirname, 'test-dir');

function* stringIterable() {
    const strings = ['m', 'a', 'y', 'o', 'n', 'a', 'k', 'a'];
    for (const str of strings) {
        yield str;
    }
}

describe('Mayonaka', () => {
    beforeEach(async () => {
        await fs.rm(testDir, { recursive: true, force: true }).catch();
    });

    afterEach(async () => {
        await fs.rm(testDir, { recursive: true, force: true }).catch();
    });

    it('should create directories and files correctly', async () => {
        const res = await new Mayonaka(testDir)
            .addFolder('foo')
            .addFolder('bar', bar => {
                bar.addFolder('qux', qux => {
                    qux.addFolder('quux')
                        .addFile('readable.txt', async () => Readable.from(['mayonaka']), 'utf-8')
                        .addFile('buffer.txt', async () => Buffer.from('mayonaka'), 'utf-8')
                        .addFile('string.txt', async () => 'mayonaka', 'utf-8')
                        .addFile('iterable.txt', async () => stringIterable(), 'utf-8');
                });
            })
            .addFolder('baz')
            .build();

        try {
            await fs.access(path.join(testDir, 'foo'));
            await fs.access(path.join(testDir, 'bar'));
            await fs.access(path.join(testDir, 'baz'));
            await fs.access(path.join(testDir, 'bar', 'qux'));
            await fs.access(path.join(testDir, 'bar', 'qux', 'quux'));

            const readable = path.join(testDir, 'bar', 'qux', 'readable.txt');
            const buffer = path.join(testDir, 'bar', 'qux', 'buffer.txt');
            const string = path.join(testDir, 'bar', 'qux', 'string.txt');
            const iterable = path.join(testDir, 'bar', 'qux', 'iterable.txt');

            await fs.access(readable);
            await fs.access(buffer);
            await fs.access(string);
            await fs.access(iterable);

            const readableContent = await fs.readFile(readable, 'utf-8');
            const bufferContent = await fs.readFile(buffer, 'utf-8');
            const stringContent = await fs.readFile(string, 'utf-8');
            const iterableContent = await fs.readFile(iterable, 'utf-8');

            expect(readableContent).toBe('mayonaka');
            expect(bufferContent).toBe('mayonaka');
            expect(stringContent).toBe('mayonaka');
            expect(iterableContent).toBe('mayonaka');
            expect(res.path).toBe(testDir);
        } catch (err) {
            throw new Error(`Test failed: ${err.message}`);
        }
    });
});

describe('MayonakaSync', () => {
    beforeEach(async () => {
        await fs.rm(testDir, { recursive: true, force: true }).catch();
    });

    afterEach(async () => {
        await fs.rm(testDir, { recursive: true, force: true }).catch();
    });

    it('should create directories and files correctly', async () => {
        const res = new MayonakaSync(testDir)
            .addFolder('foo')
            .addFolder('bar', bar => {
                bar.addFolder('qux', qux => {
                    qux.addFolder('quux')
                        .addFile('buffer.txt', () => Buffer.from('mayonaka'), 'utf-8')
                        .addFile('string.txt', () => 'mayonaka', 'utf-8');
                });
            })
            .addFolder('baz')
            .build();

        try {
            await fs.access(path.join(testDir, 'foo'));
            await fs.access(path.join(testDir, 'bar'));
            await fs.access(path.join(testDir, 'baz'));
            await fs.access(path.join(testDir, 'bar', 'qux'));
            await fs.access(path.join(testDir, 'bar', 'qux', 'quux'));

            const buffer = path.join(testDir, 'bar', 'qux', 'buffer.txt');
            const string = path.join(testDir, 'bar', 'qux', 'string.txt');

            await fs.access(buffer);
            await fs.access(string);

            const bufferContent = await fs.readFile(buffer, 'utf-8');
            const stringContent = await fs.readFile(string, 'utf-8');

            expect(bufferContent).toBe('mayonaka');
            expect(stringContent).toBe('mayonaka');
            expect(res.path).toBe(testDir);
        } catch (err) {
            throw new Error(`Test failed: ${err.message}`);
        }
    });
});
