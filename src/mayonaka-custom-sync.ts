import type { MayonakaSyncCommand } from './lib.js';

type MayonakaCustomSyncCommandNode = { command: MayonakaSyncCommand<void>; children: MayonakaCustomSyncCommandNode[] };

export class MayonakaCustomFolderSync<TFolder, TFile> {
    protected commandGraph: MayonakaCustomSyncCommandNode[];
    protected folder: TFolder | null = null;
    protected parentFolder: MayonakaCustomFolderSync<TFolder, TFile> | null = null;

    constructor(
        protected createFolderFn: (parentFolder: TFolder | null, data: any) => TFolder,
        protected createFileFn: (parentFolder: TFolder | null, data: any) => void,
    ) {
        this.commandGraph = [];
    }

    public addFolder(data: any, callback: (folder: MayonakaCustomFolderSync<TFolder, TFile>) => void): this {
        const subFolder = new MayonakaCustomFolderSync<TFolder, TFile>(this.createFolderFn, this.createFileFn);
        subFolder.parentFolder = this;
        const command = this.mkDirCommand(data, subFolder);
        callback(subFolder);
        const children = subFolder.commandGraph;
        this.commandGraph.push({ command, children });
        return this;
    }

    public addFile(dataProvider: () => TFile): this {
        this.commandGraph.push({ command: this.writeFileCommand(dataProvider), children: [] });
        return this;
    }

    private mkDirCommand(data: any, targetFolder: MayonakaCustomFolderSync<TFolder, TFile>): MayonakaSyncCommand<void> {
        return () => {
            const parentFolderData = targetFolder.parentFolder ? targetFolder.parentFolder.folder : null;
            targetFolder.folder = this.createFolderFn(parentFolderData, data);
        };
    }

    private writeFileCommand(dataProvider: () => TFile): MayonakaSyncCommand<void> {
        return () => {
            const fileData = dataProvider();
            this.createFileFn(this.folder, fileData);
        };
    }
}

export class MayonakaCustomSync<TFolder, TFile> extends MayonakaCustomFolderSync<TFolder, TFile> {
    constructor(
        root: TFolder | null,
        createFolderFn: (parentFolder: TFolder | null, data: any) => TFolder,
        createFileFn: (parentFolder: TFolder | null, data: any) => void,
    ) {
        super(createFolderFn, createFileFn);
        if (root) {
            this.folder = root;
        }
    }

    public build(): TFolder | null {
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

        return this.folder;
    }
}
