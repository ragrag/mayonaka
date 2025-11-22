import type { Mode } from 'node:fs';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { type AddFileOptions, type AddFolderOptions, type CommandNode, type SyncCommand, executeGraphSync } from './lib.js';

export type MayonakaSyncOptions = {
    dirMode?: Mode;
    fileMode?: Mode;
};

export type SyncFileData = string | NodeJS.ArrayBufferView | undefined | null;

export class MayonakaSyncfolder {
    protected path: string;
    protected opts: MayonakaSyncOptions;
    protected commandGraph: CommandNode<SyncCommand>[];

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
        const folderPath = path.join(this.path, name.replace(/[/\\]/g, '_'));

        if (typeof folderOrOpts === 'function') {
            const mode = opts?.mode ?? this.opts.dirMode;
            const command = this.createMkDirCommand(folderPath, { mode });

            const subFolder = new MayonakaSyncfolder(folderPath, this.opts);
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

    public addFile(name: string, data: () => SyncFileData, opts?: AddFileOptions): this {
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

    private createMkDirCommand(dirPath: string, opts?: AddFolderOptions): SyncCommand {
        return () => {
            mkdirSync(dirPath, { recursive: true, mode: opts?.mode });
        };
    }

    private createWriteFileCommand(filePath: string, data: () => SyncFileData, opts?: AddFileOptions): SyncCommand {
        return () => {
            const fileData = data();
            if (fileData) {
                writeFileSync(filePath, fileData, opts);
            }
        };
    }
}

export class MayonakaSync extends MayonakaSyncfolder {
    public build() {
        executeGraphSync(this.commandGraph);
        this.commandGraph = [];
        return { path: this.path };
    }
}
