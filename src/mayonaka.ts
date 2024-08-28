import type { Mode } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { Stream } from 'node:stream';
import { type AddFileOptions, type AddFolderOptions, MayonakaCommand, chunk } from './lib.js';

export type MayonakaOptions = {
    dirMode?: Mode;
    fileMode?: Mode;
    maxConcurrency?: number;
};

export type FileData = string | NodeJS.ArrayBufferView | Iterable<string | NodeJS.ArrayBufferView> | AsyncIterable<string | NodeJS.ArrayBufferView> | Stream;

type MayonakaCommandNode = { command: MayonakaCommand<void>; children: MayonakaCommandNode[] };

export class MayonakaFolder {
    protected path: string;
    protected opts: MayonakaOptions;
    protected commandGraph: MayonakaCommandNode[];

    constructor(path: string, opts?: MayonakaOptions) {
        this.path = path;
        this.opts = {
            dirMode: opts?.dirMode ?? 0o777,
            fileMode: opts?.fileMode ?? 0o666,
            maxConcurrency: opts?.maxConcurrency && typeof opts.maxConcurrency === 'number' ? Math.max(1, opts.maxConcurrency) : undefined,
        };
        this.commandGraph = [];
    }

    public addFolder(name: string, folder: (folder: MayonakaFolder) => void, opts?: AddFolderOptions): this;
    public addFolder(name: string, opts?: AddFolderOptions): this;
    public addFolder(name: string, folderOrOpts?: ((folder: MayonakaFolder) => void) | AddFolderOptions, opts?: AddFolderOptions): this {
        const folderPath = path.join(this.path, name);

        if (typeof folderOrOpts === 'function') {
            const mode = opts?.mode ?? this.opts.dirMode;
            const command = this.mkDirCommand(folderPath, { mode });

            const subFolder = new MayonakaFolder(folderPath, this.opts);
            folderOrOpts(subFolder);
            const children = subFolder.commandGraph;

            this.commandGraph.push({ command, children });
        } else {
            const mode = folderOrOpts?.mode ?? this.opts.dirMode;
            const command = this.mkDirCommand(folderPath, { mode });
            this.commandGraph.push({ command, children: [] });
        }

        return this;
    }

    public addFile(name: string, data: () => Promise<FileData>, opts?: AddFileOptions): this {
        const filePath = path.join(this.path, name);

        if (opts && typeof opts === 'object') {
            opts.mode = opts.mode ?? this.opts.fileMode;
        }

        this.commandGraph.push({ command: this.writeFileCommand(filePath, data, opts), children: [] });

        return this;
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
        opts?: AddFileOptions,
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

export class Mayonaka extends MayonakaFolder {
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

        return { path: this.path };
    }
}
