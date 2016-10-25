A `FencedItemList` is a list of vertically arranged React elements which are
separated by horizontal lines (fences, hence its name). This component doesn't
add any margins or paddings, neither to itself nor to the individual items.

```react
<FencedItemList items={['first', <div>second</div>]} />
```

You can place the `Footnotes` element in the `FencedItemList`, and it will look
awesome. Or if you have plain links, you can use `FenceLink`:

```react
<FencedItemList items={[
  <FenceLink t={t} to='#'>Indikatoren dieses Kapitels</FenceLink>,
  <FenceLink t={t} to='#'>Externer Link</FenceLink>,
]} />
```

And it works on small screens, too! Even if the titles are unreasonably long.

```react|noSource,frame,span-2
<FencedItemList items={[
  <FenceLink t={t} to='#'>Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.</FenceLink>,
  <FenceLink t={t} to='#'>Externer Link</FenceLink>,
  <FenceLink t={t} to='#'>Sed diam nonumy eirmod tempor invidunt ut labore</FenceLink>,
]} />
```

```react|noSource,frame,span-4
<FencedItemList items={[
  <FenceLink t={t} to='#'>Indikatoren dieses Kapitels</FenceLink>,
  <FenceLink t={t} to='#'>Externer Link</FenceLink>,
]} />
```
