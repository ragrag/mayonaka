[**mayonaka**](README.md) • **Docs**

***

[mayonaka](README.md) / MayonakaFolder

# Class: MayonakaFolder

## Extends

- `MayonakaBase`

## Constructors

### new MayonakaFolder()

> **new MayonakaFolder**(`path`, `opts`?): [`MayonakaFolder`](Class.MayonakaFolder.md)

#### Parameters

• **path**: `string`

• **opts?**: [`MayonakaOptions`](TypeAlias.MayonakaOptions.md)

#### Returns

[`MayonakaFolder`](Class.MayonakaFolder.md)

#### Inherited from

`MayonakaBase.constructor`

#### Defined in

[mayonaka.ts:22](https://github.com/ragrag/mayonaka/blob/f312b51cd0f2fb638e213ba97aa230bf7c0be53a/src/mayonaka.ts#L22)

## Properties

### commandGraph

> `protected` **commandGraph**: `MayonakaCommandNode`[]

#### Inherited from

`MayonakaBase.commandGraph`

#### Defined in

[mayonaka.ts:20](https://github.com/ragrag/mayonaka/blob/f312b51cd0f2fb638e213ba97aa230bf7c0be53a/src/mayonaka.ts#L20)

***

### opts

> `protected` **opts**: [`MayonakaOptions`](TypeAlias.MayonakaOptions.md)

#### Inherited from

`MayonakaBase.opts`

#### Defined in

[mayonaka.ts:19](https://github.com/ragrag/mayonaka/blob/f312b51cd0f2fb638e213ba97aa230bf7c0be53a/src/mayonaka.ts#L19)

***

### path

> `protected` **path**: `string`

#### Inherited from

`MayonakaBase.path`

#### Defined in

[mayonaka.ts:18](https://github.com/ragrag/mayonaka/blob/f312b51cd0f2fb638e213ba97aa230bf7c0be53a/src/mayonaka.ts#L18)

## Methods

### addFile()

> **addFile**(`name`, `data`, `opts`?): `this`

#### Parameters

• **name**: `string`

• **data**

• **opts?**: `WriteFileOptions`

#### Returns

`this`

#### Inherited from

`MayonakaBase.addFile`

#### Defined in

[mayonaka.ts:55](https://github.com/ragrag/mayonaka/blob/f312b51cd0f2fb638e213ba97aa230bf7c0be53a/src/mayonaka.ts#L55)

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

`MayonakaBase.addFolder`

##### Defined in

[mayonaka.ts:32](https://github.com/ragrag/mayonaka/blob/f312b51cd0f2fb638e213ba97aa230bf7c0be53a/src/mayonaka.ts#L32)

#### addFolder(name, opts)

> **addFolder**(`name`, `opts`?): `this`

##### Parameters

• **name**: `string`

• **opts?**: `AddFolderOptions`

##### Returns

`this`

##### Inherited from

`MayonakaBase.addFolder`

##### Defined in

[mayonaka.ts:33](https://github.com/ragrag/mayonaka/blob/f312b51cd0f2fb638e213ba97aa230bf7c0be53a/src/mayonaka.ts#L33)
