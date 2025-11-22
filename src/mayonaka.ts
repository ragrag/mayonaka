import { type Mode, createWriteStream } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { Stream } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { type AddFileOptions, type AddFolderOptions, type AsyncCommand, type CommandNode, executeGraphAsync } from './lib.js';

export type MayonakaOptions = {
    dirMode?: Mode;
    fileMode?: Mode;
    maxConcurrency?: number;
};

export type FileData =
    | string
    | NodeJS.ArrayBufferView
    | Iterable<string | NodeJS.ArrayBufferView>
    | AsyncIterable<string | NodeJS.ArrayBufferView>
    | Stream
    | undefined
    | null;

export class MayonakaFolder {
    protected path: string;
    protected opts: MayonakaOptions;
    protected commandGraph: CommandNode<AsyncCommand>[];

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
        const folderPath = path.join(this.path, name.replace(/[/\\]/g, '_'));

        if (typeof folderOrOpts === 'function') {
            const mode = opts?.mode ?? this.opts.dirMode;
            const command = this.createMkDirCommand(folderPath, { mode });

            const subFolder = new MayonakaFolder(folderPath, this.opts);
            folderOrOpts(subFolder);
            const children = subFolder.commandGraph;

            this.commandGraph.push({ command, children });
        } else {
            const mode = folderOrOpts?.mode ?? this.opts.dirMode;
            const command = this.createMkDirCommand(folderPath, { mode });
            this.commandGraph.push({ command, children: [] });
        }

        return this;
    }

    public addFile(name: string, data: () => Promise<FileData>, opts?: AddFileOptions): this {
        const filePath = path.join(this.path, name.replace(/[/\\]/g, '_'));

        if (opts && typeof opts === 'object') {
            opts.mode = opts.mode ?? this.opts.fileMode;
        }

        this.commandGraph.push({
            command: this.createWriteFileCommand(filePath, data, opts),
            children: [],
        });

        return this;
    }

    private createMkDirCommand(dirPath: string, opts?: AddFolderOptions): AsyncCommand {
        return async () => {
            await mkdir(dirPath, { recursive: true, mode: opts?.mode ?? this.opts.dirMode });
        };
    }

    private createWriteFileCommand(filePath: string, data: () => Promise<FileData>, opts?: AddFileOptions): AsyncCommand {
        return async () => {
            const fileData = await data();
            if (!fileData) {
                return;
            }

            if (fileData instanceof Stream.Readable) {
                const writeStream = createWriteStream(
                    filePath,
                    opts && typeof opts === 'string'
                        ? { encoding: opts }
                        : opts && typeof opts === 'object'
                          ? {
                                flush: opts.flush,
                                signal: opts.signal,
                                flags: opts.flag,
                                mode: typeof opts.mode === 'string' ? +opts.mode : opts.mode,
                            }
                          : {},
                );
                await pipeline(fileData, writeStream);
            } else {
                await writeFile(filePath, fileData, opts);
            }
        };
    }
}

export class Mayonaka extends MayonakaFolder {
    public async build() {
        await executeGraphAsync(this.commandGraph, this.opts.maxConcurrency);
        this.commandGraph = [];
        return { path: this.path };
    }
}
