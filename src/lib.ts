import type { MakeDirectoryOptions, WriteFileOptions } from 'node:fs';

export type MayonakaSyncCommand<T> = () => T;

// MayonakaCommand is a lazily evaluated promise that only gets executed when awaited
export class MayonakaCommand<T> {
    executor: (resolve: (value: T) => void, reject: (reason?: any) => void) => void;
    promise: Promise<T> | null;

    constructor(executor: MayonakaCommand<T>['executor']) {
        this.executor = executor;
        this.promise = null;
    }
    then(onfulfilled: ((value: T) => T | PromiseLike<T>) | null | undefined, onrejected: ((reason: any) => PromiseLike<never>) | null | undefined) {
        this.initPromise();
        return this.promise?.then(onfulfilled, onrejected);
    }
    catch(onrejected: ((reason: any) => PromiseLike<never>) | null | undefined) {
        this.initPromise();
        return this.promise?.catch(onrejected);
    }
    finally(onfinally: (() => void) | null | undefined) {
        this.initPromise();
        return this.promise?.finally(onfinally);
    }
    initPromise() {
        if (!this.promise) {
            this.promise = new Promise<T>(this.executor);
        }
    }
}

export type AddFolderOptions = Omit<MakeDirectoryOptions, 'recursive'>;
export type AddFileOptions = WriteFileOptions;

export function chunk(arr: any[], size: number) {
    const result = [];
    for (let x = 0; x < Math.ceil(arr.length / size); x++) {
        const start = x * size;
        const end = start + size;
        result.push(arr.slice(start, end));
    }
    return result;
}
