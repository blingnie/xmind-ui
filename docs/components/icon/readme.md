### Usage:
To use the icon component, pass the name of the icon you want to use.
If you want to *preserve* the color regardless of appearance changes, pass the `color` prop.

### Demo page:
/icons-demo` in development environment

or https://test.xmind.ai/icons-demo in test environment

#### Example:
```
<icon name="arrow-left" width="24" height="24" color="#000" />
```

#### Adding new icons:
1. Add the SVG icon to the `fw-icons` folder.
2. Add the icon name and corresponding import function to the `icons.ts` file.

#### Note:
If the icon needs to change according to the appearance, modify the SVG file content with the fill & stroke attributes to use the `currentColor` CSS variable.
