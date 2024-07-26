[**mayonaka**](README.md) • **Docs**

***

[mayonaka](README.md) / MayonakaSync

# Class: MayonakaSync

## Extends

- `MayonakaSyncBase`

## Constructors

### new MayonakaSync()

> **new MayonakaSync**(`path`, `opts`?): [`MayonakaSync`](Class.MayonakaSync.md)

#### Parameters

• **path**: `string`

• **opts?**: [`MayonakaSyncOptions`](TypeAlias.MayonakaSyncOptions.md)

#### Returns

[`MayonakaSync`](Class.MayonakaSync.md)

#### Inherited from

`MayonakaSyncBase.constructor`

#### Defined in

[mayonaka-sync.ts:20](https://github.com/ragrag/mayonaka/blob/f312b51cd0f2fb638e213ba97aa230bf7c0be53a/src/mayonaka-sync.ts#L20)

## Properties

### commandGraph

> `protected` **commandGraph**: `MayonakaSyncCommandNode`[]

#### Inherited from

`MayonakaSyncBase.commandGraph`

#### Defined in

[mayonaka-sync.ts:18](https://github.com/ragrag/mayonaka/blob/f312b51cd0f2fb638e213ba97aa230bf7c0be53a/src/mayonaka-sync.ts#L18)

***

### opts

> `protected` **opts**: [`MayonakaSyncOptions`](TypeAlias.MayonakaSyncOptions.md)

#### Inherited from

`MayonakaSyncBase.opts`

#### Defined in

[mayonaka-sync.ts:17](https://github.com/ragrag/mayonaka/blob/f312b51cd0f2fb638e213ba97aa230bf7c0be53a/src/mayonaka-sync.ts#L17)

***

### path

> `protected` **path**: `string`

#### Inherited from

`MayonakaSyncBase.path`

#### Defined in

[mayonaka-sync.ts:16](https://github.com/ragrag/mayonaka/blob/f312b51cd0f2fb638e213ba97aa230bf7c0be53a/src/mayonaka-sync.ts#L16)

## Methods

### addFile()

> **addFile**(`name`, `data`, `opts`?): [`MayonakaSyncfolder`](Class.MayonakaSyncfolder.md)

#### Parameters

• **name**: `string`

• **data**

• **opts?**: `WriteFileOptions`

#### Returns

[`MayonakaSyncfolder`](Class.MayonakaSyncfolder.md)

#### Inherited from

`MayonakaSyncBase.addFile`

#### Defined in

[mayonaka-sync.ts:52](https://github.com/ragrag/mayonaka/blob/f312b51cd0f2fb638e213ba97aa230bf7c0be53a/src/mayonaka-sync.ts#L52)

***

### addFolder()

#### addFolder(name, folder, opts)

> **addFolder**(`name`, `folder`, `opts`?): `this`

##### Parameters

• **name**: `string`

• **folder**

• **opts?**: `AddFolderOptions`

##### Returns

`this`

##### Inherited from

`MayonakaSyncBase.addFolder`

##### Defined in

[mayonaka-sync.ts:29](https://github.com/ragrag/mayonaka/blob/f312b51cd0f2fb638e213ba97aa230bf7c0be53a/src/mayonaka-sync.ts#L29)

#### addFolder(name, opts)

> **addFolder**(`name`, `opts`?): `this`

##### Parameters

• **name**: `string`

• **opts?**: `AddFolderOptions`

##### Returns

`this`

##### Inherited from

`MayonakaSyncBase.addFolder`

##### Defined in

[mayonaka-sync.ts:30](https://github.com/ragrag/mayonaka/blob/f312b51cd0f2fb638e213ba97aa230bf7c0be53a/src/mayonaka-sync.ts#L30)

***

### build()

> **build**(): `object`

#### Returns

`object`

##### path

> **path**: `string`

#### Defined in

[mayonaka-sync.ts:81](https://github.com/ragrag/mayonaka/blob/f312b51cd0f2fb638e213ba97aa230bf7c0be53a/src/mayonaka-sync.ts#L81)
