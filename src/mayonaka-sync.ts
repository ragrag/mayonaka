import type { Mode } from 'node:fs';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import type { AddFileOptions, AddFolderOptions, MayonakaSyncCommand } from './lib.js';

export type MayonakaSyncOptions = {
    dirMode?: Mode;
    fileMode?: Mode;
};

export type SyncFileData = string | NodeJS.ArrayBufferView;

type MayonakaSyncCommandNode = { command: MayonakaSyncCommand<void>; children: MayonakaSyncCommandNode[] };

export class MayonakaSyncfolder {
    protected path: string;
    protected opts: MayonakaSyncOptions;
    protected commandGraph: MayonakaSyncCommandNode[];

    constructor(path: string, opts?: MayonakaSyncOptions) {
        this.path = path;
        this.opts = {
            dirMode: opts?.dirMode ?? 0o777,
            fileMode: opts?.fileMode ?? 0o666,
        };
        this.commandGraph = [];
    }

    public addFolder(name: string, folder: (folder: MayonakaSyncfolder) => void, opts?: AddFolderOptions): this;
    public addFolder(name: string, opts?: AddFolderOptions): this;
    public addFolder(name: string, folderOrOpts?: ((folder: MayonakaSyncfolder) => void) | AddFolderOptions, opts?: AddFolderOptions): this {
        const folderPath = path.join(this.path, name);

        if (typeof folderOrOpts === 'function') {
            const mode = opts?.mode ?? this.opts.dirMode;
            const command = this.mkDirCommand(folderPath, { mode });

            const subFolder = new MayonakaSyncfolder(folderPath, this.opts);
            folderOrOpts(subFolder);
            const children = subFolder.commandGraph;

            this.commandGraph.push({ command, children });
        } else {
            const mode = folderOrOpts?.mode ?? this.opts.dirMode;
            const command = this.mkDirCommand(folderPath, { mode });
            this.commandGraph.push({ command, children: [] });
        }

        return this as any;
    }

    public addFile(name: string, data: () => SyncFileData, opts?: AddFileOptions): MayonakaSyncfolder {
        const filePath = path.join(this.path, name);

        if (opts && typeof opts === 'object') {
            opts.mode = opts.mode ?? this.opts.fileMode;
        }

        this.commandGraph.push({ command: this.writeFileCommand(filePath, data, opts), children: [] });

        return this as any;
    }

    private mkDirCommand(path: string, opts?: AddFolderOptions): MayonakaSyncCommand<void> {
        return () => {
            mkdirSync(path, { recursive: true, mode: opts?.mode });
        };
    }

    private writeFileCommand(path: string, data: () => SyncFileData, opts?: AddFileOptions): MayonakaSyncCommand<void> {
        return () => {
            const fileData = data();
            writeFileSync(path, fileData, opts);
        };
    }
}

export class MayonakaSync extends MayonakaSyncfolder {
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

        return { path: this.path };
    }
}
