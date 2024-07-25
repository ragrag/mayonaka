import type { MakeDirectoryOptions, Mode, WriteFileOptions } from 'node:fs';
import { mkdirSync, writeFileSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { Stream } from 'node:stream';
import { MayonakaCommand, type MayonakaSyncCommand, chunk } from './lib.js';

export type MayonakaOptions = {
    dirMode?: Mode;
    fileMode?: Mode;
    maxConcurrency?: number;
};

export type MayonakaSyncOptions = {
    dirMode?: Mode;
    fileMode?: Mode;
};

export type Folder = Pick<Mayonaka, 'addFolder' | 'addFile'>;
export type SyncFolder = Pick<MayonakaSync, 'addFolder' | 'addFile'>;

export type AddFolderOptions = Omit<MakeDirectoryOptions, 'recursive'>;
export type AddFileOptionss = WriteFileOptions;

export type FileData = string | NodeJS.ArrayBufferView | Iterable<string | NodeJS.ArrayBufferView> | AsyncIterable<string | NodeJS.ArrayBufferView> | Stream;
export type SyncFileData = string | NodeJS.ArrayBufferView;

type MayonakaCommandNode = { command: MayonakaCommand<void>; children: MayonakaCommandNode[] };
type MayonakaSyncCommandNode = { command: MayonakaSyncCommand<void>; children: MayonakaSyncCommandNode[] };

export class Mayonaka {
    private path: string;
    private opts: MayonakaOptions;
    private commandGraph: MayonakaCommandNode[];

    constructor(path: string, opts?: MayonakaOptions) {
        this.path = path;
        this.opts = {
            dirMode: opts?.dirMode ?? 0o777,
            fileMode: opts?.fileMode ?? 0o666,
            maxConcurrency: opts?.maxConcurrency && typeof opts.maxConcurrency === 'number' ? Math.max(1, opts.maxConcurrency) : undefined,
        };
        this.commandGraph = [];
    }

    public addFolder(name: string, folder: (folder: Folder) => void, opts?: AddFolderOptions): this;
    public addFolder(name: string, opts?: AddFolderOptions): this;
    public addFolder(name: string, folderOrOpts?: ((folder: Folder) => void) | AddFolderOptions, opts?: AddFolderOptions): this {
        const folderPath = path.join(this.path, name);

        if (typeof folderOrOpts === 'function') {
            const mode = opts?.mode ?? this.opts.dirMode;
            const command = this.mkDirCommand(folderPath, { mode });

            const subFolder = new Mayonaka(folderPath, this.opts);
            folderOrOpts(subFolder);
            const children = subFolder.commandGraph;

            this.commandGraph.push({ command, children });
        } else {
            const mode = folderOrOpts?.mode ?? this.opts.dirMode;
            this.commandGraph.push({ command: this.mkDirCommand(folderPath, { mode }), children: [] });
        }

        return this;
    }

    public addFile(name: string, data: () => Promise<FileData>, opts?: AddFileOptionss): this {
        const filePath = path.join(this.path, name);

        if (opts && typeof opts === 'object') {
            opts.mode = opts.mode ?? this.opts.fileMode;
        }

        this.commandGraph.push({ command: this.writeFileCommand(filePath, data, opts), children: [] });

        return this;
    }

    public async build() {
        let queue = [...this.commandGraph];

        while (queue.length) {
            const currentLevel = [];
            const nextLevel = [];
            for (let i = 0; i < queue.length; i++) {
                currentLevel.push(queue[i]!.command);
                nextLevel.push(...queue[i]!.children);
            }

            if (this.opts.maxConcurrency) {
                for (const commandChunk of chunk(currentLevel, this.opts.maxConcurrency)) {
                    await Promise.all(commandChunk);
                }
            } else {
                await Promise.all(currentLevel);
            }

            queue = nextLevel;
        }

        this.commandGraph = [];
    }

    private mkDirCommand(path: string, opts?: AddFolderOptions): MayonakaCommand<void> {
        return new MayonakaCommand(async (resolve, reject) => {
            try {
                await mkdir(path, { recursive: true, mode: opts?.mode ?? this.opts.dirMode });
                resolve();
            } catch (err) {
                reject(err);
            }
        });
    }

    private writeFileCommand(
        path: string,
        data: () => Promise<
            string | NodeJS.ArrayBufferView | Iterable<string | NodeJS.ArrayBufferView> | AsyncIterable<string | NodeJS.ArrayBufferView> | Stream
        >,
        opts?: AddFileOptionss,
    ): MayonakaCommand<void> {
        return new MayonakaCommand(async (resolve, reject) => {
            try {
                const fileData = await data();
                await writeFile(path, fileData, opts);
                resolve();
            } catch (err) {
                reject(err);
            }
        });
    }
}

export class MayonakaSync {
    private path: string;
    private opts: MayonakaSyncOptions;
    private commandGraph: MayonakaSyncCommandNode[];

    constructor(path: string, opts?: MayonakaSyncOptions) {
        this.path = path;
        this.opts = {
            dirMode: opts?.dirMode ?? 0o777,
            fileMode: opts?.fileMode ?? 0o666,
        };
        this.commandGraph = [];
    }

    public addFolder(name: string, folder: (folder: SyncFolder) => void, opts?: AddFolderOptions): this;
    public addFolder(name: string, opts?: AddFolderOptions): this;
    public addFolder(name: string, folderOrOpts?: ((folder: SyncFolder) => void) | AddFolderOptions, opts?: AddFolderOptions): this {
        const folderPath = path.join(this.path, name);

        if (typeof folderOrOpts === 'function') {
            const mode = opts?.mode ?? this.opts.dirMode;
            const command = this.mkDirCommand(folderPath, { mode });

            const subFolder = new MayonakaSync(folderPath, this.opts);
            folderOrOpts(subFolder);
            const children = subFolder.commandGraph;

            this.commandGraph.push({ command, children });
        } else {
            const mode = folderOrOpts?.mode ?? this.opts.dirMode;
            this.commandGraph.push({ command: this.mkDirCommand(folderPath, { mode }), children: [] });
        }

        return this;
    }

    public addFile(name: string, data: () => SyncFileData, opts?: AddFileOptionss): this {
        const filePath = path.join(this.path, name);

        if (opts && typeof opts === 'object') {
            opts.mode = opts.mode ?? this.opts.fileMode;
        }

        this.commandGraph.push({ command: this.writeFileCommand(filePath, data, opts), children: [] });

        return this;
    }

    public build() {
        let queue = [...this.commandGraph];

        while (queue.length) {
            const nextLevel = [];
            for (let i = 0; i < queue.length; i++) {
                queue[i]!.command();
                nextLevel.push(...queue[i]!.children);
            }

            queue = nextLevel;
        }

        this.commandGraph = [];
    }

    private mkDirCommand(path: string, opts?: AddFolderOptions): MayonakaSyncCommand<void> {
        return () => {
            mkdirSync(path, { recursive: true, mode: opts?.mode });
        };
    }

    private writeFileCommand(path: string, data: () => SyncFileData, opts?: AddFileOptionss): MayonakaSyncCommand<void> {
        return () => {
            const fileData = data();
            writeFileSync(path, fileData, opts);
        };
    }
}
