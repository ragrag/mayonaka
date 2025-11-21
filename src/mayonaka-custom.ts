import { MayonakaCommand, chunk } from './lib.js';

export type MayonakaCustomOptions = {
    maxConcurrency?: number;
};

type MayonakaCommandNode = { command: MayonakaCommand<void>; children: MayonakaCommandNode[] };

export class MayonakaCustomFolder<TFolder, TFile, TFolderData, TFileData> {
    protected opts: MayonakaCustomOptions;
    protected commandGraph: MayonakaCommandNode[];
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
        const command = this.mkDirCommand(data, subFolder);
        callback(subFolder);
        const children = subFolder.commandGraph;
        this.commandGraph.push({ command, children });
        return this;
    }

    public addFile(dataProvider: () => Promise<TFileData>): this {
        this.commandGraph.push({ command: this.writeFileCommand(dataProvider), children: [] });
        return this;
    }

    private mkDirCommand(data: TFolderData, targetFolder: MayonakaCustomFolder<TFolder, TFile, TFolderData, TFileData>): MayonakaCommand<void> {
        return new MayonakaCommand(async (resolve, reject) => {
            try {
                const parentFolderData = targetFolder.parentFolder ? targetFolder.parentFolder.folder : null;
                targetFolder.folder = await this.createFolderFn(parentFolderData, data);
                resolve();
            } catch (err) {
                reject(err);
            }
        });
    }

    private writeFileCommand(dataProvider: () => Promise<any>): MayonakaCommand<void> {
        return new MayonakaCommand(async (resolve, reject) => {
            try {
                const fileData = await dataProvider();
                await this.createFileFn(this.folder, fileData);
                resolve();
            } catch (err) {
                reject(err);
            }
        });
    }
}

export class MayonakaCustom<TFolder, TFile, TFolderData, TFileData> extends MayonakaCustomFolder<TFolder, TFile, TFolderData, TFileData> {
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

        return this.folder;
    }
}
