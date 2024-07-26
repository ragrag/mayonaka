[**mayonaka**](../README.md) • **Docs**

***

[mayonaka](../globals.md) / MayonakaSync

# Class: MayonakaSync\<TIsSubFolder\>

## Type Parameters

• **TIsSubFolder** = `unknown`

## Constructors

### new MayonakaSync()

> **new MayonakaSync**\<`TIsSubFolder`\>(`path`, `opts`?): [`MayonakaSync`](MayonakaSync.md)\<`TIsSubFolder`\>

#### Parameters

• **path**: `string`

• **opts?**: [`MayonakaSyncOptions`](../type-aliases/MayonakaSyncOptions.md)

#### Returns

[`MayonakaSync`](MayonakaSync.md)\<`TIsSubFolder`\>

#### Defined in

[index.ts:145](https://github.com/ragrag/mayonaka/blob/a21e7ebab315bcbc9eab5cb5b0fc20e1590ca754/src/index.ts#L145)

## Methods

### addFile()

> **addFile**(`name`, `data`, `opts`?): `TIsSubFolder` *extends* `true` ? [`SyncFolder`](../type-aliases/SyncFolder.md) : [`MayonakaSync`](MayonakaSync.md)\<`TIsSubFolder`\>

#### Parameters

• **name**: `string`

• **data**

• **opts?**: `WriteFileOptions`

#### Returns

`TIsSubFolder` *extends* `true` ? [`SyncFolder`](../type-aliases/SyncFolder.md) : [`MayonakaSync`](MayonakaSync.md)\<`TIsSubFolder`\>

#### Defined in

[index.ts:181](https://github.com/ragrag/mayonaka/blob/a21e7ebab315bcbc9eab5cb5b0fc20e1590ca754/src/index.ts#L181)

***

### addFolder()

#### addFolder(name, folder, opts)

> **addFolder**(`name`, `folder`, `opts`?): `TIsSubFolder` *extends* `true` ? [`SyncFolder`](../type-aliases/SyncFolder.md) : [`MayonakaSync`](MayonakaSync.md)\<`TIsSubFolder`\>

##### Parameters

• **name**: `string`

• **folder**

• **opts?**: [`AddFolderOptions`](../type-aliases/AddFolderOptions.md)

##### Returns

`TIsSubFolder` *extends* `true` ? [`SyncFolder`](../type-aliases/SyncFolder.md) : [`MayonakaSync`](MayonakaSync.md)\<`TIsSubFolder`\>

##### Defined in

[index.ts:154](https://github.com/ragrag/mayonaka/blob/a21e7ebab315bcbc9eab5cb5b0fc20e1590ca754/src/index.ts#L154)

#### addFolder(name, opts)

> **addFolder**(`name`, `opts`?): `TIsSubFolder` *extends* `true` ? [`SyncFolder`](../type-aliases/SyncFolder.md) : [`MayonakaSync`](MayonakaSync.md)\<`TIsSubFolder`\>

##### Parameters

• **name**: `string`

• **opts?**: [`AddFolderOptions`](../type-aliases/AddFolderOptions.md)

##### Returns

`TIsSubFolder` *extends* `true` ? [`SyncFolder`](../type-aliases/SyncFolder.md) : [`MayonakaSync`](MayonakaSync.md)\<`TIsSubFolder`\>

##### Defined in

[index.ts:155](https://github.com/ragrag/mayonaka/blob/a21e7ebab315bcbc9eab5cb5b0fc20e1590ca754/src/index.ts#L155)

***

### build()

> **build**(): `void`

#### Returns

`void`

#### Defined in

[index.ts:193](https://github.com/ragrag/mayonaka/blob/a21e7ebab315bcbc9eab5cb5b0fc20e1590ca754/src/index.ts#L193)
