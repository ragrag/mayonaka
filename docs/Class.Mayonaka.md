[**mayonaka**](README.md) • **Docs**

***

[mayonaka](README.md) / Mayonaka

# Class: Mayonaka

## Extends

- `MayonakaBase`

## Constructors

### new Mayonaka()

> **new Mayonaka**(`path`, `opts`?): [`Mayonaka`](Class.Mayonaka.md)

#### Parameters

• **path**: `string`

• **opts?**: [`MayonakaOptions`](TypeAlias.MayonakaOptions.md)

#### Returns

[`Mayonaka`](Class.Mayonaka.md)

#### Inherited from

`MayonakaBase.constructor`

#### Defined in

mayonaka.ts:22

## Properties

### commandGraph

> `protected` **commandGraph**: `MayonakaCommandNode`[]

#### Inherited from

`MayonakaBase.commandGraph`

#### Defined in

mayonaka.ts:20

***

### opts

> `protected` **opts**: [`MayonakaOptions`](TypeAlias.MayonakaOptions.md)

#### Inherited from

`MayonakaBase.opts`

#### Defined in

mayonaka.ts:19

***

### path

> `protected` **path**: `string`

#### Inherited from

`MayonakaBase.path`

#### Defined in

mayonaka.ts:18

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

mayonaka.ts:55

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

mayonaka.ts:32

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

mayonaka.ts:33

***

### build()

> **build**(): `Promise`\<`object`\>

#### Returns

`Promise`\<`object`\>

##### path

> **path**: `string`

#### Defined in

mayonaka.ts:100
