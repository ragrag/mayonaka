import { type CommandNode, type SyncCommand, executeGraphSync } from './lib.js';

export class MayonakaCustomFolderSync<TFolder, TFile> {
    protected commandGraph: CommandNode<SyncCommand>[];
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

        const command = this.createMkDirCommand(data, subFolder);
        callback(subFolder);

        this.commandGraph.push({ command, children: subFolder.commandGraph });
        return this;
    }

    public addFile(dataProvider: () => TFile): this {
        this.commandGraph.push({
            command: this.createWriteFileCommand(dataProvider),
            children: [],
        });
        return this;
    }

    private createMkDirCommand(data: any, targetFolder: MayonakaCustomFolderSync<TFolder, TFile>): SyncCommand {
        return () => {
            const parentFolderData = targetFolder.parentFolder ? targetFolder.parentFolder.folder : null;
            targetFolder.folder = this.createFolderFn(parentFolderData, data);
        };
    }

    private createWriteFileCommand(dataProvider: () => TFile): SyncCommand {
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
        executeGraphSync(this.commandGraph);
        this.commandGraph = [];
        return this.folder;
    }
}
