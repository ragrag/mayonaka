<div align="center">

<img src="https://github.com/user-attachments/assets/1d00dcf1-f760-4741-bdfc-1af010a05b68" alt="aimer-after-dark" height="300">

Art by [KyasarinHagaren](https://www.reddit.com/user/KyasarinHagaren)

</div>

## About

**mayonaka** _(ma-yo-na-ka)_ is a flexible folder builder for javascript runtimes. It provides a very minimal yet fluent builder interface on top of the familiar node:fs API and concurrency control

## Example

Creating a similar directory with mayonaka

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
  .addFolder("foo")
  .addFolder("bar", (bar) => {
    bar.addFolder("qux", (qux) => {
      qux
        .addFolder("quux")
        .addFile("readable.txt",async () => Readable.from(["mayonaka"]), "utf-8")
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
