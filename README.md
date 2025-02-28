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
│       ├── buffer.txt
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
        .addFile("buffer.txt", async () => Buffer.from("mayonaka"), "utf-8")
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


type Folder = { name: string; children: (Folder | File)[] };
type File = number;

const structure = await new MayonakaCustom<Folder, File>(
    // initial root or null
    { name: 'root', children: [] },
    // custom folder creation function
    async (parentFolder, data) => {
        const folder = { name: data.name, children: [] };
        if (parentFolder) {
            parentFolder.children.push(folder);
        }
        return folder;
    },
    // Custom file creation function
    async (parentFolder, content) => {
        if (parentFolder) {
            parentFolder.children.push(content);
        }
    },
)
    .addFile(async () => 'readme.txt')
    .addFolder({ name: 'docs' }, docs => {
        docs.addFolder({ name: 'images' }, images => {
            images.addFile(async () => 'photo.jpg');
        });
    })
    .build();
```