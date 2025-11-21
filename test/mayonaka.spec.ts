import fs from 'node:fs/promises';
import path from 'node:path';
import { Readable } from 'node:stream';
import { compareUnsorted } from 'js-deep-equals';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { Mayonaka, MayonakaCustom, type MayonakaCustomFolder, MayonakaCustomSync, MayonakaSync } from '../src/index.js';

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
                        .addFile('iterable.txt', async () => stringIterable(), 'utf-8')
                        .addFile('undefined.txt', async () => undefined, 'utf-8')
                        .addFile('null.txt', async () => null, 'utf-8');
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

            const undefinedPath = path.join(testDir, 'bar', 'qux', 'undefined.txt');
            const nullPath = path.join(testDir, 'bar', 'qux', 'null.txt');

            await expect(fs.access(undefinedPath)).rejects.toThrow();
            await expect(fs.access(nullPath)).rejects.toThrow();
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

describe('MayonakaCustom', () => {
    type FolderRecord = {
        id: string;
        name: string;
        parentId: string | null;
    };

    type FileRecord = {
        id: string;
        name: string;
        parentId?: string;
        content: string;
    };

    type Database = {
        folders: Map<string, FolderRecord>;
        files: Map<string, FileRecord>;
        nextFolderId: number;
        nextFileId: number;
    };
    let db: Database;

    beforeEach(() => {
        db = {
            folders: new Map(),
            files: new Map(),
            nextFolderId: 1,
            nextFileId: 1,
        };
    });

    it('should build folder structure with correct parent references', async () => {
        const createFolderFn = async (parentFolder: FolderRecord | null, folderData: { name: string }): Promise<FolderRecord> => {
            const id = `folder_${db.nextFolderId++}`;
            const record: FolderRecord = {
                id,
                name: folderData.name,
                parentId: parentFolder?.id || null,
            };

            db.folders.set(id, record);
            return record;
        };

        const createFileFn = async (parentFolder: FolderRecord | null, fileData: { name: string; content: string }): Promise<void> => {
            const id = `file_${db.nextFileId++}`;
            const record: FileRecord = {
                id,
                name: fileData.name,
                parentId: parentFolder?.id,
                content: fileData.content,
            };

            db.files.set(id, record);
        };

        const mayo = new MayonakaCustom(null, createFolderFn, createFileFn, { maxConcurrency: 2 });

        await mayo
            .addFolder({ name: 'Documents' }, documents => {
                documents.addFile(async () => ({
                    name: 'readme.txt',
                    content: 'This is the documents folder',
                }));

                documents.addFolder({ name: 'Images' }, images => {
                    images.addFile(async () => ({
                        name: 'photo.jpg',
                        content: 'image data',
                    }));
                });
            })
            .addFolder({ name: 'Downloads' }, downloads => {
                downloads.addFile(async () => ({
                    name: 'music.mp3',
                    content: 'audio data',
                }));
            })
            .build();

        expect(db.folders.size).toBe(3);
        expect(db.files.size).toBe(3);
        console.log(db.folders);

        const findFolderByName = (name: string): FolderRecord | undefined => {
            for (const folder of db.folders.values()) {
                if (folder.name === name) return folder;
            }
            return undefined;
        };

        const findFilesByParentId = (parentId: string): FileRecord[] => {
            const result: FileRecord[] = [];
            for (const file of db.files.values()) {
                if (file.parentId === parentId) result.push(file);
            }
            return result;
        };

        const docsFolder = findFolderByName('Documents')!;

        expect(docsFolder).toBeDefined();
        expect(docsFolder.parentId).toBeNull();

        const imagesFolder = findFolderByName('Images')!;
        expect(imagesFolder).toBeDefined();
        expect(imagesFolder.parentId).toBe(docsFolder.id);

        const downloadsFolder = findFolderByName('Downloads')!;
        expect(downloadsFolder).toBeDefined();
        expect(downloadsFolder.parentId).toBeNull();

        const docsFiles = findFilesByParentId(docsFolder.id);
        expect(docsFiles.length).toBe(1);
        expect(docsFiles[0].name).toBe('readme.txt');

        const imagesFiles = findFilesByParentId(imagesFolder.id);
        expect(imagesFiles.length).toBe(1);
        expect(imagesFiles[0].name).toBe('photo.jpg');

        const downloadsFiles = findFilesByParentId(downloadsFolder.id);
        expect(downloadsFiles.length).toBe(1);
        expect(downloadsFiles[0].name).toBe('music.mp3');
    });

    it('should build a nested folder structure correctly', async () => {
        const rootFolder = { name: 'root', children: [] };

        type Folder = { name: string; children: (Folder | File)[] };
        type File = number;

        const result = await new MayonakaCustom(
            rootFolder,
            async (parentFolder: Folder | null, data: { name: string }) => {
                const folder = {
                    name: data?.name || 'root',
                    children: [],
                };

                if (parentFolder) {
                    parentFolder.children.push(folder);
                }
                return folder;
            },
            async (parentFolder: Folder | null, item: File) => {
                if (parentFolder) {
                    parentFolder.children.push(item);
                }
            },
        )
            .addFile(async () => 1)
            .addFile(async () => 2)
            .addFolder({ name: 'folder1' }, async folder1 => {
                folder1.addFile(async () => 3);
                folder1.addFile(async () => 4);
                folder1.addFile(async () => 5);
                folder1.addFolder({ name: 'subfolder' }, subfolder => {
                    subfolder.addFile(async () => 6);
                });
            })
            .addFolder({ name: 'folder2' }, async folder2 => {
                folder2.addFile(async () => 9);
                folder2.addFile(async () => 10);
                folder2.addFile(async () => 11);
            })
            .build();

        const expected = {
            name: 'root',
            children: [
                1,
                2,
                {
                    name: 'folder1',
                    children: [
                        3,
                        4,
                        5,
                        {
                            name: 'subfolder',
                            children: [6],
                        },
                    ],
                },
                {
                    name: 'folder2',
                    children: [9, 10, 11],
                },
            ],
        };

        expect(compareUnsorted(result, expected)).to.deep.eq(true);
    });
});

describe('MayonakaCustomSync', () => {
    it('should build a nested folder structure correctly', () => {
        const rootFolder = { name: 'root', children: [] };

        type Folder = { name: string; children: (Folder | File)[] };
        type File = number;

        const result = new MayonakaCustomSync<Folder, File>(
            rootFolder,
            (parentFolder, data) => {
                const folder = {
                    name: data?.name || 'root',
                    children: [],
                };

                if (parentFolder) {
                    parentFolder.children.push(folder);
                }
                return folder;
            },
            (parentFolder, item) => {
                if (parentFolder) {
                    parentFolder.children.push(item);
                }
            },
        )
            .addFile(() => 1)
            .addFile(() => 2)
            .addFolder({ name: 'folder1' }, folder1 => {
                folder1.addFile(() => 3);
                folder1.addFile(() => 4);
                folder1.addFile(() => 5);
                folder1.addFolder({ name: 'subfolder' }, subfolder => {
                    subfolder.addFile(() => 6);
                });
            })
            .addFolder({ name: 'folder2' }, folder2 => {
                folder2.addFile(() => 9);
                folder2.addFile(() => 10);
                folder2.addFile(() => 11);
            })
            .build();

        const expected = {
            name: 'root',
            children: [
                1,
                2,
                {
                    name: 'folder1',
                    children: [
                        3,
                        4,
                        5,
                        {
                            name: 'subfolder',
                            children: [6],
                        },
                    ],
                },
                {
                    name: 'folder2',
                    children: [9, 10, 11],
                },
            ],
        };

        expect(compareUnsorted(result, expected)).toEqual(true);
    });
});
