import { type AsyncCommand, type CommandNode, executeGraphAsync } from './lib.js';

export type MayonakaCustomOptions = {
    maxConcurrency?: number;
};

export class MayonakaCustomFolder<TFolder, TFile, TFolderData, TFileData> {
    protected opts: MayonakaCustomOptions;
    protected commandGraph: CommandNode<AsyncCommand>[];
    protected folder: TFolder | null = null;
    protected parentFolder: MayonakaCustomFolder<TFolder, TFile, TFolderData, TFileData> | null = null;

    constructor(
        protected createFolderFn: (parentFolder: TFolder | null, data: TFolderData) => Promise<TFolder>,
        protected createFileFn: (parentFolder: TFolder | null, data: TFileData) => Promise<void>,
        opts?: MayonakaCustomOptions,
    ) {
        this.opts = {
            maxConcurrency: opts?.maxConcurrency && typeof opts.maxConcurrency === 'number' ? Math.max(1, opts.maxConcurrency) : undefined,
        };
        this.commandGraph = [];
    }

    public addFolder(data: TFolderData, callback: (folder: MayonakaCustomFolder<TFolder, TFile, TFolderData, TFileData>) => void): this {
        const subFolder = new MayonakaCustomFolder<TFolder, TFile, TFolderData, TFileData>(this.createFolderFn, this.createFileFn);
        subFolder.parentFolder = this;

        const command = this.createMkDirCommand(data, subFolder);
        callback(subFolder);

        this.commandGraph.push({ command, children: subFolder.commandGraph });
        return this;
    }

    public addFile(dataProvider: () => Promise<TFileData>): this {
        this.commandGraph.push({
            command: this.createWriteFileCommand(dataProvider),
            children: [],
        });
        return this;
    }

    private createMkDirCommand(data: TFolderData, targetFolder: MayonakaCustomFolder<TFolder, TFile, TFolderData, TFileData>): AsyncCommand {
        return async () => {
            const parentFolderData = targetFolder.parentFolder ? targetFolder.parentFolder.folder : null;
            targetFolder.folder = await this.createFolderFn(parentFolderData, data);
        };
    }

    private createWriteFileCommand(dataProvider: () => Promise<TFileData>): AsyncCommand {
        return async () => {
            const fileData = await dataProvider();
            await this.createFileFn(this.folder, fileData);
        };
    }
}

// Main MayonakaCustom class with build method
export class MayonakaCustom<TFolder, TFile, TFolderData = any, TFileData = any> extends MayonakaCustomFolder<TFolder, TFile, TFolderData, TFileData> {
    constructor(
        root: TFolder | null,
        createFolderFn: (parentFolder: TFolder | null, data: TFolderData) => Promise<TFolder>,
        createFileFn: (parentFolder: TFolder | null, data: TFileData) => Promise<void>,
        opts?: MayonakaCustomOptions,
    ) {
        super(createFolderFn, createFileFn, opts);
        if (root) {
            this.folder = root;
        }
    }

    public async build(): Promise<TFolder | null> {
        await executeGraphAsync(this.commandGraph, this.opts.maxConcurrency);
        this.commandGraph = [];
        return this.folder;
    }
}
