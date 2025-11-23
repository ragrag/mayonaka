<div align="center">

<img src="https://github.com/user-attachments/assets/1d00dcf1-f760-4741-bdfc-1af010a05b68" alt="aimer-after-dark" height="300">

Art by [KyasarinHagaren](https://www.reddit.com/user/KyasarinHagaren)

</div>

## About

**mayonaka 🌃** _(ma-yo-na-ka)_ is a flexible folder builder for javascript runtimes. It provides a very minimal yet fluent builder interface on top of the familiar node:fs API with concurrency control

## API Reference: [https://ragrag.github.io/mayonaka](https://ragrag.github.io/mayonaka)

### Installing

```base
npm install mayonaka
```

### Examples

#### Creating a similar directory with mayonaka

```plaintext
.
├── foo
├── bar
│   └── qux
│       ├── quux
│       ├── readable.txt
│       ├── string.txt
│       └── iterable.txt
└── baz
```

```typescript
import { Mayonaka } from "mayonaka";
import { Readable } from "node:stream";

await new Mayonaka(__dirname)
  // similar to fs.mkdir
  .addFolder("foo")
  .addFolder("bar", (bar) => {
    bar.addFolder("qux", (qux) => {
      qux
        .addFolder("quux")
        // similar to fs.writeFile but data from an async source
        .addFile(
          "readable.txt",
          async () => Readable.from(["mayonaka"]),
          "utf-8"
        )
        .addFile("string.txt", async () => "mayonaka", "utf-8")
        .addFile("iterable.txt", async () => iterable(), "utf-8");
    });
  })
  .addFolder("baz")
  .build();

function* iterable() {
  const strings = ["m", "a", "y", "o", "n", "a", "k", "a"];
  for (const str of strings) {
    yield str;
  }
}
```

---

#### Concurrency control

```typescript
import { Mayonaka } from "mayonaka";

await new Mayonaka(__dirname, { maxConcurrency: 50 })
  .addFolder("foo")
  .addFolder("bar", (bar) => {
    for (let i = 0; i < 1000; i++) {
      bar.addFile(`${i}.txt`, async () => expensive(i), "utf-8");
    }
  })
  .build();
```

---

#### Access permissions

```typescript
import { MayonakaSync } from "mayonaka";

// global access permissions
new MayonakaSync(__dirname, { dirMode: 0o744, fileMode: 0o766 })
  // local access permissions, overriding global permissions
  .addFolder("foo", { mode: 0o777 })
  .addFolder("bar", (bar) => {
    bar.addFile("mayonaka.txt", () => "mayonaka 🌃", "utf-8");
  })
  .addFile("baz.txt", () => "baz", "utf-8", { mode: 0o777 })
  .build();
```

#### Using MayonakaCustom with custom creation functions

```typescript
import { MayonakaCustom } from "mayonaka";
import BoxSDK from 'box-node-sdk';

const sdk = new BoxSDK({
    clientID: 'your_client_id',
    clientSecret: 'your_client_secret'
});
const client = sdk.getBasicClient('user_access_token');

type BoxFolder = {
    id: string;
    name: string;
};

type BoxFile = {
    id: string;
    name: string;
};

const structure = await new MayonakaCustom<BoxFolder, BoxFile>(
    { id: '0', name: 'root' },
    async (parent, data: { name: string }) => {
        const folder = await client.folders.create(parent.id, data.name);
        return { id: folder.id, name: folder.name };
    },
    async (parent, fileData: { name: string; content: Buffer }) => {
        const file = await client.files.uploadFile(
            parent.id,
            fileData.name,
            fileData.content
        );
        return { id: file.entries[0].id, name: file.entries[0].name };
})
.addFolder({ name: 'Documents' }, docs => {
    docs.addFile(async () => ({
        name: 'report.pdf',
        content: Buffer.from('PDF content here')
    }));
})
.addFolder({ name: 'Images' }, images => {
    images.addFile(async () => ({
        name: 'photo.jpg',
        content: Buffer.from('JPEG data')
    }));
})
.build();
```
