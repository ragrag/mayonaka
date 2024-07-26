[**mayonaka**](../README.md) • **Docs**

***

[mayonaka](../globals.md) / Mayonaka

# Class: Mayonaka\<TIsSubFolder\>

## Type Parameters

• **TIsSubFolder** = `unknown`

## Constructors

### new Mayonaka()

> **new Mayonaka**\<`TIsSubFolder`\>(`path`, `opts`?): [`Mayonaka`](Mayonaka.md)\<`TIsSubFolder`\>

#### Parameters

• **path**: `string`

• **opts?**: [`MayonakaOptions`](../type-aliases/MayonakaOptions.md)

#### Returns

[`Mayonaka`](Mayonaka.md)\<`TIsSubFolder`\>

#### Defined in

[index.ts:36](https://github.com/ragrag/mayonaka/blob/a21e7ebab315bcbc9eab5cb5b0fc20e1590ca754/src/index.ts#L36)

## Methods

### addFile()

> **addFile**(`name`, `data`, `opts`?): `TIsSubFolder` *extends* `true` ? [`Folder`](../type-aliases/Folder.md) : [`Mayonaka`](Mayonaka.md)\<`TIsSubFolder`\>

#### Parameters

• **name**: `string`

• **data**

• **opts?**: `WriteFileOptions`

#### Returns

`TIsSubFolder` *extends* `true` ? [`Folder`](../type-aliases/Folder.md) : [`Mayonaka`](Mayonaka.md)\<`TIsSubFolder`\>

#### Defined in

[index.ts:73](https://github.com/ragrag/mayonaka/blob/a21e7ebab315bcbc9eab5cb5b0fc20e1590ca754/src/index.ts#L73)

***

### addFolder()

#### addFolder(name, folder, opts)

> **addFolder**(`name`, `folder`, `opts`?): `TIsSubFolder` *extends* `true` ? [`Folder`](../type-aliases/Folder.md) : [`Mayonaka`](Mayonaka.md)\<`TIsSubFolder`\>

##### Parameters

• **name**: `string`

• **folder**

• **opts?**: [`AddFolderOptions`](../type-aliases/AddFolderOptions.md)

##### Returns

`TIsSubFolder` *extends* `true` ? [`Folder`](../type-aliases/Folder.md) : [`Mayonaka`](Mayonaka.md)\<`TIsSubFolder`\>

##### Defined in

[index.ts:46](https://github.com/ragrag/mayonaka/blob/a21e7ebab315bcbc9eab5cb5b0fc20e1590ca754/src/index.ts#L46)

#### addFolder(name, opts)

> **addFolder**(`name`, `opts`?): `TIsSubFolder` *extends* `true` ? [`Folder`](../type-aliases/Folder.md) : [`Mayonaka`](Mayonaka.md)\<`TIsSubFolder`\>

##### Parameters

• **name**: `string`

• **opts?**: [`AddFolderOptions`](../type-aliases/AddFolderOptions.md)

##### Returns

`TIsSubFolder` *extends* `true` ? [`Folder`](../type-aliases/Folder.md) : [`Mayonaka`](Mayonaka.md)\<`TIsSubFolder`\>

##### Defined in

[index.ts:47](https://github.com/ragrag/mayonaka/blob/a21e7ebab315bcbc9eab5cb5b0fc20e1590ca754/src/index.ts#L47)

***

### build()

> **build**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Defined in

[index.ts:85](https://github.com/ragrag/mayonaka/blob/a21e7ebab315bcbc9eab5cb5b0fc20e1590ca754/src/index.ts#L85)
