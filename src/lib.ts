import type { MakeDirectoryOptions, WriteFileOptions } from 'node:fs';

export type AddFolderOptions = Omit<MakeDirectoryOptions, 'recursive'>;
export type AddFileOptions = WriteFileOptions;

export type AsyncCommand = () => Promise<void>;
export type SyncCommand = () => void;

export type CommandNode<TCommand> = {
    command: TCommand;
    children: CommandNode<TCommand>[];
};

export function chunk<T>(arr: T[], size: number): T[][] {
    const result: T[][] = [];
    for (let x = 0; x < Math.ceil(arr.length / size); x++) {
        const start = x * size;
        const end = start + size;
        result.push(arr.slice(start, end));
    }
    return result;
}

export async function executeGraphAsync(graph: CommandNode<AsyncCommand>[], maxConcurrency?: number): Promise<void> {
    let queue = [...graph];
    while (queue.length) {
        const currentLevel = queue.map(node => node.command());
        const nextLevel = queue.flatMap(node => node.children);

        if (maxConcurrency) {
            for (const batch of chunk(currentLevel, maxConcurrency)) {
                await Promise.all(batch);
            }
        } else {
            await Promise.all(currentLevel);
        }
        queue = nextLevel;
    }
}

export function executeGraphSync(graph: CommandNode<SyncCommand>[]): void {
    let queue = [...graph];
    while (queue.length) {
        for (const node of queue) {
            node.command();
        }
        queue = queue.flatMap(node => node.children);
    }
}
